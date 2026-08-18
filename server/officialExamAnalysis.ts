export type OfficialQuestionRecord = {
  model: string;
  provaDate: string;
  subject: string;
  question: string;
  normalized: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
};

import { classifySimulatorQuestion } from './chapterClassifier';
import { simulatorChapters } from '../shared/simulatorChapters';

type AnswerKey = 'A' | 'B' | 'C' | 'D';

type Topic = {
  id: string;
  code: string;
  group: 'common' | 'goods';
  titlePt: string;
  titleEs: string;
  keywords: string[];
};

type RepeatedOfficialQuestion = {
  percentage: string;
  occurrences: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: AnswerKey;
  exams: string[];
};

type TrapInsight = {
  title: string;
  percentage: string;
  count: number;
  uniqueQuestionCount: number;
  descriptionPt: string;
  descriptionEs: string;
  questions: Array<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: AnswerKey;
    occurrences: number;
    exams: string[];
  }>;
};

type MemorizationGroup = {
  id: string;
  titlePt: string;
  titleEs: string;
  descriptionPt: string;
  descriptionEs: string;
  questions: RepeatedOfficialQuestion[];
};

const ANSWERS: AnswerKey[] = ['A', 'B', 'C', 'D'];

const OFFICIAL_TOPICS: Topic[] = [
  { id: 'driving-time', code: '2.1', group: 'common', titlePt: 'Condução, descanso e tacógrafo', titleEs: 'Conducción, descanso y tacógrafo', keywords: ['tacografo', 'descanso', 'pausa', 'jornada', 'conduccion diaria'] },
  { id: 'mechanics', code: '1.1', group: 'common', titlePt: 'Mecânica, transmissão e potência', titleEs: 'Mecánica, transmisión y potencia', keywords: ['motor', 'potencia', 'par motor', 'embrague', 'transmision', 'diferencial', 'caja de cambio'] },
  { id: 'brakes-safety', code: '1.2', group: 'common', titlePt: 'Travagem e sistemas de segurança', titleEs: 'Frenos y sistemas de seguridad', keywords: ['freno', 'retardador', 'abs', 'esp', 'asr', 'ebs', 'aebs', 'adas'] },
  { id: 'eco-driving', code: '1.3', group: 'common', titlePt: 'Consumo e condução eficiente', titleEs: 'Consumo y conducción eficiente', keywords: ['consumo', 'carburante', 'combustible', 'conduccion eficiente'] },
  { id: 'road-risk', code: '1.3 bis', group: 'common', titlePt: 'Riscos de via, trânsito e clima', titleEs: 'Riesgos de vía, tráfico y clima', keywords: ['lluvia', 'niebla', 'nieve', 'viento', 'trafico', 'adelantamiento', 'distancia de seguridad'] },
  { id: 'health-emergency', code: '3.4–3.5', group: 'common', titlePt: 'Saúde, fadiga e emergências', titleEs: 'Salud, fatiga y emergencias', keywords: ['alcohol', 'droga', 'fatiga', 'medicamento', 'sueno', 'incendio', 'extintor', 'primeros auxilios', 'hemorrag'] },
  { id: 'load-stowage', code: '1.4', group: 'goods', titlePt: 'Carga, pesos e estiva', titleEs: 'Carga, pesos y estiba', keywords: ['estiba', 'carga', 'masa maxima', 'mma', 'eje', 'embalaje', 'amarre', 'sujecion', 'mercancia peligrosa'] },
  { id: 'regulation-international', code: '2.2', group: 'goods', titlePt: 'Regulamentação e transporte internacional', titleEs: 'Reglamentación y transporte internacional', keywords: ['cmr', 'carta de porte', 'contrato de transporte', 'transportista', 'cargador', 'junta arbitral', 'autorizacion', 'frontera', 'aduan', 'cabotaje', 'cemt', 'lott', 'rott'] },
  { id: 'transport-market', code: '3.7', group: 'goods', titlePt: 'Mercado e empresas de transporte', titleEs: 'Mercado y empresas de transporte', keywords: ['mercado', 'empresa de transporte', 'operador', 'logistica', 'sector del transporte'] },
];

const TRAP_RULES = [
  {
    title: 'Exceções e condições especiais',
    pattern: /\bsalvo\b|\bexcepto\b|\ba excepción\b|\bno se aplica\b|\bexcepciones?\b/i,
    pt: 'Atenção especial às expressões “salvo”, “exceto” e às condições em que uma regra deixa de se aplicar. Leia a frase inteira antes de escolher a alternativa.',
    es: 'Presta especial atención a “salvo”, “excepto” y a las condiciones en las que una regla deja de aplicarse. Lee la frase completa antes de elegir.',
  },
  {
    title: 'Valores, limites e prazos',
    pattern: /\bmáximo\b|\bmínimo\b|\bsuperior\b|\binferior\b|\bplazo\b|\bhoras?\b|\bkilómetros?\b|\btoneladas?\b/i,
    pt: 'Questões com números e limites exigem comparar unidade, condição e prazo. Não responda apenas pelo número que parece familiar.',
    es: 'Las preguntas con cifras y límites exigen comparar unidad, condición y plazo. No respondas solo por el número que parece familiar.',
  },
  {
    title: 'Documentação e transporte internacional',
    pattern: /\bcmr\b|\bcarta de porte\b|\bautorizaci[oó]n\b|\baduan|\btr[aá]nsito\b|\bcabotaje\b/i,
    pt: 'Revise quem emite, conserva ou apresenta cada documento. Nas questões CMR e internacionais, uma palavra pode mudar o responsável ou o procedimento.',
    es: 'Repasa quién emite, conserva o presenta cada documento. En CMR e internacional, una palabra puede cambiar al responsable o al procedimiento.',
  },
  {
    title: 'Tempos de condução e descanso',
    pattern: /\btac[oó]grafo\b|\bdescanso\b|\bconducci[oó]n\b|\bjornada\b|\bpausa\b/i,
    pt: 'Distinga condução, pausa, descanso diário e descanso semanal. A prova costuma trocar o período ou a exceção aplicável.',
    es: 'Distingue conducción, pausa, descanso diario y descanso semanal. El examen suele cambiar el período o la excepción aplicable.',
  },
  {
    title: 'Segurança, carga e estabilidade',
    pattern: /\bcarga\b|\bestiba\b|\bestabilidad\b|\briesgo\b|\baccidente\b|\bincendio\b/i,
    pt: 'Priorize a alternativa que reduz o risco e respeita a estabilidade da carga. Verifique se a opção descreve prevenção, e não apenas uma consequência.',
    es: 'Prioriza la alternativa que reduce el riesgo y respeta la estabilidad de la carga. Comprueba si la opción describe prevención y no solo una consecuencia.',
  },
  {
    title: 'Afirmações absolutas',
    pattern: /\bsiempre\b|\bnunca\b|\búnicamente\b|\bexclusivamente\b|\ben todos los casos\b/i,
    pt: 'Palavras absolutas como “sempre” e “nunca” merecem revisão: a regulamentação frequentemente prevê condições e exceções.',
    es: 'Las palabras absolutas como “siempre” y “nunca” merecen revisión: la normativa suele prever condiciones y excepciones.',
  },
  {
    title: 'Proibições, obrigações e responsabilidade',
    pattern: /\bprohibid|\bno puede\b|\bobligatori|\bresponsab|\bdebe(?:n)?\b/i,
    pt: 'Destaque os verbos que impõem proibição, dever ou responsabilidade. A troca do sujeito responsável costuma ser o distrator decisivo.',
    es: 'Destaca los verbos que imponen prohibición, deber o responsabilidad. El cambio del sujeto responsable suele ser el distractor decisivo.',
  },
  {
    title: 'Siglas e sistemas de segurança',
    pattern: /\babs\b|\besp\b|\basr\b|\baebs\b|\bebs\b|\bfap\b|\badas\b/i,
    pt: 'Associe cada sigla à sua função real. As alternativas-trampa normalmente atribuem a um sistema de segurança uma função de outro.',
    es: 'Asocia cada sigla con su función real. Los distractores suelen atribuir a un sistema de seguridad la función de otro.',
  },
  {
    title: 'Carga, pesos e operações',
    pattern: /\bmasa\b|\bpeso\b|\bcarga y descarga\b|\bdescarga\b|\bmanipulaci[oó]n\b/i,
    pt: 'Verifique limite, operação e quem pode executá-la. Em carga e descarga, uma condição técnica ou de segurança altera a regra.',
    es: 'Comprueba el límite, la operación y quién puede ejecutarla. En carga y descarga, una condición técnica o de seguridad cambia la regla.',
  },
  {
    title: 'Mecânica, transmissão e travagem',
    pattern: /\btransmisi[oó]n\b|\bdiferencial\b|\bfreno\b|\bretardador\b|\bpotencia\b|\bpar motor\b/i,
    pt: 'Separe a função de cada componente mecânico. A prova usa peças reais em sistemas errados para criar alternativas-trampa plausíveis.',
    es: 'Separa la función de cada componente mecánico. El examen usa piezas reales en sistemas equivocados para crear distractores plausibles.',
  },
] as const;

const MEMORIZATION_RULES = [
  {
    id: 'acronyms',
    titlePt: 'Siglas e sistemas',
    titleEs: 'Siglas y sistemas',
    descriptionPt: 'Siglas e sistemas que apareceram em mais de uma prova oficial. Memorize a função, não apenas o nome.',
    descriptionEs: 'Siglas y sistemas que aparecieron en más de un examen oficial. Memoriza su función, no solo el nombre.',
    pattern: /\b(?:abs|esp|asr|bas|aebs|ebs|adas|fap|cmr|cemt|cap|mma|pas)\b/i,
  },
  {
    id: 'limits',
    titlePt: 'Prazos, tempos e limites',
    titleEs: 'Plazos, tiempos y límites',
    descriptionPt: 'Valores e condições numéricas recorrentes. Revise a unidade, o período e a exceção aplicável.',
    descriptionEs: 'Valores y condiciones numéricas recurrentes. Repasa la unidad, el período y la excepción aplicable.',
    pattern: /\b\d+(?:[,.]\d+)?\b|\bhoras?\b|\bminutos?\b|\bmaxim[oa]\b|\bminim[oa]\b|\bsemanas?\b|\bkilometros?\b|\btoneladas?\b/i,
  },
  {
    id: 'tachograph',
    titlePt: 'Tacógrafo, descanso e condução',
    titleEs: 'Tacógrafo, descanso y conducción',
    descriptionPt: 'Regras recorrentes de registo, pausas, descanso e condução. Leia sempre quem, quando e em que condição.',
    descriptionEs: 'Reglas recurrentes de registro, pausas, descanso y conducción. Lee siempre quién, cuándo y bajo qué condición.',
    pattern: /\btacografo\b|\bdescanso\b|\bpausa\b|\bconduccion\b|\bdisco-diagrama\b/i,
  },
  {
    id: 'load-documents',
    titlePt: 'Carga, estiva e documentação',
    titleEs: 'Carga, estiba y documentación',
    descriptionPt: 'Pontos recorrentes sobre segurança da carga e documentação. Observe o responsável, o limite e o procedimento.',
    descriptionEs: 'Puntos recurrentes sobre seguridad de la carga y documentación. Observa al responsable, el límite y el procedimiento.',
    pattern: /\bcarga\b|\bestiba\b|\bembalaje\b|\bcarta de porte\b|\bautorizacion\b|\bcmr\b|\btransportista\b|\bcargador\b/i,
  },
] as const;

function canonicalSubject(subject: string) {
  return subject.toLocaleLowerCase('es-ES').includes('mercanc') ? 'Mercancías' : 'Materiales Comunes';
}

function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('es-ES');
}

function canonicalText(question: OfficialQuestionRecord) {
  return normalizeText(question.normalized || question.question);
}

function questionSignature(question: OfficialQuestionRecord) {
  return [
    canonicalText(question),
    question.optionA.trim(),
    question.optionB.trim(),
    question.optionC.trim(),
    question.optionD.trim(),
    question.correctAnswer,
  ].join('\u001f');
}

function percentage(value: number, total: number) {
  return `${((value / total) * 100).toFixed(1)}%`;
}

function dateStamp(date: string) {
  const [day, month, year] = date.split('/').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function buildOfficialExamAnalysis(records: OfficialQuestionRecord[]) {
  const officialQuestions = records.filter((question) => question.model === 'ORIGINAL');
  const totalQuestions = officialQuestions.length;
  const examDates = Array.from(new Set(officialQuestions.map((question) => question.provaDate))).sort((left, right) => dateStamp(left) - dateStamp(right));
  const answerCounts = new Map<AnswerKey, number>(ANSWERS.map((answer) => [answer, 0]));
  const subjectCounts = new Map<string, number>([
    ['Materiales Comunes', 0],
    ['Mercancías', 0],
  ]);
  const repeatedGroups = new Map<string, { question: OfficialQuestionRecord; exams: Set<string>; occurrences: number }>();
  const topicCounts = new Map<string, number>(OFFICIAL_TOPICS.map((topic) => [topic.id, 0]));

  for (const question of officialQuestions) {
    if (ANSWERS.includes(question.correctAnswer as AnswerKey)) {
      const answer = question.correctAnswer as AnswerKey;
      answerCounts.set(answer, (answerCounts.get(answer) ?? 0) + 1);
    }

    const subject = canonicalSubject(question.subject);
    subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);

    const signature = questionSignature(question);
    const group = repeatedGroups.get(signature);
    if (group) {
      group.occurrences += 1;
      group.exams.add(question.provaDate);
    } else {
      repeatedGroups.set(signature, {
        question,
        exams: new Set([question.provaDate]),
        occurrences: 1,
      });
    }

    const topic = OFFICIAL_TOPICS.find((candidate) => candidate.keywords.some((keyword) => canonicalText(question).includes(keyword)));
    if (topic) topicCounts.set(topic.id, (topicCounts.get(topic.id) ?? 0) + 1);
  }

  const recurringSignatures = new Set(Array.from(repeatedGroups.entries())
    .filter(([, group]) => group.occurrences >= 2)
    .map(([signature]) => signature));
  const recentExamDates = new Set(examDates.slice(-8));
  const chapterMetrics = new Map(simulatorChapters.map((chapter) => [chapter.id, {
    chapter,
    count: 0,
    recurringCount: 0,
    examDates: new Set<string>(),
    recentExamDates: new Set<string>(),
    reviewedCount: 0,
    keywordCount: 0,
  }]));

  for (const question of officialQuestions) {
    const classification = classifySimulatorQuestion(question);
    if (!classification.chapter) continue;
    const metrics = chapterMetrics.get(classification.chapter.id);
    if (!metrics) continue;
    metrics.count += 1;
    metrics.examDates.add(question.provaDate);
    if (recentExamDates.has(question.provaDate)) metrics.recentExamDates.add(question.provaDate);
    if (recurringSignatures.has(questionSignature(question))) metrics.recurringCount += 1;
    if (classification.method === 'reviewed') metrics.reviewedCount += 1;
    if (classification.method === 'keyword') metrics.keywordCount += 1;
  }

  const maxChapterCount = Math.max(1, ...Array.from(chapterMetrics.values()).map((metrics) => metrics.count));
  const chapterPriorities = Array.from(chapterMetrics.values())
    .filter((metrics) => metrics.count > 0)
    .map((metrics) => {
      const frequencyRate = metrics.count / totalQuestions;
      const recurrenceRate = metrics.recurringCount / metrics.count;
      const examCoverageRate = metrics.examDates.size / Math.max(1, examDates.length);
      const recentCoverageRate = metrics.recentExamDates.size / Math.max(1, recentExamDates.size);
      const priorityScore = Math.round(
        (metrics.count / maxChapterCount) * 55
        + recurrenceRate * 25
        + examCoverageRate * 10
        + recentCoverageRate * 10,
      );
      const action = priorityScore >= 70 ? 'intensive' : priorityScore >= 45 ? 'reinforce' : 'maintain';
      return {
        id: metrics.chapter.id,
        code: metrics.chapter.code,
        group: metrics.chapter.group,
        titlePt: metrics.chapter.titlePt,
        titleEs: metrics.chapter.titleEs,
        count: metrics.count,
        percentage: percentage(metrics.count, totalQuestions),
        recurringCount: metrics.recurringCount,
        recurrenceRate: percentage(metrics.recurringCount, metrics.count),
        examCoverage: metrics.examDates.size,
        examCoverageRate: percentage(metrics.examDates.size, Math.max(1, examDates.length)),
        recentCoverage: metrics.recentExamDates.size,
        recentCoverageRate: percentage(metrics.recentExamDates.size, Math.max(1, recentExamDates.size)),
        reviewedCount: metrics.reviewedCount,
        keywordCount: metrics.keywordCount,
        priorityScore,
        action,
      };
    })
    .sort((left, right) => right.priorityScore - left.priorityScore || right.count - left.count || left.code.localeCompare(right.code, 'es'));
  const recurrenceByExam = examDates.map((date) => {
    const examQuestions = officialQuestions.filter((question) => question.provaDate === date);
    const recurring = examQuestions.filter((question) => recurringSignatures.has(questionSignature(question))).length;
    return { date, total: examQuestions.length, recurring, percentage: percentage(recurring, examQuestions.length || 1) };
  });

  const repeatedQuestions: RepeatedOfficialQuestion[] = Array.from(repeatedGroups.values())
    .filter((group) => group.occurrences >= 2)
    .map((group) => ({
      percentage: percentage(group.occurrences, examDates.length),
      occurrences: group.occurrences,
      question: group.question.question,
      optionA: group.question.optionA,
      optionB: group.question.optionB,
      optionC: group.question.optionC,
      optionD: group.question.optionD,
      correctAnswer: group.question.correctAnswer as AnswerKey,
      exams: Array.from(group.exams).sort((left, right) => {
        const [leftDay, leftMonth, leftYear] = left.split('/').map(Number);
        const [rightDay, rightMonth, rightYear] = right.split('/').map(Number);
        return Date.UTC(rightYear, rightMonth - 1, rightDay) - Date.UTC(leftYear, leftMonth - 1, leftDay);
      }),
    }))
    .sort((left, right) => right.occurrences - left.occurrences || left.question.localeCompare(right.question, 'es'));

  const trapInsights: TrapInsight[] = TRAP_RULES.map((rule) => {
    const count = officialQuestions.filter((question) => rule.pattern.test(canonicalText(question))).length;
    const matchingGroups = Array.from(repeatedGroups.values())
      .filter((group) => rule.pattern.test(canonicalText(group.question)))
      .sort((left, right) => right.occurrences - left.occurrences || left.question.question.localeCompare(right.question.question, 'es'));
    return {
      title: rule.title,
      percentage: percentage(count, totalQuestions),
      count,
      uniqueQuestionCount: matchingGroups.length,
      descriptionPt: `${rule.pt} Identificado em ${count} das ${totalQuestions} questões oficiais analisadas.`,
      descriptionEs: `${rule.es} Identificado en ${count} de las ${totalQuestions} preguntas oficiales analizadas.`,
      questions: matchingGroups.map((group) => ({
        question: group.question.question,
        optionA: group.question.optionA,
        optionB: group.question.optionB,
        optionC: group.question.optionC,
        optionD: group.question.optionD,
        correctAnswer: group.question.correctAnswer as AnswerKey,
        occurrences: group.occurrences,
        exams: Array.from(group.exams).sort((left, right) => {
          const [leftDay, leftMonth, leftYear] = left.split('/').map(Number);
          const [rightDay, rightMonth, rightYear] = right.split('/').map(Number);
          return Date.UTC(rightYear, rightMonth - 1, rightDay) - Date.UTC(leftYear, leftMonth - 1, leftDay);
        }),
      })),
    };
  }).filter((insight) => insight.count > 0).sort((left, right) => right.count - left.count);

  const memorizationGroups: MemorizationGroup[] = MEMORIZATION_RULES.map((rule) => ({
    id: rule.id,
    titlePt: rule.titlePt,
    titleEs: rule.titleEs,
    descriptionPt: rule.descriptionPt,
    descriptionEs: rule.descriptionEs,
    questions: repeatedQuestions.filter((question) => rule.pattern.test(normalizeText(question.question))).slice(0, 8),
  })).filter((group) => group.questions.length > 0);

  return {
    totalQuestions,
    totalExams: examDates.length,
    uniqueQuestions: repeatedGroups.size,
    repeatedAppearances: repeatedQuestions.reduce((total, question) => total + question.occurrences, 0),
    repeatedGroups: repeatedQuestions.length,
    answerDistribution: ANSWERS.map((answer) => ({
      answer,
      count: answerCounts.get(answer) ?? 0,
      percentage: percentage(answerCounts.get(answer) ?? 0, totalQuestions),
    })),
    subjectDistribution: Array.from(subjectCounts.entries()).map(([subject, count]) => ({
      subject,
      count,
      percentage: percentage(count, totalQuestions),
    })),
    topicDistribution: OFFICIAL_TOPICS.map((topic) => ({
      ...topic,
      count: topicCounts.get(topic.id) ?? 0,
      percentage: percentage(topicCounts.get(topic.id) ?? 0, totalQuestions),
    })).filter((topic) => topic.count > 0).sort((left, right) => right.count - left.count),
    chapterPriorities,
    recurrenceByExam,
    topRepeated: repeatedQuestions.slice(0, 10),
    repeatedQuestions,
    trapInsights,
    memorizationGroups,
  };
}
