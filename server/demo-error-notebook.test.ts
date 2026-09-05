import { describe, expect, it } from 'vitest';
import { getDemoErrorNotebook, getDemoQuestions, recordDemoNotebookErrors } from './demoData';

describe('demo error notebook persistence', () => {
  it('records a wrong answer and exposes it by chapter', () => {
    process.env.DEMO_MODE = 'true';
    const userId = Math.floor(Date.now() % 1_000_000) + 10_000;
    const question = getDemoQuestions()[0];
    const before = getDemoErrorNotebook(userId);

    recordDemoNotebookErrors(userId, [{
      questionId: question.id,
      selectedAnswer: question.correctAnswer === 'A' ? 'B' : 'A',
    }]);

    const after = getDemoErrorNotebook(userId);
    expect(after.summary.totalItems).toBe(before.summary.totalItems + 1);
    expect(after.summary.dueCount).toBe(before.summary.dueCount + 1);
    expect(after.summary.chapterCounts).toContainEqual({ chapterId: question.chapterId, count: 1 });
    expect(after.dueItems[0]?.question.id).toBe(question.id);
  });
});
