export type OfficialStatisticalQuestion = {
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
  normalized: string | null;
};

export type OfficialStatisticalModel = {
  model: string;
  sourceDate: string;
  questions: OfficialStatisticalQuestion[];
};

function toTimestamp(date: string) {
  const [day, month, year] = date.split('/').map(Number);
  return Date.UTC(year, month - 1, day);
}

function validateQuestion(question: OfficialStatisticalQuestion) {
  return question.question.trim().length > 0 &&
    question.stem.trim().length > 0 &&
    question.optionA.trim().length > 0 &&
    question.optionB.trim().length > 0 &&
    question.optionC.trim().length > 0 &&
    question.optionD.trim().length > 0 &&
    ['A', 'B', 'C', 'D'].includes(question.correctAnswer);
}

/**
 * Cria modelos S01–S24 a partir das provas públicas de 2020–2024.
 * As 10 provas mais recentes permanecem disponíveis apenas em Por Data Oficial
 * e os modelos A–J continuam sendo o pool estatístico original.
 */
export function buildOfficialStatisticalModels(questions: OfficialStatisticalQuestion[]): OfficialStatisticalModel[] {
  const candidates = questions.filter((question) => {
    const [, , year] = question.provaDate.split('/').map(Number);
    return year >= 2020 && year <= 2024;
  });
  const byDate = new Map<string, OfficialStatisticalQuestion[]>();
  candidates.forEach((question) => {
    const group = byDate.get(question.provaDate) ?? [];
    group.push(question);
    byDate.set(question.provaDate, group);
  });

  const dates = Array.from(byDate.keys()).sort((left, right) => toTimestamp(left) - toTimestamp(right));
  if (dates.length !== 24) {
    throw new Error(`Foram encontradas ${dates.length} provas GVA entre 2020 e 2024; eram esperadas 24.`);
  }

  return dates.map((date, index) => {
    const examQuestions = (byDate.get(date) ?? []).slice().sort((left, right) => left.questionNumber - right.questionNumber);
    if (examQuestions.length !== 100 || examQuestions.some((question, questionIndex) => question.questionNumber !== questionIndex + 1 || !validateQuestion(question))) {
      throw new Error(`A prova oficial ${date} não possui 100 questões sequenciais e gabaritadas para o pool estatístico.`);
    }
    return {
      model: `S${String(index + 1).padStart(2, '0')}`,
      sourceDate: date,
      questions: examQuestions,
    };
  });
}
