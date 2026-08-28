import fs from 'fs';
import path from 'path';
import { count, ne } from 'drizzle-orm';
import { getDb } from './db';
import {
  repeatedQuestions,
  siglas,
  simulatorQuestions,
  tricks,
} from '../drizzle/schema';
import { buildOfficialStatisticalModels } from './officialStatisticalModels';
import { normalizedQuestionKey } from './questionCatalog';

type RawQuestion = {
  prova: string;
  q_num: number;
  materia: string;
  question: string;
  stem: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
  normalized?: string;
};

type OriginalQuestion = {
  questionNumber: number;
  question: string;
  stem: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
  subject: string;
  normalized: string;
};

type OriginalExam = { date: string; questions: OriginalQuestion[] };
type GvaExtraction = { exams: OriginalExam[]; failures: unknown[] };
type RepeatedQuestion = {
  percentage: string;
  question: string;
  options: string[];
  correct_answer: string;
  exams: unknown;
};
type Trick = { title: string; percentage: string; description_pt: string; description_es: string };
type Sigla = { acronym: string; full_name: string; description_pt: string; description_es: string };
type CatalogEntry = {
  internalCode: string | null;
  normalizedKey: string;
  equivalenceKey: string;
  chapterId: string | null;
  chapterCode: string | null;
  origin: 'official' | 'non_official';
  reviewStatus: 'reviewed' | 'provisional' | 'pending_review';
  isVariant: boolean;
};
type QuestionCatalog = { entries: CatalogEntry[] };

const dataDirectory = path.join(process.cwd(), 'server', 'data');
const batchSize = 100;

function readJson<T>(fileName: string): T {
  return JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), 'utf-8')) as T;
}

function chunks<T>(items: T[], size = batchSize): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function assertQuestion(question: RawQuestion | OriginalQuestion, label: string) {
  const options = question.options;
  if (
    !question.question?.trim() ||
    !question.stem?.trim() ||
    !options?.A?.trim() ||
    !options?.B?.trim() ||
    !options?.C?.trim() ||
    !options?.D?.trim() ||
    !['A', 'B', 'C', 'D'].includes(question.answer)
  ) {
    throw new Error(`${label}: enunciado, alternativas ou gabarito inválidos.`);
  }
}

function loadAndValidateSources() {
  const statisticalPools = readJson<RawQuestion[][]>('simulator_questions.json');
  const originalExams = readJson<OriginalExam[]>('original_exams.json');
  const gvaExtraction = readJson<GvaExtraction>('gva_cap_mercancias_extracted.json');
  const repeated = readJson<RepeatedQuestion[]>('repeated_questions.json');
  const trickRows = readJson<Trick[]>('tricks.json');
  const siglaRows = readJson<Sigla[]>('siglas.json');
  const questionCatalog = readJson<QuestionCatalog>('question_catalog.json');

  if (statisticalPools.length !== 10 || statisticalPools.some((pool) => pool.length !== 100)) {
    throw new Error('O pool estatístico deve conter 10 modelos A–J de 100 questões.');
  }
  statisticalPools.forEach((pool, poolIndex) => pool.forEach((question, questionIndex) => {
    assertQuestion(question, `Modelo ${poolIndex + 1}, questão ${questionIndex + 1}`);
  }));

  if (originalExams.length !== 10 || originalExams.some((exam) => exam.questions.length !== 100)) {
    throw new Error('As provas oficiais anteriores devem conter 10 provas de 100 questões.');
  }
  originalExams.forEach((exam) => exam.questions.forEach((question, questionIndex) => {
    if (question.questionNumber !== questionIndex + 1) throw new Error(`${exam.date}: numeração de questão inválida.`);
    assertQuestion(question, `${exam.date}, questão ${questionIndex + 1}`);
  }));

  if (gvaExtraction.failures.length > 0 || gvaExtraction.exams.length !== 24 || gvaExtraction.exams.some((exam) => exam.questions.length !== 100)) {
    throw new Error('A extração GVA precisa conter 24 provas completas e sem falhas.');
  }
  gvaExtraction.exams.forEach((exam) => exam.questions.forEach((question, questionIndex) => {
    if (question.questionNumber !== questionIndex + 1) throw new Error(`${exam.date}: numeração GVA inválida.`);
    assertQuestion(question, `${exam.date}, questão GVA ${questionIndex + 1}`);
  }));

  if (repeated.length !== 146 || trickRows.length !== 21 || siglaRows.length !== 18) {
    throw new Error('As contagens de repetidas, pegadinhas ou siglas não correspondem ao acervo validado.');
  }
  if (!questionCatalog.entries.length) throw new Error('O catálogo interno de questões está vazio.');

  return { statisticalPools, originalExams, gvaExtraction, repeated, trickRows, siglaRows, questionCatalog };
}

async function importHistoricalData() {
  const { statisticalPools, originalExams, gvaExtraction, repeated, trickRows, siglaRows, questionCatalog } = loadAndValidateSources();
  const catalogByNormalized = new Map(questionCatalog.entries.map((entry) => [entry.normalizedKey, entry]));
  const catalogMetadata = (question: { normalized?: string | null; question: string }) => {
    const entry = catalogByNormalized.get(normalizedQuestionKey(question));
    if (!entry) throw new Error(`Questão sem catálogo interno: ${question.question.slice(0, 80)}`);
    return {
      internalCode: entry.internalCode,
      equivalenceKey: entry.equivalenceKey,
      chapterId: entry.chapterId,
      chapterCode: entry.chapterCode,
      origin: entry.origin,
      reviewStatus: entry.reviewStatus,
      isVariant: entry.isVariant,
    };
  };

  const statisticalRows = statisticalPools.flatMap((pool, poolIndex) => {
    const model = String.fromCharCode(65 + poolIndex);
    return pool.map((question, questionIndex) => ({
      model,
      provaDate: question.prova,
      questionNumber: questionIndex + 1,
      subject: question.materia,
      question: question.question,
      stem: question.stem,
      optionA: question.options.A,
      optionB: question.options.B,
      optionC: question.options.C,
      optionD: question.options.D,
      correctAnswer: question.answer,
      normalized: question.normalized || question.stem.toLocaleLowerCase('es-ES'),
      ...catalogMetadata({ normalized: question.normalized, question: question.question }),
    }));
  });

  const originalRows = [...originalExams, ...gvaExtraction.exams].flatMap((exam) =>
    exam.questions.map((question) => ({
      model: 'ORIGINAL',
      provaDate: exam.date,
      questionNumber: question.questionNumber,
      subject: question.subject,
      question: question.question,
      stem: question.stem,
      optionA: question.options.A,
      optionB: question.options.B,
      optionC: question.options.C,
      optionD: question.options.D,
      correctAnswer: question.answer,
      normalized: question.normalized || question.stem.toLocaleLowerCase('es-ES'),
      ...catalogMetadata({ normalized: question.normalized, question: question.question }),
    })),
  );

  const statisticalModels = buildOfficialStatisticalModels(originalRows);
  const derivedRows = statisticalModels.flatMap((model) => model.questions.map((question) => ({
    model: model.model,
    provaDate: model.sourceDate,
    questionNumber: question.questionNumber,
    subject: question.subject,
    question: question.question,
    stem: question.stem,
    optionA: question.optionA,
    optionB: question.optionB,
    optionC: question.optionC,
    optionD: question.optionD,
    correctAnswer: question.correctAnswer,
    normalized: question.normalized || question.stem.toLocaleLowerCase('es-ES'),
    ...catalogMetadata({ normalized: question.normalized, question: question.question }),
  })));

  const expected = {
    officialExams: originalExams.length + gvaExtraction.exams.length,
    officialQuestions: originalRows.length,
    statisticalQuestions: statisticalRows.length,
    derivedQuestions: derivedRows.length,
    repeated: repeated.length,
    tricks: trickRows.length,
    siglas: siglaRows.length,
  };

  console.log('[Import] Fonte validada:', expected);
  if (process.env.DRY_RUN === '1') {
    console.log('[Import] DRY_RUN concluído; nenhuma escrita foi executada.');
    return;
  }

  const db = await getDb();
  if (!db) throw new Error('Não foi possível conectar ao banco de dados.');

  // Não toca em users, password_resets, user_access_logs nem user_simulator_results.
  await db.delete(simulatorQuestions);
  await db.delete(repeatedQuestions);
  await db.delete(tricks);
  await db.delete(siglas);

  for (const batch of chunks(originalRows)) await db.insert(simulatorQuestions).values(batch);
  for (const batch of chunks(statisticalRows)) await db.insert(simulatorQuestions).values(batch);
  for (const batch of chunks(derivedRows)) await db.insert(simulatorQuestions).values(batch);

  for (const batch of chunks(repeated)) {
    await db.insert(repeatedQuestions).values(batch.map((question) => ({
      percentage: question.percentage,
      question: question.question,
      optionA: question.options[0] || '',
      optionB: question.options[1] || '',
      optionC: question.options[2] || '',
      optionD: question.options[3] || '',
      correctAnswer: question.correct_answer,
      exams: JSON.stringify(question.exams),
    })));
  }

  for (const batch of chunks(trickRows)) {
    await db.insert(tricks).values(batch.map((trick) => ({
      title: trick.title,
      percentage: trick.percentage,
      descriptionPt: trick.description_pt,
      descriptionEs: trick.description_es,
    })));
  }

  for (const batch of chunks(siglaRows)) {
    await db.insert(siglas).values(batch.map((sigla) => ({
      acronym: sigla.acronym,
      fullName: sigla.full_name,
      descriptionPt: sigla.description_pt,
      descriptionEs: sigla.description_es,
    })));
  }

  const [questionsCount] = await db.select({ total: count() }).from(simulatorQuestions);
  const [repeatedCount] = await db.select({ total: count() }).from(repeatedQuestions);
  const [tricksCount] = await db.select({ total: count() }).from(tricks);
  const [siglasCount] = await db.select({ total: count() }).from(siglas);
  const nonOfficial = await db.select({ total: count() }).from(simulatorQuestions).where(ne(simulatorQuestions.model, 'ORIGINAL'));

  console.log('[Import] Concluído:', {
    simulatorQuestions: questionsCount.total,
    nonOfficialModels: nonOfficial[0]?.total ?? 0,
    repeated: repeatedCount.total,
    tricks: tricksCount.total,
    siglas: siglasCount.total,
  });

  // O pool mysql2 mantém o loop de eventos ativo; encerrar permite continuar para pnpm run start.
  process.exit(0);
}

importHistoricalData().catch((error) => {
  console.error('[Import] Falha:', error);
  process.exitCode = 1;
});
