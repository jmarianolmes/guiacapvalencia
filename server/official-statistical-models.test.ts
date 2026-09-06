import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { buildOfficialStatisticalModels } from './officialStatisticalModels';

describe('modelos estatísticos derivados das provas GVA', () => {
  it('cria 24 modelos completos sem alterar enunciados, alternativas ou gabaritos oficiais', () => {
    const source = JSON.parse(readFileSync(new URL('./data/gva_cap_mercancias_extracted.json', import.meta.url), 'utf8')) as {
      exams: Array<{
        date: string;
        questions: Array<{
          questionNumber: number;
          subject: string;
          question: string;
          stem: string;
          options: { A: string; B: string; C: string; D: string };
          answer: string;
        }>;
      }>;
    };
    const officialRows = source.exams.flatMap((exam) => exam.questions.map((question) => ({
      model: 'ORIGINAL',
      provaDate: exam.date,
      questionNumber: question.questionNumber,
      subject: question.subject,
      question: question.question,
      stem: question.stem,
      optionA: question.options.A,
      optionB: question.options.B,
      optionC: question.options.C,
      optionD: question.options.D,
      correctAnswer: question.answer,
      normalized: question.stem.toLocaleLowerCase('es-ES'),
    })));

    const models = buildOfficialStatisticalModels(officialRows);

    expect(models).toHaveLength(24);
    expect(models.map((model) => model.model)).toEqual(Array.from({ length: 24 }, (_, index) => `S${String(index + 1).padStart(2, '0')}`));
    expect(models.flatMap((model) => model.questions)).toHaveLength(2400);
    for (const model of models) {
      expect(model.questions.map((question) => question.questionNumber)).toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
      expect(model.questions.every((question) => ['A', 'B', 'C', 'D'].includes(question.correctAnswer))).toBe(true);
    }
  });
});
