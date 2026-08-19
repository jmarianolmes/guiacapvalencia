import { and, asc, count, eq, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2";
import { desc } from 'drizzle-orm';
import { InsertUser, users, passwordResets, userAccessLogs, simulatorQuestions, repeatedQuestions, tricks, siglas, userSimulatorResults, userStudyProfiles } from "../drizzle/schema";
import { ENV } from './_core/env';
import { simulatorChapters } from '../shared/simulatorChapters';
import { classifySimulatorQuestion } from './chapterClassifier';
import { buildOfficialExamAnalysis } from './officialExamAnalysis';
import { buildStudyPlan } from './studyPlan';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;
type SimulatorQuestion = typeof simulatorQuestions.$inferSelect;
type ChapterQuestionIndex = Map<string, SimulatorQuestion[]>;
const CHAPTER_ATTEMPT_SIZE = 50;

const CHAPTER_CACHE_TTL_MS = 5 * 60 * 1000;
let chapterQuestionIndexCache: { createdAt: number; value: ChapterQuestionIndex } | null = null;
let chapterQuestionIndexPromise: Promise<ChapterQuestionIndex> | null = null;
const OFFICIAL_ANALYSIS_CACHE_TTL_MS = 5 * 60 * 1000;
let officialAnalysisCache: { createdAt: number; value: ReturnType<typeof buildOfficialExamAnalysis> } | null = null;

function isTiDbCloudUrl(connectionString: string) {
  try {
    return new URL(connectionString).hostname.endsWith("tidbcloud.com");
  } catch {
    return false;
  }
}

function createTiDbCloudPool(connectionString: string) {
  const url = new URL(connectionString);
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));

  return createPool({
    host: url.hostname,
    port: Number(url.port || "4000"),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    connectionLimit: 5,
    enableKeepAlive: true,
    ssl: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  });
}

// Lazily create the Drizzle instance so local tooling can run without a DB.
// TiDB Cloud Starter uses a public endpoint and requires TLS.
export async function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!_db && connectionString) {
    try {
      if (isTiDbCloudUrl(connectionString)) {
        _pool = createTiDbCloudPool(connectionString);
        _db = drizzle(_pool);
      } else {
        _db = drizzle(connectionString);
      }
    } catch (error) {
      console.warn("[Database] Failed to configure connection:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

function hasLostDatabaseConnection(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /connection lost|server closed the connection|econnreset|connection reset/i.test(message);
}

async function withSimulatorDbRetry<T>(operation: (db: NonNullable<typeof _db>) => Promise<T>) {
  const activeDb = await getDb();
  if (!activeDb) throw new Error('Database connection unavailable');

  try {
    return await operation(activeDb);
  } catch (error) {
    if (!hasLostDatabaseConnection(error)) throw error;
    _db = null;
    if (_pool) {
      _pool.end();
      _pool = null;
    }
    const reconnectedDb = await getDb();
    if (!reconnectedDb) throw error;
    return operation(reconnectedDb);
  }
}

export function simulatorQuestionSignature(question: SimulatorQuestion) {
  return [
    (question.normalized || question.question).trim().toLocaleLowerCase('es-ES'),
    question.optionA.trim(),
    question.optionB.trim(),
    question.optionC.trim(),
    question.optionD.trim(),
    question.correctAnswer,
  ].join('│');
}

export function compareChapterQuestionPriority(left: SimulatorQuestion, right: SimulatorQuestion) {
  const leftOfficial = left.model === 'ORIGINAL' ? 0 : 1;
  const rightOfficial = right.model === 'ORIGINAL' ? 0 : 1;
  if (leftOfficial !== rightOfficial) return leftOfficial - rightOfficial;
  if (left.provaDate !== right.provaDate) return left.provaDate.localeCompare(right.provaDate, 'es');
  if (left.model !== right.model) return left.model.localeCompare(right.model, 'es');
  return left.questionNumber - right.questionNumber;
}

export function selectUniqueChapterQuestions(questions: SimulatorQuestion[]) {
  const seen = new Set<string>();
  return [...questions]
    .sort(compareChapterQuestionPriority)
    .filter((question) => {
      const signature = simulatorQuestionSignature(question);
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

export function buildChapterAttempt(questions: SimulatorQuestion[], requestedAttempt = 1) {
  const availableAttempts = Math.max(1, Math.ceil(questions.length / CHAPTER_ATTEMPT_SIZE));
  const attemptNumber = Math.min(Math.max(1, requestedAttempt), availableAttempts);
  const offset = (attemptNumber - 1) * CHAPTER_ATTEMPT_SIZE;
  return { attemptNumber, availableAttempts, questions: questions.slice(offset, offset + CHAPTER_ATTEMPT_SIZE) };
}

export function getNextChapterAttemptNumber(currentAttempt: number, availableAttempts: number) {
  if (availableAttempts <= 1) return 1;
  return currentAttempt >= availableAttempts ? 1 : currentAttempt + 1;
}

async function getChapterQuestionIndex() {
  if (chapterQuestionIndexCache && Date.now() - chapterQuestionIndexCache.createdAt < CHAPTER_CACHE_TTL_MS) {
    return chapterQuestionIndexCache.value;
  }
  if (chapterQuestionIndexPromise) return chapterQuestionIndexPromise;

  chapterQuestionIndexPromise = (async () => {
    const pool = await withSimulatorDbRetry((db) => db.select().from(simulatorQuestions));
    const indexed: ChapterQuestionIndex = new Map(simulatorChapters.map((chapter) => [chapter.id, []]));

    for (const question of pool) {
      const chapterId = classifySimulatorQuestion(question).chapter?.id;
      if (chapterId) indexed.get(chapterId)?.push(question);
    }

    for (const [chapterId, questions] of Array.from(indexed.entries())) {
      indexed.set(chapterId, selectUniqueChapterQuestions(questions));
    }

    chapterQuestionIndexCache = { createdAt: Date.now(), value: indexed };
    return indexed;
  })().finally(() => {
    chapterQuestionIndexPromise = null;
  });

  return chapterQuestionIndexPromise;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// Guide data queries

export async function getSimulatorQuestionsByModel(model: string) {
  try {
    // Se o identificador contém '/', trata-se de uma prova oficial por data.
    // As provas oficiais são armazenadas separadamente para não misturar
    // questões do pool estatístico com o exame original.
    const isDate = model.includes('/');
    
    return await withSimulatorDbRetry((db) =>
      db.select().from(simulatorQuestions)
        .where(isDate
          ? and(
              eq(simulatorQuestions.provaDate, model),
              eq(simulatorQuestions.model, 'ORIGINAL')
            )
          : eq(simulatorQuestions.model, model)
        )
        .orderBy(asc(simulatorQuestions.questionNumber))
    );
  } catch (error) {
    console.error("[Database] Failed to get simulator questions:", error);
    return [];
  }
}

export async function getAllSimulatorModels() {
  try {
    const result = await withSimulatorDbRetry((db) =>
      db.selectDistinct({ model: simulatorQuestions.model })
        .from(simulatorQuestions)
        .where(ne(simulatorQuestions.model, 'ORIGINAL'))
    );
    return result.map(r => r.model).sort();
  } catch (error) {
    console.error("[Database] Failed to get simulator models:", error);
    return [];
  }
}

export async function getOfficialExamDates() {
  try {
    const result = await withSimulatorDbRetry((db) =>
      db.selectDistinct({ provaDate: simulatorQuestions.provaDate })
        .from(simulatorQuestions)
        .where(eq(simulatorQuestions.model, 'ORIGINAL'))
    );

    return result
      .map(({ provaDate }) => provaDate)
      .sort((left, right) => {
        const toTimestamp = (date: string) => {
          const [day, month, year] = date.split('/').map(Number);
          return Date.UTC(year, month - 1, day);
        };
        return toTimestamp(right) - toTimestamp(left);
      });
  } catch (error) {
    console.error('[Database] Failed to get official exam dates:', error);
    return [];
  }
}

export async function getOfficialExamAnalysis() {
  if (officialAnalysisCache && Date.now() - officialAnalysisCache.createdAt < OFFICIAL_ANALYSIS_CACHE_TTL_MS) {
    return officialAnalysisCache.value;
  }

  try {
    const officialQuestions = await withSimulatorDbRetry((db) =>
      db.select().from(simulatorQuestions).where(eq(simulatorQuestions.model, 'ORIGINAL'))
    );
    const analysis = buildOfficialExamAnalysis(officialQuestions);
    officialAnalysisCache = { createdAt: Date.now(), value: analysis };
    return analysis;
  } catch (error) {
    console.error('[Database] Failed to build official exam analysis:', error);
    return null;
  }
}

export async function getSimulatorChapters() {
  try {
    const index = await getChapterQuestionIndex();
    return simulatorChapters
      .map((chapter) => ({
      ...chapter,
        count: index.get(chapter.id)?.length ?? 0,
        availableAttempts: Math.max(1, Math.ceil((index.get(chapter.id)?.length ?? 0) / CHAPTER_ATTEMPT_SIZE)),
        officialCount: (index.get(chapter.id) ?? []).filter((question) => question.model === 'ORIGINAL').length,
      }));
  } catch (error) {
    console.error('[Database] Failed to get simulator chapters:', error);
    return [];
  }
}

export async function getSimulatorQuestionsByChapter(chapterId: string, requestedAttempt = 1) {
  try {
    const index = await getChapterQuestionIndex();
    const availableQuestions = index.get(chapterId) ?? [];
    const { questions, attemptNumber, availableAttempts } = buildChapterAttempt(availableQuestions, requestedAttempt);
    return {
      questions,
      attemptNumber,
      availableAttempts,
      totalUnique: availableQuestions.length,
      officialCount: availableQuestions.filter((question) => question.model === 'ORIGINAL').length,
      officialQuestionsInAttempt: questions.filter((question) => question.model === 'ORIGINAL').length,
    };
  } catch (error) {
    console.error('[Database] Failed to get simulator questions by chapter:', error);
    return { questions: [], attemptNumber: 1, availableAttempts: 0, totalUnique: 0, officialCount: 0, officialQuestionsInAttempt: 0 };
  }
}

export async function getRepeatedQuestions() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select().from(repeatedQuestions);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get repeated questions:", error);
    return [];
  }
}

export async function getTricks() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select().from(tricks);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get tricks:", error);
    return [];
  }
}

export async function getSiglas() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select().from(siglas);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get siglas:", error);
    return [];
  }
}

export async function getSimulatorStats() {
  try {
    const [summary] = await withSimulatorDbRetry((db) =>
      db.select({
        totalQuestions: count(),
        officialQuestions: sql<number>`sum(case when ${simulatorQuestions.model} = 'ORIGINAL' then 1 else 0 end)`,
        statisticalQuestions: sql<number>`sum(case when ${simulatorQuestions.model} <> 'ORIGINAL' then 1 else 0 end)`,
        officialExams: sql<number>`count(distinct case when ${simulatorQuestions.model} = 'ORIGINAL' then ${simulatorQuestions.provaDate} end)`,
        statisticalModels: sql<number>`count(distinct case when ${simulatorQuestions.model} <> 'ORIGINAL' then ${simulatorQuestions.model} end)`,
        repeatedQuestions: sql<number>`(select count(*) from ${repeatedQuestions})`,
      }).from(simulatorQuestions)
    );

    return {
      totalQuestions: Number(summary?.totalQuestions ?? 0),
      totalOfficialQuestions: Number(summary?.officialQuestions ?? 0),
      totalStatisticalQuestions: Number(summary?.statisticalQuestions ?? 0),
      totalOfficialExams: Number(summary?.officialExams ?? 0),
      totalModels: Number(summary?.statisticalModels ?? 0),
      totalRepeatedQuestions: Number(summary?.repeatedQuestions ?? 0),
    };
  } catch (error) {
    console.error("[Database] Failed to get simulator stats:", error);
    return null;
  }
}

export async function saveSimulatorResult(userId: number, input: {
  model: string;
  mode: 'statistical' | 'official' | 'chapter';
  chapterId?: string;
  attemptNumber?: number;
  questionCount: number;
  correct: number;
  wrong: number;
  blank: number;
  timeTaken: number;
}) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const score = Math.round((input.correct / input.questionCount) * 100);
    const result = await db.insert(userSimulatorResults).values({
      userId,
      model: input.model,
      mode: input.mode,
      chapterId: input.chapterId ?? null,
      attemptNumber: input.attemptNumber ?? 1,
      questionCount: input.questionCount,
      correctAnswers: input.correct,
      wrongAnswers: input.wrong,
      blankAnswers: input.blank,
      score,
      timeTaken: input.timeTaken,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to save simulator result:", error);
    return null;
  }
}

export async function getUserSimulatorResults(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db
      .select()
      .from(userSimulatorResults)
      .where(eq(userSimulatorResults.userId, userId))
      .orderBy(desc(userSimulatorResults.createdAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get user simulator results:", error);
    return [];
  }
}


// Study profile and plan
export async function getUserStudyProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userStudyProfiles).where(eq(userStudyProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function saveUserStudyProfile(userId: number, input: {
  track: 'goods' | 'passengers';
  targetExamDate: string | null;
  dailyStudyMinutes: number;
  planEnabled: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database connection unavailable');
  await db.insert(userStudyProfiles).values({ userId, ...input }).onDuplicateKeyUpdate({
    set: {
      track: input.track,
      targetExamDate: input.targetExamDate,
      dailyStudyMinutes: input.dailyStudyMinutes,
      planEnabled: input.planEnabled,
      updatedAt: new Date(),
    },
  });
  return getUserStudyProfile(userId);
}

export async function getUserStudyPlan(userId: number) {
  const [savedProfile, analysis, results] = await Promise.all([
    getUserStudyProfile(userId),
    getOfficialExamAnalysis(),
    getUserSimulatorResults(userId),
  ]);
  const profile = savedProfile ?? {
    track: 'goods' as const,
    targetExamDate: null,
    dailyStudyMinutes: 60,
    planEnabled: true,
  };
  const chapterPriorities = analysis?.chapterPriorities ?? [];
  const plan = buildStudyPlan(profile, chapterPriorities, results);
  return { profile, plan, chapterPriorities };
}

// Admin queries
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select().from(users);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get all users:", error);
    return [];
  }
}

export async function approveUser(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.update(users).set({ isApproved: true }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to approve user:", error);
    return null;
  }
}

export async function blockUser(userId: number, blocked: boolean) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const targetUser = result[0];
    if (!targetUser) {
      throw new Error('User not found');
    }
    if (targetUser.isMaster) {
      throw new Error('The master account cannot be blocked');
    }
    await db.update(users).set({ isBlocked: blocked }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to block user:", error);
    throw error;
  }
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const targetUser = result[0];
    if (!targetUser) throw new Error('User not found');
    if (targetUser.isMaster) throw new Error('The master account cannot be deleted');

    await db.transaction(async (tx) => {
      await tx.delete(passwordResets).where(eq(passwordResets.userId, userId));
      await tx.delete(userAccessLogs).where(eq(userAccessLogs.userId, userId));
      await tx.delete(userSimulatorResults).where(eq(userSimulatorResults.userId, userId));
      await tx.delete(userStudyProfiles).where(eq(userStudyProfiles.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });
    return true;
  } catch (error) {
    console.error('[Database] Failed to delete user:', error);
    throw error;
  }
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const allUsers = await db.select().from(users);
    const pending = allUsers.filter(u => !u.isApproved).length;
    const approved = allUsers.filter(u => u.isApproved && !u.isBlocked).length;
    const blocked = allUsers.filter(u => u.isBlocked).length;
    
    return {
      totalUsers: allUsers.length,
      pendingApproval: pending,
      approvedUsers: approved,
      blockedUsers: blocked,
    };
  } catch (error) {
    console.error("[Database] Failed to get admin stats:", error);
    return null;
  }
}
