import fs from 'node:fs';
import path from 'node:path';
import { classifySimulatorQuestion } from '../server/chapterClassifier';

const root = path.resolve(import.meta.dirname, '..');
const dataDir = path.join(root, 'server', 'data');
const rawPool = JSON.parse(fs.readFileSync(path.join(dataDir, 'simulator_questions.json'), 'utf8')) as unknown[][];
const recent = JSON.parse(fs.readFileSync(path.join(dataDir, 'original_exams.json'), 'utf8')) as Array<{ date: string; questions: unknown[] }>;
const historical = JSON.parse(fs.readFileSync(path.join(dataDir, 'gva_cap_mercancias_extracted.json'), 'utf8')) as { exams: Array<{ date: string; questions: unknown[] }> };

const flatten = (value: unknown): any[] => Array.isArray(value) ? value.flatMap(flatten) : [value];
const official = [...recent, ...historical.exams].flatMap((exam) => exam.questions.map((question: any) => ({ ...question, provaDate: exam.date, subject: question.subject })));
const pool = flatten(rawPool);

const measure = (rows: any[]) => {
  const methods = { reviewed: 0, keyword: 0, unassigned: 0 };
  const chapters = new Map<string, number>();
  for (const row of rows) {
    const result = classifySimulatorQuestion(row);
    methods[result.method] += 1;
    if (result.chapter) chapters.set(result.chapter.code, (chapters.get(result.chapter.code) ?? 0) + 1);
  }
  return { total: rows.length, methods, chapters: Object.fromEntries([...chapters.entries()].sort()) };
};

const output = { official: measure(official), pool: measure(pool) };
fs.writeFileSync(path.join(root, 'tools', 'classification_measurement.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
