/**
 * Importa um arquivo de questões oficiais DGT no banco nativo do site.
 *
 * Cada arquivo OF é isolado por model + provaDate. Reexecutar o importador
 * substitui somente o mesmo objetivo OF e não toca nos bancos existentes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { and, eq } from 'drizzle-orm';

import { simulatorQuestions } from '../drizzle/schema';
import { getDb } from './db';

type Answer = 'A' | 'B' | 'C' | 'D';
type OfQuestion = {
  model: 'OF';
  provaDate: string;
  questionNumber: number;
  subject: string;
  question: string;
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: Answer;
  normalized: string;
  internalCode: string;
  equivalenceKey: string | null;
  chapterId: string;
  chapterCode: string;
  origin: 'official';
  reviewStatus: 'reviewed';
  isVariant: false;
};

function assertOfFile(rows: OfQuestion[]) {
  if (rows.length === 0) throw new Error('O arquivo OF está vazio.');
  const keys = new Set<string>();
  for (const row of rows) {
    const key = `${row.model}|${row.provaDate}|${row.questionNumber}`;
    if (keys.has(key)) throw new Error(`Questão OF duplicada: ${key}`);
    keys.add(key);
    if (
      row.model !== 'OF' ||
      !row.provaDate.startsWith('OF-') ||
      !Number.isInteger(row.questionNumber) ||
      !row.question.trim() ||
      !row.stem.trim() ||
      !row.optionA.trim() ||
      !row.optionB.trim() ||
      !row.optionC.trim() ||
      !row.optionD.trim() ||
      !(['A', 'B', 'C', 'D'] as const).includes(row.correctAnswer) ||
      !row.chapterId ||
      !row.chapterCode
    ) {
      throw new Error(`Estrutura inválida na questão OF ${row.questionNumber}.`);
    }
  }
}

async function seedOfQuestionBank() {
  const db = await getDb();
  if (!db) throw new Error('Falha de conexão com o banco de dados.');

  const fileName = process.argv[2] || 'of_cap_objetivo_1_1.json';
  const dataPath = path.join(process.cwd(), 'server/data', fileName);
  const rows = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as OfQuestion[];
  assertOfFile(rows);

  const identities = Array.from(new Set(rows.map((row) => row.provaDate)));
  for (const provaDate of identities) {
    await db.delete(simulatorQuestions).where(and(
      eq(simulatorQuestions.model, 'OF'),
      eq(simulatorQuestions.provaDate, provaDate),
    ));
  }

  for (const row of rows) {
    await db.insert(simulatorQuestions).values(row);
  }

  console.log(JSON.stringify({
    file: fileName,
    model: 'OF',
    objectives: identities,
    imported: rows.length,
    chapters: Array.from(new Set(rows.map((row) => row.chapterId))),
  }, null, 2));
}

seedOfQuestionBank().catch((error) => {
  console.error('Erro na importação OF:', error);
  process.exitCode = 1;
});
