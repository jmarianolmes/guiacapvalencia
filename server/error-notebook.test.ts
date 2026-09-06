import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { advanceReviewSchedule, isReviewDue, restartReviewSchedule, retryReviewSchedule } from './errorNotebook';

describe('error notebook spaced review', () => {
  const now = new Date('2026-08-19T09:00:00.000Z');

  it('places a new simulator error in the current review queue', () => {
    const schedule = restartReviewSchedule(now);
    expect(schedule.reviewLevel).toBe(0);
    expect(schedule.nextReviewAt).toEqual(now);
    expect(schedule.resolvedAt).toBeNull();
    expect(isReviewDue({ nextReviewAt: schedule.nextReviewAt, resolvedAt: schedule.resolvedAt }, now)).toBe(true);
  });

  it('uses the 1, 3, 7 and 14-day spaced intervals before consolidation', () => {
    const first = advanceReviewSchedule(0, now);
    const second = advanceReviewSchedule(first.reviewLevel, new Date('2026-08-20T09:00:00.000Z'));
    const third = advanceReviewSchedule(second.reviewLevel, new Date('2026-08-23T09:00:00.000Z'));
    const final = advanceReviewSchedule(third.reviewLevel, new Date('2026-08-30T09:00:00.000Z'));

    expect(first.nextReviewAt?.toISOString()).toBe('2026-08-20T09:00:00.000Z');
    expect(second.nextReviewAt?.toISOString()).toBe('2026-08-23T09:00:00.000Z');
    expect(third.nextReviewAt?.toISOString()).toBe('2026-08-30T09:00:00.000Z');
    expect(final.reviewLevel).toBe(4);
    expect(final.nextReviewAt).toBeNull();
    expect(final.resolvedAt?.toISOString()).toBe('2026-08-30T09:00:00.000Z');
  });

  it('restarts a failed review for the following day instead of keeping it in the same session', () => {
    const retry = retryReviewSchedule(now);
    expect(retry.reviewLevel).toBe(0);
    expect(retry.nextReviewAt?.toISOString()).toBe('2026-08-20T09:00:00.000Z');
    expect(isReviewDue({ nextReviewAt: retry.nextReviewAt, resolvedAt: retry.resolvedAt }, now)).toBe(false);
  });

  it('keeps notebook data individual by constraining records and mutations to the authenticated user', () => {
    const schema = readFileSync(new URL('../drizzle/schema.ts', import.meta.url), 'utf8');
    const db = readFileSync(new URL('./db.ts', import.meta.url), 'utf8');
    const routers = readFileSync(new URL('./routers.ts', import.meta.url), 'utf8');

    expect(schema).toContain('uniqueIndex("user_error_notebook_user_question_unique").on(table.userId, table.questionId)');
    expect(db).toContain('where(eq(userErrorNotebookItems.userId, userId))');
    expect(db).toContain('and(eq(userErrorNotebookItems.id, itemId), eq(userErrorNotebookItems.userId, userId))');
    expect(routers).toContain('getErrorNotebook: protectedProcedure');
    expect(routers).toContain('reviewErrorNotebookItem: protectedProcedure');
  });
});
