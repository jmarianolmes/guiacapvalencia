import { getDb } from './db';
import { simulatorQuestions } from '../drizzle/schema';
import { eq, ne } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { buildOfficialStatisticalModels } from './officialStatisticalModels';

const ANSWERS = new Set(['A', 'B', 'C', 'D']);

function validateSimulatorSource(provas: unknown): asserts provas is Array<Array<{
  prova: string;
  materia: string;
  question: string;
  stem: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
  normalized?: string;
}>> {
  if (!Array.isArray(provas) || provas.length !== 10) {
    throw new Error('A fonte estatística deve conter exatamente 10 modelos.');
  }
  provas.forEach((prova, modelIndex) => {
    if (!Array.isArray(prova) || prova.length !== 100) {
      throw new Error(`O modelo ${modelIndex + 1} deve conter exatamente 100 questões.`);
    }
    prova.forEach((question, questionIndex) => {
      const valid = question &&
        typeof question.prova === 'string' &&
        typeof question.materia === 'string' &&
        typeof question.question === 'string' && question.question.trim().length > 0 &&
        typeof question.stem === 'string' && question.stem.trim().length > 0 &&
        question.options && ['A', 'B', 'C', 'D'].every((answer) => typeof question.options[answer as keyof typeof question.options] === 'string' && question.options[answer as keyof typeof question.options].trim().length > 0) &&
        ANSWERS.has(question.answer);
      if (!valid) throw new Error(`Gabarito ou alternativas inválidos no modelo ${modelIndex + 1}, questão ${questionIndex + 1}.`);
    });
  });
}

async function seedSimulator() {
  try {
    console.log('🌱 Iniciando seed do simulador...');

    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    // Limpar apenas o pool estatístico, preservando provas oficiais por data.
    await db.delete(simulatorQuestions).where(ne(simulatorQuestions.model, 'ORIGINAL'));
    console.log('🗑️  Pool estatístico anterior limpo; provas oficiais preservadas');

    // Ler JSON
    const dataPath = path.join(process.cwd(), 'server/data/simulator_questions.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const provas = JSON.parse(rawData) as unknown;
    validateSimulatorSource(provas);

    console.log(`📚 Encontradas ${provas.length} provas`);

    // Mapear modelos (A-J)
    const models = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    let totalInserted = 0;

    for (let i = 0; i < provas.length; i++) {
      const prova = provas[i];
      const model = models[i] || `Model${i}`;

      console.log(`\n📖 Processando Prova ${model} (${prova.length} questões)...`);

      for (let qIdx = 0; qIdx < prova.length; qIdx++) {
        const question = prova[qIdx];
        try {
          await db.insert(simulatorQuestions).values({
            model,
            provaDate: question.prova || '01/01/2025',
            questionNumber: qIdx + 1,
            subject: question.materia,
            question: question.question,
            stem: question.stem,
            optionA: question.options.A,
            optionB: question.options.B,
            optionC: question.options.C,
            optionD: question.options.D,
            correctAnswer: question.answer,
            normalized: question.normalized || question.stem.toLocaleLowerCase('es-ES'),
          });
          totalInserted++;
        } catch (err) {
          console.error(`❌ Erro ao inserir questão: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      console.log(`✅ Prova ${model} importada com sucesso!`);
    }

    const officialQuestions = await db.select().from(simulatorQuestions).where(eq(simulatorQuestions.model, 'ORIGINAL'));
    const officialModels = buildOfficialStatisticalModels(officialQuestions);
    console.log(`\n📚 Criando ${officialModels.length} modelos estatísticos a partir das provas GVA de 2020–2024...`);
    for (const officialModel of officialModels) {
      for (const question of officialModel.questions) {
        await db.insert(simulatorQuestions).values({
          model: officialModel.model,
          provaDate: officialModel.sourceDate,
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
        });
        totalInserted++;
      }
      console.log(`✅ Modelo ${officialModel.model} criado da prova ${officialModel.sourceDate}`);
    }

    console.log(`\n🎉 Total de questões importadas: ${totalInserted}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    process.exit(1);
  }
}

seedSimulator();
