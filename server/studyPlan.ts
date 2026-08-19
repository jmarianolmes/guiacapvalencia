type Language = 'pt' | 'es';

type ChapterPriority = {
  id: string;
  code: string;
  group: 'common' | 'goods';
  titlePt: string;
  titleEs: string;
  priorityScore: number;
  action: string;
};

type StudyProfileInput = {
  track: 'goods' | 'passengers';
  targetExamDate: string | null;
  dailyStudyMinutes: number;
  planEnabled: boolean;
};

type SimulatorResultInput = {
  questionCount: number;
  correctAnswers: number;
  wrongAnswers: number;
  blankAnswers: number;
  chapterId: string | null;
  mode: string;
  createdAt: Date;
};

export type Readiness = {
  status: 'insufficient' | 'reinforce' | 'evolving' | 'good' | 'high';
  score: number | null;
  validAttempts: number;
  explanationPt: string;
  explanationEs: string;
  weakChapterIds: string[];
};

export type StudyActivity = {
  type: 'temario' | 'chapter' | 'review' | 'official';
  titlePt: string;
  titleEs: string;
  detailPt: string;
  detailEs: string;
  estimatedMinutes: number;
  optional?: boolean;
};

export type StudyPlanDay = {
  date: string;
  labelPt: string;
  labelEs: string;
  activities: StudyActivity[];
};

export type StudyPlan = {
  status: 'disabled' | 'missing_date' | 'passengers_coming_soon' | 'diagnostic' | 'complete' | 'accelerated' | 'emergency';
  daysUntilExam: number | null;
  messagePt: string;
  messageEs: string;
  dailyStudyMinutes: number;
  recentExamWindow: number;
  readiness: Readiness;
  days: StudyPlanDay[];
};

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function toIsoDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function dayLabel(timestamp: number, language: Language) {
  return new Intl.DateTimeFormat(language === 'pt' ? 'pt-BR' : 'es-ES', {
    weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'UTC',
  }).format(new Date(timestamp));
}

function normalizeDailyMinutes(value: number) {
  return [40, 60, 90].includes(value) ? value : 60;
}

function validResults(results: SimulatorResultInput[]) {
  return results
    .filter((result) => result.questionCount >= 50)
    .filter((result) => (result.correctAnswers + result.wrongAnswers) / result.questionCount >= 0.6)
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export function buildReadiness(results: SimulatorResultInput[], priorities: ChapterPriority[]): Readiness {
  const attempts = validResults(results);
  if (attempts.length < 3) {
    return {
      status: 'insufficient',
      score: null,
      validAttempts: attempts.length,
      explanationPt: `Dados insuficientes: conclua mais ${Math.max(0, 3 - attempts.length)} simulados válidos com pelo menos 50 questões e 60% de respostas marcadas.`,
      explanationEs: `Datos insuficientes: completa ${Math.max(0, 3 - attempts.length)} simulacros válidos más con al menos 50 preguntas y 60% de respuestas marcadas.`,
      weakChapterIds: [],
    };
  }

  const recentAttempts = attempts.slice(0, 8);
  const weighted = recentAttempts.reduce((total, result, index) => {
    const weight = recentAttempts.length - index;
    return total + (result.correctAnswers / result.questionCount) * 100 * weight;
  }, 0);
  const totalWeight = recentAttempts.reduce((total, _result, index) => total + recentAttempts.length - index, 0);
  const consistencyBonus = Math.min(8, Math.max(0, attempts.length - 3) * 2);
  const score = Math.round(Math.min(100, weighted / totalWeight + consistencyBonus));

  const chapterResults = new Map<string, SimulatorResultInput[]>();
  for (const result of attempts) {
    if (!result.chapterId) continue;
    const group = chapterResults.get(result.chapterId) ?? [];
    group.push(result);
    chapterResults.set(result.chapterId, group);
  }

  const weakChapterIds = priorities
    .filter((chapter) => chapterResults.has(chapter.id))
    .map((chapter) => {
      const entries = chapterResults.get(chapter.id) ?? [];
      const accuracy = entries.reduce((total, entry) => total + entry.correctAnswers / entry.questionCount, 0) / entries.length;
      return { id: chapter.id, accuracy, priority: chapter.priorityScore };
    })
    .filter((chapter) => chapter.accuracy < 0.7)
    .sort((left, right) => right.priority - left.priority || left.accuracy - right.accuracy)
    .slice(0, 3)
    .map((chapter) => chapter.id);

  const status: Readiness['status'] = score >= 85 ? 'high' : score >= 75 ? 'good' : score >= 60 ? 'evolving' : 'reinforce';
  const pt = {
    high: 'Prontidão alta: mantenha simulados oficiais e corrija cada erro antes da prova.',
    good: 'Boa prontidão: continue alternando provas oficiais e revisão dos capítulos com menor desempenho.',
    evolving: 'Em evolução: a base está sendo formada; priorize capítulos frequentes e faça novas tentativas completas.',
    reinforce: 'Reforçar agora: concentre o tempo nos capítulos prioritários e use os resultados para repetir os pontos fracos.',
    insufficient: '',
  }[status];
  const es = {
    high: 'Preparación alta: mantén simulacros oficiales y corrige cada error antes del examen.',
    good: 'Buena preparación: sigue alternando exámenes oficiales y repaso de los capítulos con menor resultado.',
    evolving: 'En evolución: la base se está formando; prioriza capítulos frecuentes y completa nuevas prácticas.',
    reinforce: 'Refuerza ahora: concentra el tiempo en capítulos prioritarios y repite los puntos débiles según los resultados.',
    insufficient: '',
  }[status];

  return { status, score, validAttempts: attempts.length, explanationPt: pt, explanationEs: es, weakChapterIds };
}

function activity(type: StudyActivity['type'], titlePt: string, titleEs: string, detailPt: string, detailEs: string, estimatedMinutes: number, optional = false): StudyActivity {
  return { type, titlePt, titleEs, detailPt, detailEs, estimatedMinutes, optional };
}

export function buildStudyPlan(profile: StudyProfileInput, priorities: ChapterPriority[], results: SimulatorResultInput[], now = new Date()): StudyPlan {
  const dailyStudyMinutes = normalizeDailyMinutes(profile.dailyStudyMinutes);
  const goodsPriorities = priorities.filter((chapter) => chapter.group === 'common' || chapter.group === 'goods');
  const readiness = buildReadiness(results, goodsPriorities);

  if (!profile.planEnabled) {
    return { status: 'disabled', daysUntilExam: null, dailyStudyMinutes, recentExamWindow: 8, readiness, days: [], messagePt: 'Plano desativado no perfil. Você pode continuar usando livremente os temarios e simulados.', messageEs: 'Plan desactivado en el perfil. Puedes seguir usando libremente los temarios y simulacros.' };
  }
  if (profile.track === 'passengers') {
    return { status: 'passengers_coming_soon', daysUntilExam: null, dailyStudyMinutes, recentExamWindow: 8, readiness, days: [], messagePt: 'CAP Viajantes está em implementação. O plano de Mercadorias permanece disponível quando essa modalidade for selecionada.', messageEs: 'CAP Viajeros está en implementación. El plan de Mercancías estará disponible al seleccionar esa modalidad.' };
  }
  if (!profile.targetExamDate) {
    return { status: 'missing_date', daysUntilExam: null, dailyStudyMinutes, recentExamWindow: 8, readiness, days: [], messagePt: 'Informe a data prevista da prova no Perfil para gerar o roteiro diário.', messageEs: 'Indica la fecha prevista del examen en Perfil para generar el itinerario diario.' };
  }

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = parseIsoDate(profile.targetExamDate);
  const daysUntilExam = Math.round((target - today) / 86_400_000);
  if (daysUntilExam <= 0) {
    return { status: 'diagnostic', daysUntilExam, dailyStudyMinutes, recentExamWindow: 8, readiness, days: [], messagePt: 'A data da prova é hoje ou já passou. Faça um simulado de diagnóstico, atualize a data e então gere um plano realista.', messageEs: 'La fecha del examen es hoy o ya pasó. Realiza un simulacro de diagnóstico, actualiza la fecha y genera un plan realista.' };
  }

  const status: StudyPlan['status'] = daysUntilExam >= 21 ? 'complete' : daysUntilExam >= 8 ? 'accelerated' : 'emergency';
  // Include today and stop on the day before the exam.
  const planDays = Math.min(daysUntilExam, 60);
  const days: StudyPlanDay[] = [];
  const topPriorities = goodsPriorities.slice(0, Math.max(1, Math.min(7, goodsPriorities.length)));

  for (let index = 0; index < planDays; index += 1) {
    const date = today + index * 86_400_000;
    const chapter = topPriorities[index % topPriorities.length];
    const chapterTitlePt = `${chapter.code} · ${chapter.titlePt}`;
    const chapterTitleEs = `${chapter.code} · ${chapter.titleEs}`;
    const isOfficialReviewDay = status !== 'emergency' && (index + 1) % (status === 'complete' ? 6 : 4) === 0;
    const temarioMinutes = dailyStudyMinutes === 40 ? 12 : dailyStudyMinutes === 60 ? 20 : 30;
    const practiceMinutes = dailyStudyMinutes === 40 ? 20 : dailyStudyMinutes === 60 ? 30 : 45;
    const reviewMinutes = Math.max(8, dailyStudyMinutes - temarioMinutes - practiceMinutes);
    const activities: StudyActivity[] = [
      activity('temario', `Leia o Temario: ${chapterTitlePt}`, `Lee el Temario: ${chapterTitleEs}`, `Leia regras, exceções e exemplos do capítulo prioritário.`, `Lee reglas, excepciones y ejemplos del capítulo prioritario.`, temarioMinutes),
      activity('chapter', `Pratique o capítulo ${chapter.code}`, `Practica el capítulo ${chapter.code}`, `Faça o Simulado por Capítulo e corrija cada resposta errada antes de encerrar a sessão.`, `Haz el Simulacro por Capítulo y corrige cada respuesta errónea antes de terminar la sesión.`, practiceMinutes),
      activity('review', 'Revisão curta: repetidas, pegadinhas ou siglas', 'Repaso corto: repetidas, trampas o siglas', status === 'emergency' ? 'Revise limites, exceções e pegadinhas antes de parar.' : 'Use a revisão para fixar os erros do dia.', status === 'emergency' ? 'Repasa límites, excepciones y trampas antes de terminar.' : 'Usa el repaso para fijar los errores del día.', reviewMinutes),
    ];
    if (isOfficialReviewDay) {
      activities.push(activity('official', 'Simulado oficial em sessão estendida', 'Simulacro oficial en sesión extendida', 'Se puder reservar 120 minutos adicionais, faça uma prova oficial completa e analise os erros. Se não puder, mantenha o roteiro normal de hoje.', 'Si puedes reservar 120 minutos adicionales, realiza un examen oficial completo y analiza los errores. Si no, mantén el itinerario normal de hoy.', 120, true));
    }
    days.push({ date: toIsoDate(date), labelPt: dayLabel(date, 'pt'), labelEs: dayLabel(date, 'es'), activities });
  }

  const messagePt = status === 'complete'
    ? 'Plano completo: alterna estudo dirigido, prática e revisões com base nos capítulos mais presentes e recorrentes das 8 provas mais recentes.'
    : status === 'accelerated'
      ? 'Plano acelerado: concentra o tempo disponível nos capítulos prioritários e em ciclos curtos de prática e revisão.'
      : 'Plano de emergência: o tempo não permite cobrir todo o conteúdo. Foque nas prioridades, nos seus erros e nas regras de maior recorrência.';
  const messageEs = status === 'complete'
    ? 'Plan completo: alterna estudio dirigido, práctica y repasos según los capítulos más presentes y recurrentes de los 8 exámenes más recientes.'
    : status === 'accelerated'
      ? 'Plan acelerado: concentra el tiempo disponible en capítulos prioritarios y ciclos cortos de práctica y repaso.'
      : 'Plan de emergencia: el tiempo no permite cubrir todo el contenido. Céntrate en prioridades, errores propios y reglas de mayor recurrencia.';

  return { status, daysUntilExam, dailyStudyMinutes, recentExamWindow: 8, readiness, days, messagePt, messageEs };
}
