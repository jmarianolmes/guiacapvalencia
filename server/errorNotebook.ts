export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14] as const;

export type ReviewSchedule = {
  reviewLevel: number;
  nextReviewAt: Date | null;
  resolvedAt: Date | null;
};

function addDays(base: Date, days: number) {
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function restartReviewSchedule(now = new Date()): ReviewSchedule {
  return {
    reviewLevel: 0,
    nextReviewAt: now,
    resolvedAt: null,
  };
}

export function retryReviewSchedule(now = new Date()): ReviewSchedule {
  return {
    reviewLevel: 0,
    nextReviewAt: addDays(now, REVIEW_INTERVAL_DAYS[0]),
    resolvedAt: null,
  };
}

export function advanceReviewSchedule(currentLevel: number, now = new Date()): ReviewSchedule {
  const nextLevel = Math.max(0, currentLevel) + 1;
  if (nextLevel >= REVIEW_INTERVAL_DAYS.length) {
    return {
      reviewLevel: REVIEW_INTERVAL_DAYS.length,
      nextReviewAt: null,
      resolvedAt: now,
    };
  }

  return {
    reviewLevel: nextLevel,
    nextReviewAt: addDays(now, REVIEW_INTERVAL_DAYS[nextLevel - 1]),
    resolvedAt: null,
  };
}

export function isReviewDue(item: { nextReviewAt: Date | null; resolvedAt: Date | null }, now = new Date()) {
  return !item.resolvedAt && Boolean(item.nextReviewAt && item.nextReviewAt.getTime() <= now.getTime());
}

export function getReviewIntervalLabel(reviewLevel: number) {
  const nextDays = REVIEW_INTERVAL_DAYS[Math.max(0, reviewLevel)];
  return nextDays ? `${nextDays}d` : null;
}
