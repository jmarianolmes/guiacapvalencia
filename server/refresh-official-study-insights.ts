/** Recalcula Repetidas e Pegadinhas exclusivamente a partir das 34 provas oficiais armazenadas. */
import { eq } from 'drizzle-orm';

import { repeatedQuestions, simulatorQuestions, tricks } from '../drizzle/schema';
import { getDb } from './db';
import { buildOfficialExamAnalysis } from './officialExamAnalysis';

async function refreshOfficialStudyInsights() {
  const db = await getDb();
  if (!db) throw new Error('Falha de conexão com o banco de dados.');

  const officialQuestions = await db.select().from(simulatorQuestions).where(eq(simulatorQuestions.model, 'ORIGINAL'));
  const analysis = buildOfficialExamAnalysis(officialQuestions);

  if (analysis.totalExams !== 34 || analysis.totalQuestions !== 3400) {
    throw new Error(`Base oficial inesperada: ${analysis.totalExams} provas e ${analysis.totalQuestions} questões.`);
  }

  await db.transaction(async (tx) => {
    await tx.delete(repeatedQuestions);
    for (const question of analysis.repeatedQuestions) {
      await tx.insert(repeatedQuestions).values({
        percentage: question.percentage,
        question: question.question,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctAnswer: question.correctAnswer,
        exams: JSON.stringify(question.exams),
      });
    }

    await tx.delete(tricks);
    for (const insight of analysis.trapInsights) {
      await tx.insert(tricks).values({
        title: insight.title,
        percentage: insight.percentage,
        descriptionPt: insight.descriptionPt,
        descriptionEs: insight.descriptionEs,
      });
    }
  });

  console.log(`Atualização concluída: ${analysis.repeatedGroups} grupos de repetidas e ${analysis.trapInsights.length} padrões de pegadinhas.`);
}

refreshOfficialStudyInsights()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Falha ao atualizar a análise oficial:', error);
    process.exit(1);
  });
