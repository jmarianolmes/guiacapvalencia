import { writeFile } from 'node:fs/promises';
import { drizzle } from 'drizzle-orm/mysql2';
import { simulatorQuestions } from '../drizzle/schema.ts';
import { simulatorChapters } from '../shared/simulatorChapters.ts';
import { classifySimulatorQuestion } from '../server/chapterClassifier.ts';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL ausente');

const db = drizzle(databaseUrl);
const rows = await db.select().from(simulatorQuestions);

const signature = (question) => [
  question.normalized?.trim().toLocaleLowerCase('es-ES') || question.question.trim().toLocaleLowerCase('es-ES'),
  question.optionA.trim(),
  question.optionB.trim(),
  question.optionC.trim(),
  question.optionD.trim(),
  question.correctAnswer,
].join('│');

const perChapter = new Map(simulatorChapters.map((chapter) => [chapter.id, {
  code: chapter.code,
  titleEs: chapter.titleEs,
  officialRows: 0,
  poolRows: 0,
  officialUnique: new Set(),
  poolUnique: new Set(),
  totalUnique: new Set(),
  methods: { reviewed: 0, keyword: 0, unassigned: 0 },
}]));

for (const row of rows) {
  const assignment = classifySimulatorQuestion(row);
  if (!assignment.chapter) continue;
  const entry = perChapter.get(assignment.chapter.id);
  if (!entry) continue;
  const key = signature(row);
  entry.methods[assignment.method] += 1;
  entry.totalUnique.add(key);
  if (row.model === 'ORIGINAL') {
    entry.officialRows += 1;
    entry.officialUnique.add(key);
  } else {
    entry.poolRows += 1;
    entry.poolUnique.add(key);
  }
}

const report = [...perChapter.entries()].map(([id, entry]) => ({
  id,
  code: entry.code,
  titleEs: entry.titleEs,
  officialRows: entry.officialRows,
  officialUnique: entry.officialUnique.size,
  poolRows: entry.poolRows,
  poolUnique: entry.poolUnique.size,
  totalUnique: entry.totalUnique.size,
  methods: entry.methods,
}));

await writeFile('/home/ubuntu/chapter-simulator-audit.json', JSON.stringify(report, null, 2));
console.table(report.map((entry) => ({
  chapter: entry.code,
  official: entry.officialUnique,
  pool: entry.poolUnique,
  unique: entry.totalUnique,
  reviewed: entry.methods.reviewed,
  keyword: entry.methods.keyword,
})));
