import { describe, expect, it } from 'vitest';
import { internalQuestionCode, questionEquivalenceKey } from './questionCatalog';

const chapter = (group: 'common' | 'goods', code: string) => ({ group, code });

const base = {
  source: 'statistical_pool' as const,
  provaDate: '01/01/2026',
  questionNumber: 1,
  subject: 'Mercancias',
  question: 'Pregunta de prueba',
  stem: 'Pregunta de prueba',
  optionA: 'Respuesta correcta',
  optionB: 'Distractor B',
  optionC: 'Distractor C',
  optionD: 'Distractor D',
  correctAnswer: 'A',
};

describe('catálogo interno de questões', () => {
  it('gera códigos pelo grupo e capítulo do sumário', () => {
    expect(internalQuestionCode(chapter('common', '1.1'), 1)).toBe('C110001');
    expect(internalQuestionCode(chapter('goods', '1.4'), 1, { variant: true })).toBe('M140001R');
    expect(internalQuestionCode(chapter('goods', '2.2'), 1, { nonOfficial: true })).toBe('M220001NO');
  });

  it('considera equivalentes as alternativas embaralhadas com a mesma resposta textual', () => {
    const reordered = {
      ...base,
      optionA: 'Distractor B',
      optionB: 'Respuesta correcta',
      optionC: 'Distractor C',
      optionD: 'Distractor D',
      correctAnswer: 'B',
    };
    expect(questionEquivalenceKey(base)).toBe(questionEquivalenceKey(reordered));
  });
});
