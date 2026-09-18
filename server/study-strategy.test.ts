import { describe, expect, it } from 'vitest';
import { buildStudyStrategy } from './studyStrategy';

describe('study strategy', () => {
  it('ignores statistical simulations and recommends two-option doubts for a mid-range score', () => {
    const strategy = buildStudyStrategy([
      { questionCount: 100, correctAnswers: 40, wrongAnswers: 30, mode: 'official' },
      { questionCount: 100, correctAnswers: 42, wrongAnswers: 28, mode: 'chapter' },
      { questionCount: 100, correctAnswers: 99, wrongAnswers: 1, mode: 'statistical' },
    ], [{ wrongCount: 2 }, { wrongCount: 1 }]);

    expect(strategy.attempts).toBe(2);
    expect(strategy.averageCorrect).toBe(41);
    expect(strategy.recommendation).toBe('balanced');
    expect(strategy.recurringWrongQuestions).toBe(1);
    expect(strategy.stepsPt[1]).toContain('entre duas');
  });

  it('protects a strong historical score from unnecessary guesses', () => {
    const strategy = buildStudyStrategy([
      { questionCount: 100, correctAnswers: 50, wrongAnswers: 10, mode: 'official' },
      { questionCount: 100, correctAnswers: 48, wrongAnswers: 12, mode: 'chapter' },
    ]);

    expect(strategy.recommendation).toBe('conservative');
    expect(strategy.stepsPt[2]).toContain('desconhecidas');
  });
});
