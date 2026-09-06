/**
 * Seed das provas originais por data.
 * Importa cada prova com model = 'ORIGINAL' e provaDate = 'DD/MM/YYYY'.
 * Isso permite que a busca por data retorne exatamente as 100 questões da prova real.
 */
import { getDb } from './db';
import { simulatorQuestions } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

interface OriginalQuestion {
  questionNumber: number;
  question: string;
  stem: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
  subject: string;
  normalized: string;
}

interface OriginalExam {
  date: string;
  questions: OriginalQuestion[];
}

async function seedOriginalExams() {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  const dataPath = path.join(process.cwd(), 'server/data/original_exams.json');
  const exams: OriginalExam[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`📚 Importando ${exams.length} provas originais...`);

  let totalInserted = 0;

  for (const exam of exams) {
    // Remover registros anteriores desta prova original para evitar duplicatas
    await db
      .delete(simulatorQuestions)
      .where(
        and(
          eq(simulatorQuestions.model, 'ORIGINAL'),
          eq(simulatorQuestions.provaDate, exam.date)
        )
      );

    for (const q of exam.questions) {
      await db.insert(simulatorQuestions).values({
        model: 'ORIGINAL',
        provaDate: exam.date,
        questionNumber: q.questionNumber,
        subject: q.subject,
        question: q.question,
        stem: q.stem,
        optionA: q.options.A,
        optionB: q.options.B,
        optionC: q.options.C,
        optionD: q.options.D,
        correctAnswer: q.answer,
        normalized: q.normalized,
      });
      totalInserted++;
    }

    console.log(`  ✅ ${exam.date}: ${exam.questions.length} questões importadas`);
  }

  console.log(`\n🎉 Total importado: ${totalInserted} questões`);
  process.exit(0);
}

seedOriginalExams().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
