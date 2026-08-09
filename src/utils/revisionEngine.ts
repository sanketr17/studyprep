import { Chapter, Subject, UserChapterProgress, RevisionRecommendation } from '../types';

export function generateRevisionRecommendations(
  chapters: Chapter[],
  subjects: Subject[],
  userProgressList: UserChapterProgress[]
): RevisionRecommendation[] {
  const recommendations: RevisionRecommendation[] = [];
  const now = new Date();

  const subjectMap = new Map<string, string>();
  subjects.forEach((s) => subjectMap.set(s.id, s.name));

  chapters.forEach((chapter) => {
    const progress = userProgressList.find((p) => p.chapterId === chapter.id);
    const subjectName = subjectMap.get(chapter.subjectId) || 'General';

    if (!progress) return;

    const lastRevisedDate = progress.lastRevisedAt
      ? new Date(progress.lastRevisedAt)
      : new Date(progress.updatedAt);

    const diffTime = Math.abs(now.getTime() - lastRevisedDate.getTime());
    const daysSinceRevision = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let priority: 'HIGH' | 'MEDIUM' | 'LOW' | null = null;
    let reason = '';

    if (progress.status === 'Questions Solved' && daysSinceRevision >= 7) {
      priority = 'HIGH';
      reason = `Questions solved ${daysSinceRevision} days ago. Perfect time for a quick formula and question review.`;
    } else if (progress.status === 'Fully Revised' && daysSinceRevision >= 14) {
      priority = 'MEDIUM';
      reason = `Last revised ${daysSinceRevision} days ago. A 15-minute quick pass will lock this in memory.`;
    } else if (progress.status === 'NCERT Read' && daysSinceRevision >= 5) {
      priority = 'HIGH';
      reason = `NCERT read ${daysSinceRevision} days ago. Move forward by practicing board PYQs for this chapter.`;
    } else if (progress.status === 'Video Watched' && daysSinceRevision >= 3) {
      priority = 'HIGH';
      reason = `Video watched ${daysSinceRevision} days ago. Read the NCERT text while concepts are fresh.`;
    } else if (daysSinceRevision >= 21 && progress.status !== 'Not Started') {
      priority = 'MEDIUM';
      reason = `Inactive for ${daysSinceRevision} days. Review quick revision notes.`;
    }

    if (priority) {
      recommendations.push({
        chapterId: chapter.id,
        chapterName: chapter.chapterName,
        subjectName,
        status: progress.status,
        daysSinceRevision,
        priority,
        reason,
      });
    }
  });

  // Sort by priority (HIGH > MEDIUM > LOW) then by daysSinceRevision desc
  const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  recommendations.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.daysSinceRevision - a.daysSinceRevision;
  });

  return recommendations;
}
