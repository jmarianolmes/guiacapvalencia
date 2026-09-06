import type { SimulatorChapter } from '../shared/simulatorChapters';

export type CatalogOrigin = 'official' | 'non_official';
export type CatalogReviewStatus = 'reviewed' | 'provisional' | 'pending_review';

export type CatalogSourceRecord = {
  source: 'original_exams' | 'gva' | 'statistical_pool';
  model?: string;
  provaDate: string;
  questionNumber: number;
  subject: string;
  question: string;
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
};

export type QuestionCatalogEntry = {
  internalCode: string | null;
  normalizedKey: string;
  equivalenceKey: string;
  chapterId: string | null;
  chapterCode: string | null;
  group: 'common' | 'goods' | null;
  origin: CatalogOrigin;
  reviewStatus: CatalogReviewStatus;
  isVariant: boolean;
  occurrenceCount: number;
  sources: CatalogSourceRecord[];
};

export function normalizedQuestionKey(question: { normalizedKey?: string | null; normalized?: string | null; question: string }) {
  const value = question.normalizedKey || question.normalized || question.question;
  return String(value).replace(/\s+/g, ' ').trim().toLocaleLowerCase('es-ES');
}

function optionValue(question: CatalogSourceRecord, letter: string) {
  return question[`option${letter}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'];
}

function canonicalAnswerText(question: CatalogSourceRecord) {
  return optionValue(question, question.correctAnswer).replace(/\s+/g, ' ').trim().toLocaleLowerCase('es-ES');
}

export function questionEquivalenceKey(question: CatalogSourceRecord) {
  const options = ['A', 'B', 'C', 'D']
    .map((letter) => optionValue(question, letter).replace(/\s+/g, ' ').trim().toLocaleLowerCase('es-ES'))
    .sort()
    .join('¦');
  return `${normalizedQuestionKey(question)}│${options}│${canonicalAnswerText(question)}`;
}

export function questionGroupKey(question: CatalogSourceRecord) {
  return normalizedQuestionKey(question);
}

export function chapterCodeForInternalId(code: string) {
  return code
    .replace(/\s+bis$/i, 'B')
    .replace(/\./g, '')
    .replace(/\s+/g, '');
}

export function internalQuestionCode(
  chapter: Pick<SimulatorChapter, 'group' | 'code'>,
  ordinal: number,
  options: { nonOfficial?: boolean; variant?: boolean } = {},
) {
  const prefix = chapter.group === 'common' ? 'C' : 'M';
  const suffix = `${options.variant ? 'R' : ''}${options.nonOfficial ? 'NO' : ''}`;
  return `${prefix}${chapterCodeForInternalId(chapter.code)}${String(ordinal).padStart(4, '0')}${suffix}`;
}
