import { chapterAssignments } from './chapterAssignments';
import { findSimulatorChapter, simulatorChapters, type ChapterQuestion, type SimulatorChapter } from '../shared/simulatorChapters';

export type ChapterAssignmentMethod = 'reviewed' | 'keyword' | 'unassigned';

function questionKey(question: ChapterQuestion) {
  return `${question.normalized || question.question || ''}`.trim().toLocaleLowerCase('es-ES');
}

export function classifySimulatorQuestion(question: ChapterQuestion): { chapter?: SimulatorChapter; method: ChapterAssignmentMethod } {
  const reviewedChapterId = chapterAssignments[questionKey(question)];
  if (reviewedChapterId) {
    return {
      chapter: simulatorChapters.find((chapter) => chapter.id === reviewedChapterId),
      method: 'reviewed',
    };
  }

  const chapter = findSimulatorChapter(question);
  return { chapter, method: chapter ? 'keyword' : 'unassigned' };
}
