import fs from 'node:fs';
import path from 'node:path';
import { and, eq, sql } from 'drizzle-orm';
import { getDb } from './db';
import { simulatorQuestions } from '../drizzle/schema';
import { normalizedQuestionKey } from './questionCatalog';

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

type Catalog = { entries: CatalogEntry[] };

async function repairAndSeedQuestionCatalog() {
  const db = await getDb();
  if (!db) throw new Error('Falha de conexão com o banco de dados.');

  // O histórico de migrações da produção contém versões antigas que tentam
  // recriar tabelas existentes. Estas alterações são deliberadamente isoladas
  // e idempotentes para reparar somente o schema do catálogo.
  const columns = [
    'internalCode varchar(24)',
    'equivalenceKey text',
    'chapterId varchar(50)',
    'chapterCode varchar(12)',
    "origin varchar(20) DEFAULT 'official' NOT NULL",
    "reviewStatus varchar(20) DEFAULT 'pending_review' NOT NULL",
    'isVariant boolean DEFAULT false NOT NULL',
  ];
  for (const definition of columns) {
    await db.execute(sql.raw(`ALTER TABLE \`simulator_questions\` ADD COLUMN IF NOT EXISTS \`${definition.split(' ')[0]}\` ${definition.slice(definition.indexOf(' ') + 1)}`));
  }

  const catalogPath = path.join(process.cwd(), 'server/data/question_catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as Catalog;
  const byNormalized = new Map(catalog.entries.map((entry) => [entry.normalizedKey, entry]));
  const rows = await db.select().from(simulatorQuestions);
  let updated = 0;
  let unresolved = 0;

  for (const row of rows) {
    const entry = byNormalized.get(
      normalizedQuestionKey({ normalized: row.normalized ?? undefined, question: row.question }),
    );
    if (!entry) {
      unresolved += 1;
      continue;
    }
    await db.update(simulatorQuestions)
      .set({
        internalCode: entry.internalCode,
        equivalenceKey: entry.equivalenceKey,
        chapterId: entry.chapterId,
        chapterCode: entry.chapterCode,
        origin: entry.origin,
        reviewStatus: entry.reviewStatus,
        isVariant: entry.isVariant,
      })
      .where(and(
        eq(simulatorQuestions.model, row.model),
        eq(simulatorQuestions.provaDate, row.provaDate),
        eq(simulatorQuestions.questionNumber, row.questionNumber),
      ));
    updated += 1;
  }

  console.log(JSON.stringify({
    schemaRepair: 'completed',
    catalogEntries: catalog.entries.length,
    rows: rows.length,
    updated,
    unresolved,
  }, null, 2));

  if (unresolved > 0) process.exitCode = 1;
}

repairAndSeedQuestionCatalog().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
