import fs from 'node:fs';
import path from 'node:path';
import { classifySimulatorQuestion } from '../server/chapterClassifier';
import { internalQuestionCode, questionEquivalenceKey, questionGroupKey, type CatalogSourceRecord, type QuestionCatalogEntry } from '../server/questionCatalog';

const root = path.resolve(import.meta.dirname, '..');
const dataDir = path.join(root, 'server', 'data');
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')) as any;

function makeRecord(q: any, source: CatalogSourceRecord['source'], date: string, number: number, model?: string): CatalogSourceRecord {
  return {
    source, model, provaDate: date, questionNumber: number, subject: q.subject ?? q.materia,
    question: q.question, stem: q.stem ?? q.question,
    optionA: q.optionA ?? q.options?.A, optionB: q.optionB ?? q.options?.B,
    optionC: q.optionC ?? q.options?.C, optionD: q.optionD ?? q.options?.D,
    correctAnswer: q.correctAnswer ?? q.answer,
  };
}

function add(map: Map<string, CatalogSourceRecord[]>, record: CatalogSourceRecord) {
  const key = questionGroupKey(record);
  const rows = map.get(key) ?? [];
  rows.push(record);
  map.set(key, rows);
}

function main() {
  const groups = new Map<string, CatalogSourceRecord[]>();
  const recent = read('original_exams.json') as Array<{ date: string; questions: any[] }>;
  const gva = read('gva_cap_mercancias_extracted.json') as { exams: Array<{ date: string; questions: any[] }> };
  const pools = read('simulator_questions.json') as any[][];

  for (const exam of recent) exam.questions.forEach((q, i) => add(groups, makeRecord(q, 'original_exams', exam.date, q.questionNumber ?? i + 1)));
  for (const exam of gva.exams) exam.questions.forEach((q, i) => add(groups, makeRecord(q, 'gva', exam.date, q.questionNumber ?? i + 1)));
  pools.forEach((pool, modelIndex) => pool.forEach((q, i) => add(groups, makeRecord(q, 'statistical_pool', q.prova, i + 1, String.fromCharCode(65 + modelIndex)))));

  const officialKeys = new Set<string>();
  for (const rows of groups.values()) if (rows.some((row) => row.source !== 'statistical_pool')) officialKeys.add(questionGroupKey(rows.find((row) => row.source !== 'statistical_pool')!));

  const entries: QuestionCatalogEntry[] = [];
  const counters = new Map<string, number>();
  for (const [normalizedKey, rows] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'es'))) {
    const officialRows = rows.filter((row) => row.source !== 'statistical_pool');
    const poolRows = rows.filter((row) => row.source === 'statistical_pool');
    const origin: 'official' | 'non_official' = officialRows.length > 0 ? 'official' : 'non_official';
    const representative = (officialRows[0] ?? poolRows[0])!;
    const classification = classifySimulatorQuestion(representative);
    const chapter = classification.chapter;
    const equivalences = new Set(rows.map(questionEquivalenceKey));
    const isVariant = rows.length > 1 || equivalences.size > 1;
    const counterKey = `${origin}:${chapter?.id ?? 'unassigned'}`;
    const ordinal = (counters.get(counterKey) ?? 0) + 1;
    counters.set(counterKey, ordinal);
    const internalCode = chapter
      ? internalQuestionCode(chapter, ordinal, { nonOfficial: origin === 'non_official', variant: isVariant })
      : null;
    entries.push({
      internalCode,
      normalizedKey,
      equivalenceKey: questionEquivalenceKey(representative),
      chapterId: chapter?.id ?? null,
      chapterCode: chapter?.code ?? null,
      group: chapter?.group ?? null,
      origin,
      reviewStatus: classification.method === 'reviewed' ? 'reviewed' : classification.chapter ? 'provisional' : 'pending_review',
      isVariant,
      occurrenceCount: rows.length,
      sources: rows,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    officialSourceRecords: recent.reduce((n, e) => n + e.questions.length, 0) + gva.exams.reduce((n, e) => n + e.questions.length, 0),
    statisticalPoolRecords: pools.reduce((n, p) => n + p.length, 0),
    uniqueCatalogEntries: entries.length,
    officialEntries: entries.filter((e) => e.origin === 'official').length,
    nonOfficialEntries: entries.filter((e) => e.origin === 'non_official').length,
    variantEntries: entries.filter((e) => e.isVariant).length,
    pendingReviewEntries: entries.filter((e) => e.reviewStatus === 'pending_review').length,
    provisionalEntries: entries.filter((e) => e.reviewStatus === 'provisional').length,
    reviewedEntries: entries.filter((e) => e.reviewStatus === 'reviewed').length,
    duplicateStatisticalRowsExcludedFromNonOfficial: entries.filter((e) => e.origin === 'official').reduce((n, e) => n + e.sources.filter((s) => s.source === 'statistical_pool').length, 0),
  };
  fs.writeFileSync(path.join(root, 'server', 'data', 'question_catalog.json'), JSON.stringify({ report, entries }, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'server', 'data', 'question_catalog_report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}

main();
