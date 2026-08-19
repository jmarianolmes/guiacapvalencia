import { describe, expect, it } from 'vitest';
import { buildReadiness, buildStudyPlan } from './studyPlan';

const priorities = [
  { id: 'common-1-2', code: '1.2', group: 'common' as const, titlePt: 'Frenos', titleEs: 'Frenos', priorityScore: 90, action: 'intensive' as const },
  { id: 'goods-2-2', code: '2.2', group: 'goods' as const, titlePt: 'Regulamentação', titleEs: 'Reglamentación', priorityScore: 80, action: 'intensive' as const },
];

const validResults = [
  { questionCount: 50, correctAnswers: 42, wrongAnswers: 8, blankAnswers: 0, chapterId: 'common-1-2', mode: 'chapter', createdAt: new Date('2026-08-18T10:00:00Z') },
  { questionCount: 100, correctAnswers: 78, wrongAnswers: 20, blankAnswers: 2, chapterId: null, mode: 'official', createdAt: new Date('2026-08-17T10:00:00Z') },
  { questionCount: 50, correctAnswers: 40, wrongAnswers: 10, blankAnswers: 0, chapterId: 'goods-2-2', mode: 'chapter', createdAt: new Date('2026-08-16T10:00:00Z') },
];

describe('study plan', () => {
  it('keeps readiness unavailable until three sufficiently answered attempts exist', () => {
    const readiness = buildReadiness(validResults.slice(0, 2), priorities);
    expect(readiness.status).toBe('insufficient');
    expect(readiness.score).toBeNull();
  });

  it('generates a complete plan when there are at least 21 days', () => {
    const plan = buildStudyPlan({ track: 'goods', targetExamDate: '2026-09-20', dailyStudyMinutes: 60, planEnabled: true }, priorities, validResults, new Date('2026-08-19T10:00:00Z'));
    expect(plan.status).toBe('complete');
    expect(plan.daysUntilExam).toBe(32);
    expect(plan.days.length).toBe(32);
    expect(plan.days[0]?.date).toBe('2026-08-19');
    expect(plan.days.at(-1)?.date).toBe('2026-09-19');
    expect(plan.readiness.status).not.toBe('insufficient');
  });

  it('uses the emergency plan for a near exam date', () => {
    const plan = buildStudyPlan({ track: 'goods', targetExamDate: '2026-08-24', dailyStudyMinutes: 40, planEnabled: true }, priorities, validResults, new Date('2026-08-19T10:00:00Z'));
    expect(plan.status).toBe('emergency');
    expect(plan.days.length).toBe(5);
    expect(plan.days[0]?.date).toBe('2026-08-19');
    expect(plan.days.at(-1)?.date).toBe('2026-08-23');
    expect(plan.messagePt).toContain('emergência');
  });

  it('does not promise a plan when the target date has passed', () => {
    const plan = buildStudyPlan({ track: 'goods', targetExamDate: '2026-08-19', dailyStudyMinutes: 90, planEnabled: true }, priorities, validResults, new Date('2026-08-19T10:00:00Z'));
    expect(plan.status).toBe('diagnostic');
    expect(plan.days).toHaveLength(0);
  });
});
