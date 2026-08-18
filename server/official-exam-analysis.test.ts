import { describe, expect, it } from 'vitest';

import { buildOfficialExamAnalysis, type OfficialQuestionRecord } from './officialExamAnalysis';

const baseQuestion: OfficialQuestionRecord = {
  model: 'ORIGINAL',
  provaDate: '01/01/2024',
  subject: 'Mercancias',
  question: '¿Cuál es el plazo máximo para presentar el documento CMR?',
  normalized: '¿cuál es el plazo máximo para presentar el documento cmr?',
  optionA: 'Un día.',
  optionB: 'Dos días.',
  optionC: 'Tres días.',
  optionD: 'Cuatro días.',
  correctAnswer: 'B',
};

describe('análise das provas oficiais', () => {
  it('agrupa questões idênticas, preserva o gabarito e mede a distribuição de respostas', () => {
    const analysis = buildOfficialExamAnalysis([
      baseQuestion,
      { ...baseQuestion, provaDate: '02/02/2024' },
      {
        ...baseQuestion,
        provaDate: '03/03/2024',
        subject: 'Materiales Comunes',
        question: '¿Cuándo debe realizarse el descanso diario?',
        normalized: '¿cuándo debe realizarse el descanso diario?',
        correctAnswer: 'A',
      },
    ]);

    expect(analysis.totalExams).toBe(3);
    expect(analysis.totalQuestions).toBe(3);
    expect(analysis.uniqueQuestions).toBe(2);
    expect(analysis.repeatedGroups).toBe(1);
    expect(analysis.repeatedQuestions[0]).toMatchObject({
      occurrences: 2,
      correctAnswer: 'B',
      exams: ['02/02/2024', '01/01/2024'],
    });
    expect(analysis.answerDistribution).toEqual([
      { answer: 'A', count: 1, percentage: '33.3%' },
      { answer: 'B', count: 2, percentage: '66.7%' },
      { answer: 'C', count: 0, percentage: '0.0%' },
      { answer: 'D', count: 0, percentage: '0.0%' },
    ]);
  });

  it('produz padrões de pegadinha rastreáveis às palavras presentes nos enunciados oficiais', () => {
    const analysis = buildOfficialExamAnalysis([baseQuestion, { ...baseQuestion, provaDate: '02/02/2024' }]);
    const titles = analysis.trapInsights.map((insight) => insight.title);

    expect(titles).toContain('Valores, limites e prazos');
    expect(titles).toContain('Documentação e transporte internacional');
    expect(analysis.memorizationGroups.find((group) => group.id === 'acronyms')?.questions[0]).toMatchObject({
      question: baseQuestion.question,
      correctAnswer: 'B',
    });
  });

  it('ignora integralmente registros do pool estatístico, mesmo quando preservam a data de uma prova', () => {
    const analysis = buildOfficialExamAnalysis([
      baseQuestion,
      { ...baseQuestion, model: 'S01', provaDate: '01/01/2024' },
      { ...baseQuestion, model: 'A', provaDate: '' },
    ]);

    expect(analysis.totalExams).toBe(1);
    expect(analysis.totalQuestions).toBe(1);
    expect(analysis.answerDistribution.find((item) => item.answer === 'B')?.count).toBe(1);
  });

  it('calcula prioridade por capítulo com frequência, repetição e presença em provas oficiais', () => {
    const analysis = buildOfficialExamAnalysis([
      baseQuestion,
      { ...baseQuestion, provaDate: '02/02/2024' },
      { ...baseQuestion, model: 'S01', provaDate: '03/03/2024' },
    ]);
    const regulation = analysis.chapterPriorities.find((chapter) => chapter.code === '2.2');

    expect(regulation).toMatchObject({
      count: 2,
      recurringCount: 2,
      examCoverage: 2,
      recentCoverage: 2,
      recurrenceRate: '100.0%',
    });
    expect(regulation?.priorityScore).toBeGreaterThan(0);
  });

  it('ordena as convocatórias oficiais da mais antiga para a mais recente', () => {
    const analysis = buildOfficialExamAnalysis([
      { ...baseQuestion, provaDate: '27/09/2025' },
      { ...baseQuestion, provaDate: '21/11/2020' },
      { ...baseQuestion, provaDate: '01/02/2025' },
    ]);

    expect(analysis.recurrenceByExam.map((item) => item.date)).toEqual([
      '21/11/2020',
      '01/02/2025',
      '27/09/2025',
    ]);
  });
});
