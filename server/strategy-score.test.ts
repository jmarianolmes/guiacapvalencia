import { describe, expect, it } from 'vitest';
import { calculateStrategySummary } from '../client/src/lib/strategyScore';

describe('calculadora da Estratégia', () => {
  it('calcula a pontuação e as questões puladas a partir de certas e erradas', () => {
    expect(calculateStrategySummary(60, 10)).toEqual({
      correct: 60,
      wrong: 10,
      skipped: 30,
      answered: 70,
      score: 55,
    });
  });

  it('mantém a distribuição limitada a 100 questões', () => {
    expect(calculateStrategySummary(90, 30)).toEqual({
      correct: 90,
      wrong: 10,
      skipped: 0,
      answered: 100,
      score: 85,
    });
  });
});
