/**
 * Sincroniza as questões repetidas com a fonte oficial versionada no projeto.
 * A validação ocorre antes da transação para impedir uma substituição parcial.
 */
import fs from 'node:fs';
import path from 'node:path';

import { repeatedQuestions } from '../drizzle/schema';
import { getDb } from './db';

interface RepeatedQuestionSource {
  percentage: string;
  question: string;
  options: string[];
  correct_answer: string;
  exams: string[];
}

function validateSource(data: unknown): asserts data is RepeatedQuestionSource[] {
  if (!Array.isArray(data) || data.length !== 146) {
    throw new Error(`A fonte oficial deve conter exatamente 146 questões; foram encontradas ${Array.isArray(data) ? data.length : 0}.`);
  }

  data.forEach((question, index) => {
    const valid = question &&
      typeof question.percentage === 'string' &&
      typeof question.question === 'string' && question.question.trim().length > 0 &&
      Array.isArray(question.options) && question.options.length === 4 && question.options.every((option: unknown) => typeof option === 'string' && option.trim().length > 0) &&
      typeof question.correct_answer === 'string' && question.correct_answer.trim().length > 0 &&
      Array.isArray(question.exams);
    if (!valid) throw new Error(`A questão repetida ${index + 1} não possui a estrutura esperada.`);
  });
}

async function syncRepeatedQuestions() {
  const db = await getDb();
  if (!db) throw new Error('Falha de conexão com o banco de dados.');

  const sourcePath = path.join(process.cwd(), 'server/data/repeated_questions.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8')) as unknown;
  validateSource(source);

  await db.transaction(async (tx) => {
    await tx.delete(repeatedQuestions);
    for (const question of source) {
      await tx.insert(repeatedQuestions).values({
        percentage: question.percentage,
        question: question.question,
        optionA: question.options[0],
        optionB: question.options[1],
        optionC: question.options[2],
        optionD: question.options[3],
        correctAnswer: question.correct_answer,
        exams: JSON.stringify(question.exams),
      });
    }
  });

  console.log(`Sincronização concluída: ${source.length} questões repetidas restauradas.`);
}

syncRepeatedQuestions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Falha ao sincronizar questões repetidas:', error);
    process.exit(1);
  });
