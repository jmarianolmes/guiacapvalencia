import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ANSWERS = new Set(['A', 'B', 'C', 'D']);

function readJson<T>(relativePath: string) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8')) as T;
}

describe('integridade dos gabaritos do Simulado', () => {
  it('mantém todas as 1.000 questões estatísticas com quatro alternativas e gabarito A–D', () => {
    const pools = readJson<Array<Array<{
      question: string;
      options: Record<string, string>;
      answer: string;
    }>>>('./data/simulator_questions.json');
    const questions = pools.flat();

    expect(questions).toHaveLength(1000);
    for (const question of questions) {
      expect(question.question.trim()).not.toBe('');
      expect(question.options.A?.trim()).not.toBe('');
      expect(question.options.B?.trim()).not.toBe('');
      expect(question.options.C?.trim()).not.toBe('');
      expect(question.options.D?.trim()).not.toBe('');
      expect(ANSWERS.has(question.answer)).toBe(true);
    }
  });

  it('mantém as 10 provas originais recentes completas e com gabaritos válidos', () => {
    const exams = readJson<Array<{
      date: string;
      questions: Array<{
        questionNumber: number;
        options: Record<string, string>;
        answer: string;
      }>;
    }>>('./data/original_exams.json');

    expect(exams).toHaveLength(10);
    for (const exam of exams) {
      expect(exam.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(exam.questions).toHaveLength(100);
      expect(exam.questions.map((question) => question.questionNumber)).toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
      for (const question of exam.questions) {
        expect(question.options.A?.trim()).not.toBe('');
        expect(question.options.B?.trim()).not.toBe('');
        expect(question.options.C?.trim()).not.toBe('');
        expect(question.options.D?.trim()).not.toBe('');
        expect(ANSWERS.has(question.answer)).toBe(true);
      }
    }
  });

  it('mantém as 24 provas GVA extraídas sem falhas e com 2.400 gabaritos validados', () => {
    const data = readJson<{
      failures: unknown[];
      exams: Array<{
        questions: Array<{
          options: Record<string, string>;
          answer: string;
          answerConfidence: number;
        }>;
      }>;
    }>('./data/gva_cap_mercancias_extracted.json');

    expect(data.failures).toEqual([]);
    expect(data.exams).toHaveLength(24);
    const questions = data.exams.flatMap((exam) => exam.questions);
    expect(questions).toHaveLength(2400);
    for (const question of questions) {
      expect(question.options.A?.trim()).not.toBe('');
      expect(question.options.B?.trim()).not.toBe('');
      expect(question.options.C?.trim()).not.toBe('');
      expect(question.options.D?.trim()).not.toBe('');
      expect(ANSWERS.has(question.answer)).toBe(true);
      expect(question.answerConfidence).toBeGreaterThanOrEqual(20);
    }
  });
});
