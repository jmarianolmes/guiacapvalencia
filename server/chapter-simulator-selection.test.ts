import { buildChapterAttempt, getNextChapterAttemptNumber, selectUniqueChapterQuestions, simulatorQuestionSignature } from './db';
import { describe, expect, it } from 'vitest';

type ChapterQuestion = Parameters<typeof selectUniqueChapterQuestions>[0][number];

function makeQuestion(id: number, model: string, normalized: string): ChapterQuestion {
  return {
    id,
    model,
    provaDate: model === 'ORIGINAL' ? '21/11/2020' : 'POOL',
    questionNumber: id,
    subject: 'Materiales Comunes',
    question: `Pregunta ${normalized}`,
    stem: '',
    optionA: 'Opción A',
    optionB: 'Opción B',
    optionC: 'Opción C',
    optionD: 'Opción D',
    correctAnswer: 'A',
    normalized,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };
}

describe('seleção de simulados por capítulo', () => {
  it('remove duplicidades e mantém a versão oficial antes da cópia estatística', () => {
    const official = makeQuestion(1, 'ORIGINAL', 'misma pregunta');
    const copiedPoolQuestion = makeQuestion(2, 'S01', 'misma pregunta');
    const unique = selectUniqueChapterQuestions([copiedPoolQuestion, official]);

    expect(unique).toHaveLength(1);
    expect(unique[0]?.model).toBe('ORIGINAL');
  });

  it('separa versões sem sobreposição de perguntas enquanto houver acervo', () => {
    const official = Array.from({ length: 55 }, (_, index) => makeQuestion(index + 1, 'ORIGINAL', `oficial-${index + 1}`));
    const pool = Array.from({ length: 10 }, (_, index) => makeQuestion(index + 101, 'A', `pool-${index + 1}`));
    const unique = selectUniqueChapterQuestions([...pool, ...official]);
    const firstAttempt = buildChapterAttempt(unique, 1);
    const secondAttempt = buildChapterAttempt(unique, 2);

    expect(firstAttempt.availableAttempts).toBe(2);
    expect(firstAttempt.questions).toHaveLength(50);
    expect(secondAttempt.questions).toHaveLength(15);
    expect(new Set(firstAttempt.questions.map(simulatorQuestionSignature))).toHaveLength(50);
    expect(secondAttempt.questions.some((question) => firstAttempt.questions.some((first) => simulatorQuestionSignature(first) === simulatorQuestionSignature(question)))).toBe(false);
    expect(firstAttempt.questions.every((question) => question.model === 'ORIGINAL')).toBe(true);
  });

  it('avança a nova tentativa e só volta à primeira após esgotar as versões', () => {
    expect(getNextChapterAttemptNumber(1, 6)).toBe(2);
    expect(getNextChapterAttemptNumber(5, 6)).toBe(6);
    expect(getNextChapterAttemptNumber(6, 6)).toBe(1);
    expect(getNextChapterAttemptNumber(1, 1)).toBe(1);
  });
});
