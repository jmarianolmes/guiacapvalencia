export const STRATEGY_TOTAL_QUESTIONS = 100;

export function calculateStrategySummary(correct: number, wrong: number) {
  const normalizedCorrect = Math.max(0, Math.min(STRATEGY_TOTAL_QUESTIONS, Math.floor(correct) || 0));
  const normalizedWrong = Math.max(0, Math.min(STRATEGY_TOTAL_QUESTIONS - normalizedCorrect, Math.floor(wrong) || 0));
  const skipped = STRATEGY_TOTAL_QUESTIONS - normalizedCorrect - normalizedWrong;
  const score = normalizedCorrect - normalizedWrong * 0.5;

  return {
    correct: normalizedCorrect,
    wrong: normalizedWrong,
    skipped,
    answered: normalizedCorrect + normalizedWrong,
    score,
  };
}
