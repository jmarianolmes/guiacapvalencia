import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Answer = 'A' | 'B' | 'C' | 'D';

interface ExtractedQuestion {
  questionNumber: number;
  subject: 'Mercancias' | 'Materiales Comunes';
  question: string;
  stem: string;
  options: Record<Answer, string>;
  answer: Answer;
  answerConfidence: number;
}

interface ExtractedExam {
  date: string;
  questions: ExtractedQuestion[];
}

interface ExtractionFile {
  exams: ExtractedExam[];
  failures: Array<{ date: string; error: string }>;
}

const file = new URL('./data/gva_cap_mercancias_extracted.json', import.meta.url);
const extraction = JSON.parse(readFileSync(file, 'utf8')) as ExtractionFile;

describe('extração das provas oficiais GVA', () => {
  it('inclui 24 convocatórias válidas, sem falhas de leitura', () => {
    expect(extraction.failures).toEqual([]);
    expect(extraction.exams).toHaveLength(24);
    expect(extraction.exams.map((exam) => exam.date)).toEqual([
      '21/11/2020', '13/03/2021', '29/05/2021', '24/07/2021', '25/09/2021', '27/11/2021',
      '29/01/2022', '02/04/2022', '28/05/2022', '23/07/2022', '24/09/2022', '26/11/2022',
      '28/01/2023', '25/03/2023', '27/05/2023', '15/07/2023', '23/09/2023', '25/11/2023',
      '27/01/2024', '23/03/2024', '25/05/2024', '13/07/2024', '28/09/2024', '30/11/2024',
    ]);
  });

  it('mantém 100 questões em cada prova, com separação oficial entre Mercancías e Comunes', () => {
    for (const exam of extraction.exams) {
      expect(exam.questions).toHaveLength(100);
      expect(exam.questions.map((question) => question.questionNumber)).toEqual(Array.from({ length: 100 }, (_, index) => index + 1));
      expect(exam.questions.filter((question) => question.subject === 'Mercancias')).toHaveLength(25);
      expect(exam.questions.filter((question) => question.subject === 'Materiales Comunes')).toHaveLength(75);
    }
  });

  it('preserva alternativas completas, gabaritos A–D e contraste de leitura acima do limiar', () => {
    const answers = extraction.exams.flatMap((exam) => exam.questions.map((question) => question.answer));
    expect(answers).toHaveLength(2400);
    for (const exam of extraction.exams) {
      for (const question of exam.questions) {
        expect(question.question.trim()).not.toBe('');
        expect(question.stem.trim()).not.toBe('');
        expect(question.options.A.trim()).not.toBe('');
        expect(question.options.B.trim()).not.toBe('');
        expect(question.options.C.trim()).not.toBe('');
        expect(question.options.D.trim()).not.toBe('');
        expect(['A', 'B', 'C', 'D']).toContain(question.answer);
        expect(question.answerConfidence).toBeGreaterThanOrEqual(20);
      }
    }
    expect(new Set(answers)).toEqual(new Set<Answer>(['A', 'B', 'C', 'D']));
  });
});
