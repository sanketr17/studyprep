import { supabase } from '../lib/supabase';
import { Subject, Chapter, UserChapterProgress, ChapterStatus } from '../types';
import { 
  DEFAULT_SUBJECTS_AND_CHAPTERS, 
  DEMO_INITIAL_NOTES, 
  DEMO_INITIAL_PYQS, 
  DEMO_INITIAL_DOUBTS, 
  DEMO_INITIAL_TASKS 
} from '../utils/seedData';
import { createNote } from './notesService';
import { createPYQ } from './pyqService';
import { createDoubt } from './doubtService';
import { createTask } from './taskService';

export async function getSubjectsAndChapters(): Promise<{ subjects: Subject[]; chapters: Chapter[] }> {
  try {
    const [subRes, chapRes] = await Promise.all([
      supabase.from('subjects').select('id, name, display_order').order('display_order', { ascending: true }),
      supabase.from('chapters').select('id, subject_id, chapter_name, chapter_number').order('chapter_number', { ascending: true }),
    ]);

    let rawSubjects: Subject[] = [];
    let rawChapters: Chapter[] = [];

    if (!subRes.error && subRes.data && subRes.data.length > 0) {
      rawSubjects = subRes.data.map((d: any) => ({
        id: d.id,
        name: d.name,
        displayOrder: d.display_order,
      }));
    } else {
      DEFAULT_SUBJECTS_AND_CHAPTERS.forEach((sub) => {
        rawSubjects.push({ id: sub.id, name: sub.name, displayOrder: sub.displayOrder });
      });
    }

    if (!chapRes.error && chapRes.data && chapRes.data.length > 0) {
      rawChapters = chapRes.data.map((d: any) => ({
        id: d.id,
        subjectId: d.subject_id,
        chapterName: d.chapter_name,
        chapterNumber: d.chapter_number,
      }));
    } else {
      DEFAULT_SUBJECTS_AND_CHAPTERS.forEach((sub) => {
        sub.chapters.forEach((chap) => {
          rawChapters.push({
            id: chap.id,
            subjectId: sub.id,
            chapterName: chap.chapterName,
            chapterNumber: chap.chapterNumber,
          });
        });
      });
    }

    // Deduplicate subjects by normalized name while preferring canonical IDs
    const canonicalIds = new Set(DEFAULT_SUBJECTS_AND_CHAPTERS.map((s) => s.id));
    rawSubjects.sort((a, b) => {
      const aIsCanonical = canonicalIds.has(a.id) ? 0 : 1;
      const bIsCanonical = canonicalIds.has(b.id) ? 0 : 1;
      if (aIsCanonical !== bIsCanonical) return aIsCanonical - bIsCanonical;
      return a.displayOrder - b.displayOrder;
    });

    const seenSubjectNames = new Set<string>();
    const subjects: Subject[] = [];

    for (const sub of rawSubjects) {
      const normName = sub.name.trim().toLowerCase();
      if (!seenSubjectNames.has(normName)) {
        seenSubjectNames.add(normName);
        subjects.push(sub);
      }
    }

    subjects.sort((a, b) => a.displayOrder - b.displayOrder);

    // Deduplicate chapters by (subjectId + chapterName)
    const validSubjectIds = new Set(subjects.map((s) => s.id));
    const canonicalChapterIds = new Set(
      DEFAULT_SUBJECTS_AND_CHAPTERS.flatMap((s) => s.chapters.map((c) => c.id))
    );

    rawChapters.sort((a, b) => {
      const aIsCanonical = canonicalChapterIds.has(a.id) ? 0 : 1;
      const bIsCanonical = canonicalChapterIds.has(b.id) ? 0 : 1;
      if (aIsCanonical !== bIsCanonical) return aIsCanonical - bIsCanonical;
      return a.chapterNumber - b.chapterNumber;
    });

    const seenChapterKeys = new Set<string>();
    const chapters: Chapter[] = [];

    for (const chap of rawChapters) {
      if (!validSubjectIds.has(chap.subjectId)) continue;
      const key = `${chap.subjectId}_${chap.chapterName.trim().toLowerCase()}`;
      if (!seenChapterKeys.has(key)) {
        seenChapterKeys.add(key);
        chapters.push(chap);
      }
    }

    return { subjects, chapters };
  } catch (err) {
    console.error('Error fetching subjects & chapters:', err);
    const subjects: Subject[] = [];
    const chapters: Chapter[] = [];
    DEFAULT_SUBJECTS_AND_CHAPTERS.forEach((sub) => {
      subjects.push({ id: sub.id, name: sub.name, displayOrder: sub.displayOrder });
      sub.chapters.forEach((chap) => {
        chapters.push({
          id: chap.id,
          subjectId: sub.id,
          chapterName: chap.chapterName,
          chapterNumber: chap.chapterNumber,
        });
      });
    });
    return { subjects, chapters };
  }
}

export async function getUserChapterProgress(userId: string): Promise<UserChapterProgress[]> {
  try {
    const { data, error } = await supabase
      .from('user_chapter_progress')
      .select('id, user_id, chapter_id, status, last_revised_at, updated_at')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) {
      const progressMap = new Map<string, UserChapterProgress>();
      data.forEach((d) => {
        const item: UserChapterProgress = {
          id: d.id,
          userId: d.user_id,
          chapterId: d.chapter_id,
          subjectId: '',
          status: d.status as ChapterStatus,
          lastRevisedAt: d.last_revised_at,
          updatedAt: d.updated_at,
        };
        const existing = progressMap.get(d.chapter_id);
        if (!existing || (d.updated_at && new Date(d.updated_at) > new Date(existing.updatedAt || 0))) {
          progressMap.set(d.chapter_id, item);
        }
      });

      const progress = Array.from(progressMap.values());
      localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
      return progress;
    }

    // Check local storage fallback
    const localStr = localStorage.getItem(`progress_${userId}`);
    if (localStr) {
      try {
        const parsed = JSON.parse(localStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // ignore parse error
      }
    }

    // Create initial seed progress if brand new user
    const now = new Date();
    const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString();
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

    let idx = 0;
    const initialProgressList: UserChapterProgress[] = [];
    const bulkDbPayload: any[] = [];

    for (const sub of DEFAULT_SUBJECTS_AND_CHAPTERS) {
      for (const chap of sub.chapters) {
        idx++;
        let status: ChapterStatus = 'Not Started';
        let lastRevisedAt: string | null = null;

        if (idx % 5 === 1) {
          status = 'Fully Revised';
          lastRevisedAt = twelveDaysAgo;
        } else if (idx % 5 === 2) {
          status = 'Questions Solved';
          lastRevisedAt = eightDaysAgo;
        } else if (idx % 5 === 3) {
          status = 'NCERT Read';
          lastRevisedAt = threeDaysAgo;
        } else if (idx % 5 === 4) {
          status = 'Video Watched';
          lastRevisedAt = threeDaysAgo;
        }

        const docId = `${userId}_${chap.id}`;
        initialProgressList.push({
          id: docId,
          userId,
          chapterId: chap.id,
          subjectId: sub.id,
          status,
          lastRevisedAt,
          updatedAt: new Date().toISOString(),
        });

        bulkDbPayload.push({
          user_id: userId,
          chapter_id: chap.id,
          status,
          last_revised_at: lastRevisedAt,
          updated_at: new Date().toISOString(),
        });
      }
    }

    localStorage.setItem(`progress_${userId}`, JSON.stringify(initialProgressList));

    // Perform background bulk upsert in a single request
    if (bulkDbPayload.length > 0) {
      (async () => {
        try {
          const { error: bulkErr } = await supabase
            .from('user_chapter_progress')
            .upsert(bulkDbPayload, { onConflict: 'user_id,chapter_id' });
          if (bulkErr) console.warn('Bulk initial progress seed warning:', bulkErr.message);
        } catch (err) {
          console.error('Bulk initial progress seed failed:', err);
        }
      })();
    }

    return initialProgressList;
  } catch (err) {
    console.error('Error getting user chapter progress:', err);
    const local = localStorage.getItem(`progress_${userId}`);
    return local ? JSON.parse(local) : [];
  }
}

export async function updateChapterStatus(
  userId: string,
  chapterId: string,
  subjectId: string,
  status: ChapterStatus
): Promise<UserChapterProgress> {
  const docId = `${userId}_${chapterId}`;
  const now = new Date().toISOString();

  const currentList = await getUserChapterProgress(userId);
  const existing = currentList.find((p) => p.chapterId === chapterId);

  const isRevision = status === 'Fully Revised' || status === 'Questions Solved';
  const lastRevisedAt = isRevision ? now : existing?.lastRevisedAt || null;

  const updatedProgress: UserChapterProgress = {
    id: docId,
    userId,
    chapterId,
    subjectId,
    status,
    lastRevisedAt,
    updatedAt: now,
  };

  const newList = currentList.filter((p) => p.chapterId !== chapterId).concat(updatedProgress);
  localStorage.setItem(`progress_${userId}`, JSON.stringify(newList));

  try {
    const { error } = await supabase
      .from('user_chapter_progress')
      .upsert({
        user_id: userId,
        chapter_id: chapterId,
        status,
        last_revised_at: lastRevisedAt,
        updated_at: now,
      }, { onConflict: 'user_id,chapter_id' });

    if (error) {
      console.warn('Supabase chapter progress update warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to update chapter progress in Supabase:', err);
  }

  return updatedProgress;
}

export async function initializeUserSyllabusAndSeedData(userId: string): Promise<void> {
  try {
    const existingProgress = await getUserChapterProgress(userId);
    if (existingProgress.length === 0) {
      // Seed initial notes, PYQs, doubts, tasks in parallel
      await Promise.allSettled([
        ...DEMO_INITIAL_NOTES.map((note) => createNote(userId, note)),
        ...DEMO_INITIAL_PYQS.map((pyq) => createPYQ(userId, pyq)),
        ...DEMO_INITIAL_DOUBTS.map((doubt) => createDoubt(userId, doubt)),
        ...DEMO_INITIAL_TASKS.map((task) => createTask(userId, task)),
      ]);
    }
  } catch (err) {
    console.error('Error initializing user syllabus and seed data:', err);
  }
}

