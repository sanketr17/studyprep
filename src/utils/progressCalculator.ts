import { ChapterStatus, UserChapterProgress, Subject, Chapter } from '../types';

export const STATUS_WEIGHTS: Record<ChapterStatus, number> = {
  'Not Started': 0,
  'Video Watched': 25,
  'NCERT Read': 50,
  'Questions Solved': 75,
  'Fully Revised': 100,
};

export function getStatusWeight(status: ChapterStatus): number {
  return STATUS_WEIGHTS[status] ?? 0;
}

export function calculateSubjectProgress(
  subjectId: string,
  chapters: Chapter[],
  progressList: UserChapterProgress[]
): { progressPercentage: number; completedChapters: number; totalChapters: number } {
  const subjectChapters = chapters.filter((c) => c.subjectId === subjectId);
  if (subjectChapters.length === 0) {
    return { progressPercentage: 0, completedChapters: 0, totalChapters: 0 };
  }

  let totalWeight = 0;
  let fullyCompletedCount = 0;

  subjectChapters.forEach((chapter) => {
    const userProg = progressList.find((p) => p.chapterId === chapter.id);
    const status = userProg ? userProg.status : 'Not Started';
    const weight = getStatusWeight(status);
    totalWeight += weight;
    if (status === 'Fully Revised' || status === 'Questions Solved') {
      fullyCompletedCount++;
    }
  });

  const progressPercentage = Math.round(totalWeight / subjectChapters.length);
  return {
    progressPercentage,
    completedChapters: fullyCompletedCount,
    totalChapters: subjectChapters.length,
  };
}

export function calculateOverallProgress(
  subjects: Subject[],
  chapters: Chapter[],
  progressList: UserChapterProgress[]
): number {
  if (subjects.length === 0) return 0;

  let sumPercentages = 0;
  subjects.forEach((subj) => {
    const { progressPercentage } = calculateSubjectProgress(subj.id, chapters, progressList);
    sumPercentages += progressPercentage;
  });

  return Math.round(sumPercentages / subjects.length);
}
