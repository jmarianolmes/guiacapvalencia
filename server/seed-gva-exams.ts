/**
 * Importa as provas públicas da Generalitat Valenciana (CAP Mercancías).
 * O processo é idempotente: remove apenas a data que será novamente inserida.
 */
import fs from 'fs';
import path from 'path';
import { and, eq } from 'drizzle-orm';

import { simulatorQuestions } from '../drizzle/schema';
import { getDb } from './db';

type Answer = 'A' | 'B' | 'C' | 'D';

interface ExtractedQuestion {
  questionNumber: number;
  subject: 'Mercancias' | 'Materiales Comunes';
  question: string;
  stem: string;
  options: Record<Answer, string>;
  answer: Answer;
  answerConfidence: number;
}

interface ExtractedExam {
  date: string;
  sourceQuestionnaire: string;
  sourceAnswerKey: string;
  questions: ExtractedQuestion[];
}

interface ExtractionFile {
  exams: ExtractedExam[];
  failures: Array<{ date: string; error: string }>;
}

function normalizeStem(stem: string) {
  return stem.replace(/\s+/g, ' ').trim();
}

function assertExtraction(exams: ExtractedExam[], failures: ExtractionFile['failures']) {
  if (failures.length > 0) {
    throw new Error(`A extração contém ${failures.length} falha(s); a importação foi interrompida.`);
  }

  if (exams.length !== 24) {
    throw new Error(`Foram encontradas ${exams.length} provas; eram esperadas 24.`);
  }

  const dates = new Set(exams.map((exam) => exam.date));
  if (dates.size !== exams.length) {
    throw new Error('Há datas de prova duplicadas no arquivo de extração.');
  }

  for (const exam of exams) {
    if (exam.questions.length !== 100) {
      throw new Error(`${exam.date}: foram encontradas ${exam.questions.length} questões; eram esperadas 100.`);
    }

    for (let index = 0; index < exam.questions.length; index += 1) {
      const question = exam.questions[index];
      const expectedNumber = index + 1;
      const expectedSubject = expectedNumber <= 25 ? 'Mercancias' : 'Materiales Comunes';
      if (
        question.questionNumber !== expectedNumber ||
        question.subject !== expectedSubject ||
        !question.question ||
        !question.stem ||
        !question.options.A ||
        !question.options.B ||
        !question.options.C ||
        !question.options.D ||
        !['A', 'B', 'C', 'D'].includes(question.answer)
      ) {
        throw new Error(`${exam.date}: estrutura inválida na questão ${expectedNumber}.`);
      }
    }
  }
}

async function seedGvaExams() {
  const db = await getDb();
  if (!db) throw new Error('Falha de conexão com o banco de dados.');

  const dataPath = path.join(process.cwd(), 'server/data/gva_cap_mercancias_extracted.json');
  const extraction: ExtractionFile = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  assertExtraction(extraction.exams, extraction.failures);

  console.log(`Importando ${extraction.exams.length} provas oficiais da GVA...`);
  let totalInserted = 0;

  for (const exam of extraction.exams) {
    await db
      .delete(simulatorQuestions)
      .where(and(eq(simulatorQuestions.model, 'ORIGINAL'), eq(simulatorQuestions.provaDate, exam.date)));

    for (const question of exam.questions) {
      await db.insert(simulatorQuestions).values({
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
        normalized: normalizeStem(question.stem),
      });
      totalInserted += 1;
    }

    console.log(`  ${exam.date}: ${exam.questions.length} questões importadas`);
  }

  console.log(`Total importado: ${totalInserted} questões oficiais da GVA.`);
}

seedGvaExams().catch((error) => {
  console.error('Erro na importação GVA:', error);
  process.exitCode = 1;
});
