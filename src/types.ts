export type ChapterStatus = 
  | 'Not Started'
  | 'Video Watched'
  | 'NCERT Read'
  | 'Questions Solved'
  | 'Fully Revised';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  boardName: string;
  targetPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  displayOrder: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  chapterName: string;
  chapterNumber: number;
}

export interface UserChapterProgress {
  id: string;
  userId: string;
  chapterId: string;
  subjectId: string;
  status: ChapterStatus;
  lastRevisedAt?: string | null;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  subject: string;
  chapter: string;
  subjectId?: string;
  chapterId?: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface PYQ {
  id: string;
  userId: string;
  subject: string;
  chapter: string;
  subjectId?: string;
  chapterId?: string;
  question: string;
  marks: number;
  tags: string[];
  createdAt: string;
}

export interface Doubt {
  id: string;
  userId: string;
  subject: string;
  chapter: string;
  subjectId?: string;
  chapterId?: string;
  question: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Unresolved' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolvedAt?: string | null;
}

export interface DailyTask {
  id: string;
  userId: string;
  taskDescription: string;
  targetDate: string;
  completed: boolean;
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  durationMinutes: number;
  sessionDate: string;
  createdAt: string;
}

export interface RevisionRecommendation {
  chapterId: string;
  chapterName: string;
  subjectName: string;
  status: ChapterStatus;
  daysSinceRevision: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export interface DashboardMetrics {
  targetPercentage: number;
  overallProgress: number;
  studyStreak: number;
  todayStudyMinutes: number;
  weeklyStudyMinutes: number;
  totalStudyMinutes: number;
  pendingDoubtsCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  subjectProgress: {
    subjectName: string;
    progressPercentage: number;
    completedChapters: number;
    totalChapters: number;
  }[];
}
