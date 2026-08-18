#!/usr/bin/env node
/**
 * Script para importar dados do Guia CAP Valência v1.9 para o banco de dados
 * Uso: node server/seed-guide-data.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../drizzle/schema.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get database connection from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function seedData() {
  console.log('🌱 Iniciando importação de dados do Guia CAP...\n');

  try {
    // Importar questões do simulador
    console.log('📝 Importando questões do simulador...');
    const simQuestionsPath = path.join(__dirname, 'data', 'simulator_questions.json');
    const simQuestionsData = JSON.parse(fs.readFileSync(simQuestionsPath, 'utf-8'));
    
    let simCount = 0;
    for (const pool of simQuestionsData) {
      for (const q of pool.questions) {
        await db.insert(schema.simulatorQuestions).values({
          model: pool.model || 'A',
          provaDate: q.prova,
          questionNumber: q.q_num,
          subject: q.materia,
          question: q.question,
          stem: q.stem,
          optionA: q.options.A,
          optionB: q.options.B,
          optionC: q.options.C,
          optionD: q.options.D,
          correctAnswer: q.answer,
          normalized: q.normalized,
        });
        simCount++;
      }
    }
    console.log(`   ✅ ${simCount} questões importadas\n`);

    // Importar questões repetidas
    console.log('🔁 Importando questões repetidas...');
    const repeatedPath = path.join(__dirname, 'data', 'repeated_questions.json');
    const repeatedData = JSON.parse(fs.readFileSync(repeatedPath, 'utf-8'));
    
    for (const q of repeatedData) {
      await db.insert(schema.repeatedQuestions).values({
        percentage: q.percentage,
        question: q.question,
        optionA: q.options[0] || '',
        optionB: q.options[1] || '',
        optionC: q.options[2] || '',
        optionD: q.options[3] || '',
        correctAnswer: q.correct_answer,
        exams: JSON.stringify(q.exams),
      });
    }
    console.log(`   ✅ ${repeatedData.length} questões repetidas importadas\n`);

    // Importar pegadinhas
    console.log('⚠️ Importando pegadinhas...');
    const tricksPath = path.join(__dirname, 'data', 'tricks.json');
    const tricksData = JSON.parse(fs.readFileSync(tricksPath, 'utf-8'));
    
    for (const t of tricksData) {
      await db.insert(schema.tricks).values({
        title: t.title,
        percentage: t.percentage,
        descriptionPt: t.description_pt,
        descriptionEs: t.description_es,
      });
    }
    console.log(`   ✅ ${tricksData.length} pegadinhas importadas\n`);

    // Importar siglas
    console.log('🔤 Importando siglas...');
    const siglasPath = path.join(__dirname, 'data', 'siglas.json');
    const siglasData = JSON.parse(fs.readFileSync(siglasPath, 'utf-8'));
    
    for (const s of siglasData) {
      await db.insert(schema.siglas).values({
        acronym: s.acronym,
        fullName: s.full_name,
        descriptionPt: s.description_pt,
        descriptionEs: s.description_es,
      });
    }
    console.log(`   ✅ ${siglasData.length} siglas importadas\n`);

    console.log('✅ Importação concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante importação:', error);
    process.exit(1);
  }
}

seedData();
