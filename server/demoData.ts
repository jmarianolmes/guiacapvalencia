import fs from 'node:fs';
import path from 'node:path';
import type { User, SimulatorQuestion, UserSimulatorResult } from '../drizzle/schema';
import { simulatorChapters } from '../shared/simulatorChapters';
import { buildOfficialStatisticalModels } from './officialStatisticalModels';
import { buildOfficialExamAnalysis } from './officialExamAnalysis';
import { buildStudyPlan } from './studyPlan';
import { questionEquivalenceKey } from './questionCatalog';

const root = path.resolve(import.meta.dirname, '..');
const dataDir = path.join(root, 'server', 'data');

const read = (file: string) => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')) as any;

let questionsCache: SimulatorQuestion[] | null = null;
let resultCache: UserSimulatorResult[] = [];
const CHAPTER_ATTEMPT_SIZE = 50;

function simulatorQuestionSignature(question: SimulatorQuestion) {
  return question.equivalenceKey || [question.normalized || question.question, [question.optionA, question.optionB, question.optionC, question.optionD].map((option) => option.trim().toLocaleLowerCase('es-ES')).sort().join('¦'), question.correctAnswer].join('│');
}

function selectUniqueChapterQuestions(questions: SimulatorQuestion[]) {
  const seen = new Set<string>();
  return [...questions]
    .sort((left, right) => left.questionNumber - right.questionNumber)
    .filter((question) => {
      const signature = simulatorQuestionSignature(question);
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

function buildChapterAttempt(questions: SimulatorQuestion[], requestedAttempt = 1) {
  const availableAttempts = Math.max(1, Math.ceil(questions.length / CHAPTER_ATTEMPT_SIZE));
  const attemptNumber = Math.min(Math.max(1, requestedAttempt), availableAttempts);
  const offset = (attemptNumber - 1) * CHAPTER_ATTEMPT_SIZE;
  return { attemptNumber, availableAttempts, questions: questions.slice(offset, offset + CHAPTER_ATTEMPT_SIZE) };
}

export function isDemoMode() {
  return process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';
}

export function getDemoUser(): User {
  const now = new Date();
  return {
    id: 1,
    openId: 'demo-local-preview',
    name: 'Usuário de demonstração',
    email: 'demo@local.test',
    loginMethod: 'local-demo',
    role: 'user',
    passwordHash: null,
    isApproved: true,
    isBlocked: false,
    mustChangePassword: false,
    isMaster: false,
    accessExpiresAt: null,
    paymentReference: null,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('es-ES');
}

function rawQuestionToFields(raw: any) {
  return {
    subject: raw.subject ?? raw.materia ?? 'Comunes',
    question: raw.question ?? raw.stem ?? '',
    stem: raw.stem ?? raw.question ?? '',
    optionA: raw.optionA ?? raw.options?.A ?? '',
    optionB: raw.optionB ?? raw.options?.B ?? '',
    optionC: raw.optionC ?? raw.options?.C ?? '',
    optionD: raw.optionD ?? raw.options?.D ?? '',
    correctAnswer: raw.correctAnswer ?? raw.answer ?? 'A',
    normalized: raw.normalized ?? null,
  };
}

function sourceRef(source: string, model: string | null | undefined, date: string, number: number) {
  return [source, model ?? '', date, number].join('|');
}

function buildCatalogMaps() {
  const catalog = read('question_catalog.json') as { entries: Array<{ normalizedKey: string; internalCode: string | null; equivalenceKey: string; chapterId: string | null; chapterCode: string | null; group: string | null; origin: string; reviewStatus: string; isVariant: boolean; sources: Array<{ source: string; model?: string; provaDate: string; questionNumber: number; question: string }> }> };
  const byRef = new Map<string, (typeof catalog.entries)[number]>();
  const byQuestion = new Map<string, (typeof catalog.entries)[number]>();
  for (const entry of catalog.entries) {
    for (const source of entry.sources) {
      byRef.set(sourceRef(source.source, source.model, source.provaDate, source.questionNumber), entry);
    }
    for (const source of entry.sources) {
      byQuestion.set(normalize(source.question), entry);
    }
  }
  return { byRef, byQuestion };
}

function toDemoQuestion(raw: any, model: string, date: string, number: number, id: number, source: string, catalogMaps: ReturnType<typeof buildCatalogMaps>): SimulatorQuestion {
  const fields = rawQuestionToFields(raw);
  const catalog = catalogMaps.byRef.get(sourceRef(source, model === 'ORIGINAL' ? undefined : model, date, number)) ?? catalogMaps.byQuestion.get(normalize(fields.question));
  return {
    id,
    model,
    provaDate: date,
    questionNumber: number,
    subject: fields.subject,
    question: fields.question,
    stem: fields.stem,
    optionA: fields.optionA,
    optionB: fields.optionB,
    optionC: fields.optionC,
    optionD: fields.optionD,
    correctAnswer: fields.correctAnswer,
    normalized: fields.normalized,
    internalCode: catalog?.internalCode ?? null,
    equivalenceKey: catalog?.equivalenceKey ?? questionEquivalenceKey({ ...fields, subject: fields.subject } as any),
    chapterId: catalog?.chapterId ?? null,
    chapterCode: catalog?.chapterCode ?? null,
    origin: catalog?.origin ?? 'official',
    reviewStatus: catalog?.reviewStatus ?? 'provisional',
    isVariant: catalog?.isVariant ?? false,
    createdAt: new Date(),
  };
}

export function getDemoQuestions() {
  if (questionsCache) return questionsCache;
  const catalogMaps = buildCatalogMaps();
  const recent = read('original_exams.json') as Array<{ date: string; questions: any[] }>;
  const gva = read('gva_cap_mercancias_extracted.json') as { exams: Array<{ date: string; questions: any[] }> };
  const pools = read('simulator_questions.json') as any[][];
  const questions: SimulatorQuestion[] = [];
  let id = 1;

  for (const exam of recent) {
    exam.questions.forEach((question, index) => questions.push(toDemoQuestion(question, 'ORIGINAL', exam.date, question.questionNumber ?? index + 1, id++, 'original_exams', catalogMaps)));
  }
  for (const exam of gva.exams) {
    exam.questions.forEach((question, index) => questions.push(toDemoQuestion(question, 'ORIGINAL', exam.date, question.questionNumber ?? index + 1, id++, 'gva', catalogMaps)));
  }
  pools.forEach((pool, modelIndex) => {
    const model = String.fromCharCode(65 + modelIndex);
    pool.forEach((question, index) => questions.push(toDemoQuestion(question, model, question.prova ?? `pool-${model}`, index + 1, id++, 'statistical_pool', catalogMaps)));
  });

  const official = questions.filter((question) => question.model === 'ORIGINAL');
  const derived = buildOfficialStatisticalModels(official.map((question) => ({
    provaDate: question.provaDate,
    questionNumber: question.questionNumber,
    subject: question.subject,
    question: question.question,
    stem: question.stem,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    correctAnswer: question.correctAnswer,
    normalized: question.normalized,
  })));
  for (const model of derived) {
    model.questions.forEach((question) => questions.push(toDemoQuestion(question, model.model, model.sourceDate, question.questionNumber, id++, 'gva', catalogMaps)));
  }

  questionsCache = questions;
  return questions;
}

export function getDemoModels() {
  return Array.from(new Set(getDemoQuestions().filter((question) => question.model !== 'ORIGINAL').map((question) => question.model))).sort();
}

export function getDemoOfficialDates() {
  return Array.from(new Set(getDemoQuestions().filter((question) => question.model === 'ORIGINAL').map((question) => question.provaDate))).sort((left, right) => {
    const parse = (value: string) => { const [day, month, year] = value.split('/').map(Number); return Date.UTC(year, month - 1, day); };
    return parse(right) - parse(left);
  });
}

export function getDemoQuestionsByModel(model: string) {
  const questions = getDemoQuestions();
  if (model.includes('/')) return questions.filter((question) => question.model === 'ORIGINAL' && question.provaDate === model).sort((a, b) => a.questionNumber - b.questionNumber);
  return questions.filter((question) => question.model === model).sort((a, b) => a.questionNumber - b.questionNumber);
}

function getDemoChapterIndex() {
  const indexed = new Map(simulatorChapters.map((chapter) => [chapter.id, [] as SimulatorQuestion[]]));
  for (const question of getDemoQuestions()) {
    if (question.origin === 'non_official') continue;
    if (!question.chapterId) continue;
    indexed.get(question.chapterId)?.push(question);
  }
  indexed.forEach((questions, chapterId) => indexed.set(chapterId, selectUniqueChapterQuestions(questions)));
  return indexed;
}

export function getDemoChapters() {
  const index = getDemoChapterIndex();
  return simulatorChapters.map((chapter) => ({
    ...chapter,
    count: index.get(chapter.id)?.length ?? 0,
    availableAttempts: Math.max(1, Math.ceil((index.get(chapter.id)?.length ?? 0) / 50)),
    officialCount: (index.get(chapter.id) ?? []).filter((question) => question.model === 'ORIGINAL').length,
  }));
}

export function getDemoQuestionsByChapter(chapterId: string, requestedAttempt: number) {
  const questions = getDemoChapterIndex().get(chapterId) ?? [];
  const result = buildChapterAttempt(questions, requestedAttempt);
  return {
    questions: result.questions,
    attemptNumber: result.attemptNumber,
    availableAttempts: result.availableAttempts,
    totalUnique: questions.length,
    officialCount: questions.filter((question) => question.model === 'ORIGINAL').length,
    officialQuestionsInAttempt: result.questions.filter((question) => question.model === 'ORIGINAL').length,
  };
}

export function getDemoStats() {
  const questions = getDemoQuestions();
  const official = questions.filter((question) => question.model === 'ORIGINAL');
  const equivalenceKeys = new Set(questions.map((question) => question.equivalenceKey));
  const officialKeys = new Set(official.map((question) => question.equivalenceKey));
  const nonOfficialKeys = new Set(questions.filter((question) => question.origin === 'non_official').map((question) => question.equivalenceKey));
  const variantKeys = new Set(questions.filter((question) => question.isVariant).map((question) => question.equivalenceKey));
  const reviewedKeys = new Set(questions.filter((question) => question.reviewStatus === 'reviewed').map((question) => question.equivalenceKey));
  const provisionalKeys = new Set(questions.filter((question) => question.reviewStatus === 'provisional').map((question) => question.equivalenceKey));
  return {
    totalQuestions: questions.length,
    totalOfficialQuestions: official.length,
    totalStatisticalQuestions: questions.length - official.length,
    totalOfficialExams: new Set(official.map((question) => question.provaDate)).size,
    totalModels: getDemoModels().length,
    totalRepeatedQuestions: variantKeys.size,
    catalogUniqueEntries: equivalenceKeys.size,
    catalogOfficialUniqueEntries: officialKeys.size,
    catalogNonOfficialUniqueEntries: nonOfficialKeys.size,
    catalogVariantEntries: variantKeys.size,
    catalogReviewedEntries: reviewedKeys.size,
    catalogProvisionalEntries: provisionalKeys.size,
    catalogPendingReviewEntries: 0,
  };
}

export function getDemoOfficialAnalysis() {
  return buildOfficialExamAnalysis(getDemoQuestions().filter((question) => question.model === 'ORIGINAL'));
}

export function getDemoRepeatedQuestions() {
  const groups = new Map<string, SimulatorQuestion[]>();
  for (const question of getDemoQuestions().filter((item) => item.model === 'ORIGINAL')) {
    const group = groups.get(question.equivalenceKey ?? String(question.id)) ?? [];
    group.push(question);
    groups.set(question.equivalenceKey ?? String(question.id), group);
  }
  return Array.from(groups.values()).filter((group) => group.length > 1).slice(0, 40).map((group, index) => ({
    id: index + 1,
    percentage: `${((group.length / 34) * 100).toFixed(1)}%`,
    question: group[0].question,
    optionA: group[0].optionA,
    optionB: group[0].optionB,
    optionC: group[0].optionC,
    optionD: group[0].optionD,
    correctAnswer: group[0].correctAnswer,
    exams: JSON.stringify(Array.from(new Set(group.map((item) => item.provaDate)))),
    createdAt: new Date(),
  }));
}

export function getDemoResults(): UserSimulatorResult[] {
  return resultCache;
}

export function saveDemoResult(userId: number, input: { model: string; mode: 'statistical' | 'official' | 'chapter'; studyMode: 'exam' | 'learning'; chapterId?: string; attemptNumber?: number; questionCount: number; correct: number; wrong: number; blank: number; timeTaken: number }): UserSimulatorResult {
  const result = {
    id: resultCache.length + 1,
    userId,
    model: input.model,
    mode: input.mode,
    studyMode: input.studyMode,
    chapterId: input.chapterId ?? null,
    attemptNumber: input.attemptNumber ?? 1,
    questionCount: input.questionCount,
    correctAnswers: input.correct,
    wrongAnswers: input.wrong,
    blankAnswers: input.blank,
    score: Math.round((input.correct / input.questionCount) * 100),
    timeTaken: input.timeTaken,
    createdAt: new Date(),
  };
  resultCache = [result, ...resultCache];
  return result;
}

export function getDemoStudyPlan() {
  const analysis = getDemoOfficialAnalysis();
  const profile = { track: 'goods' as const, targetExamDate: null, dailyStudyMinutes: 60, planEnabled: true };
  const chapterPriorities = analysis.chapterPriorities ?? [];
  return { profile, plan: buildStudyPlan(profile, chapterPriorities, resultCache), chapterPriorities };
}
