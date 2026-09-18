export type StrategyResult = {
  attempts: number;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  averageCorrect: number;
  accuracy: number;
  recurringWrongQuestions: number;
  safeShare: number;
  uncertainShare: number;
  unknownShare: number;
  recommendation: 'conservative' | 'balanced' | 'recovery';
  titlePt: string;
  titleEs: string;
  summaryPt: string;
  summaryEs: string;
  stepsPt: string[];
  stepsEs: string[];
};

type ResultInput = {
  questionCount: number;
  correctAnswers: number;
  wrongAnswers: number;
  mode: string;
};

type ErrorInput = { wrongCount: number };

export function buildStudyStrategy(results: ResultInput[], errors: ErrorInput[] = []): StrategyResult {
  const evidence = results.filter((result) => result.mode === 'official' || result.mode === 'chapter');
  const totalQuestions = evidence.reduce((sum, result) => sum + result.questionCount, 0);
  const totalCorrect = evidence.reduce((sum, result) => sum + result.correctAnswers, 0);
  const totalWrong = evidence.reduce((sum, result) => sum + result.wrongAnswers, 0);
  const attempts = evidence.length;
  const averageCorrect = attempts ? totalCorrect / attempts : 0;
  const accuracy = totalQuestions ? (totalCorrect / totalQuestions) * 100 : 0;
  const recurringWrongQuestions = errors.filter((error) => error.wrongCount >= 2).length;
  const safeShare = Math.max(0, Math.min(100, accuracy - recurringWrongQuestions / Math.max(1, totalQuestions) * 100));
  const uncertainShare = Math.max(0, Math.min(100 - safeShare, accuracy * 0.35 + (recurringWrongQuestions ? 10 : 0)));
  const unknownShare = Math.max(0, 100 - safeShare - uncertainShare);
  const recommendation = averageCorrect >= 45 ? 'conservative' : averageCorrect >= 35 ? 'balanced' : 'recovery';

  if (!attempts) {
    return {
      attempts, totalQuestions, totalCorrect, totalWrong, averageCorrect, accuracy, recurringWrongQuestions, safeShare, uncertainShare, unknownShare, recommendation: 'recovery',
      titlePt: 'Ainda não há histórico suficiente', titleEs: 'Todavía no hay historial suficiente',
      summaryPt: 'Conclua provas oficiais ou práticas por capítulo para receber uma estratégia personalizada de prova.',
      summaryEs: 'Completa exámenes oficiales o prácticas por capítulo para recibir una estrategia personalizada de examen.',
      stepsPt: ['Responda primeiro as questões cujo conteúdo você domina.', 'Marque as dúvidas e volte a elas depois.', 'Use o caderno de erros para construir seu histórico.'],
      stepsEs: ['Responde primero las preguntas cuyo contenido dominas.', 'Marca las dudas y vuelve a ellas después.', 'Usa el cuaderno de errores para construir tu historial.'],
    };
  }

  const balanced = recommendation === 'balanced';
  const conservative = recommendation === 'conservative';
  return {
    attempts, totalQuestions, totalCorrect, totalWrong, averageCorrect, accuracy, recurringWrongQuestions, safeShare, uncertainShare, unknownShare, recommendation,
    titlePt: conservative ? 'Proteja seus acertos e arrisque apenas com critério' : balanced ? 'Estratégia equilibrada para buscar os pontos que faltam' : 'Priorize recuperação de conhecimento antes de arriscar',
    titleEs: conservative ? 'Protege tus aciertos y arriesga solo con criterio' : balanced ? 'Estrategia equilibrada para buscar los puntos que faltan' : 'Prioriza recuperar conocimientos antes de arriesgar',
    summaryPt: `Seu histórico mostra média de ${averageCorrect.toFixed(1)} acertos por prova e ${accuracy.toFixed(1)}% de acerto. A recomendação usa apenas ${attempts} resultado(s) oficial(is) ou por capítulo.`,
    summaryEs: `Tu historial muestra una media de ${averageCorrect.toFixed(1)} aciertos por examen y ${accuracy.toFixed(1)}% de acierto. La recomendación usa solo ${attempts} resultado(s) oficial(es) o por capítulo.`,
    stepsPt: conservative
      ? ['Responda primeiro todas as questões que você sabe com segurança.', 'Depois responda as dúvidas em que consegue eliminar alternativas e ficar entre duas.', 'Deixe para o final as questões completamente desconhecidas; não arrisque nelas antes de garantir os pontos seguros.']
      : balanced
        ? ['Faça primeiro as questões seguras.', 'Em seguida, responda as questões em que consegue eliminar alternativas e ficou entre duas.', 'Deixe inicialmente em branco as questões sem conhecimento ou sem qualquer eliminação; use o tempo final para decidir.']
        : ['Responda primeiro somente as questões realmente conhecidas.', 'Não conte com chutes de quatro alternativas para recuperar a pontuação: com penalização de 0,5, o valor esperado é negativo.', 'Concentre o estudo nos erros recorrentes antes da prova e deixe as questões desconhecidas para o fim.'],
    stepsEs: conservative
      ? ['Responde primero todas las preguntas que conoces con seguridad.', 'Después responde las dudas en las que puedes eliminar alternativas y quedarte entre dos.', 'Deja para el final las preguntas completamente desconocidas; no arriesgues antes de asegurar los puntos.']
      : balanced
        ? ['Haz primero las preguntas seguras.', 'Después responde las preguntas en las que puedes eliminar alternativas y quedarte entre dos.', 'Deja inicialmente en blanco las preguntas sin conocimiento o sin eliminación; decide al final.']
        : ['Responde primero solo las preguntas que realmente conoces.', 'No dependas de adivinar entre cuatro alternativas para recuperar puntos: con penalización de 0,5, el valor esperado es negativo.', 'Concentra el estudio en los errores recurrentes antes del examen y deja las preguntas desconocidas para el final.'],
  };
}
