import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Subject, 
  Chapter, 
  UserChapterProgress, 
  Note, 
  PYQ, 
  Doubt, 
  DailyTask, 
  StudySession, 
  RevisionRecommendation,
  ChapterStatus
} from '../types';
import { 
  getSubjectsAndChapters, 
  getUserChapterProgress, 
  updateChapterStatus as updateStatusService,
  initializeUserSyllabusAndSeedData
} from '../services/syllabusService';
import { getNotes } from '../services/notesService';
import { getPYQs } from '../services/pyqService';
import { getDoubts } from '../services/doubtService';
import { getTasks, carryForwardIncompleteTasks } from '../services/taskService';
import { getStudySessions, calculateStreak } from '../services/studySessionService';
import { calculateOverallProgress, calculateSubjectProgress } from '../utils/progressCalculator';
import { generateRevisionRecommendations } from '../utils/revisionEngine';

export function useStudyData() {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progressList, setProgressList] = useState<UserChapterProgress[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pyqs, setPYQs] = useState<PYQ[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Timeout safety fallback: guarantee loading stops after 6 seconds max
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Data loading timeout reached. Disabling loading state.');
        setLoading(false);
      }
    }, 6000);

    try {
      const [subChapData, progData, notesData, pyqData, doubtData, taskData, sessionData] = await Promise.all([
        getSubjectsAndChapters(),
        getUserChapterProgress(currentUser.uid),
        getNotes(currentUser.uid),
        getPYQs(currentUser.uid),
        getDoubts(currentUser.uid),
        getTasks(currentUser.uid),
        getStudySessions(currentUser.uid),
      ]);

      if (!isMounted) return;

      setSubjects(subChapData.subjects);
      setChapters(subChapData.chapters);
      setProgressList(progData);

      const mappedNotes = notesData.map((n) => ({
        ...n,
        subject: subChapData.subjects.find((s) => s.id === n.subjectId)?.name || n.subject || 'General',
        chapter: subChapData.chapters.find((c) => c.id === n.chapterId)?.chapterName || n.chapter || '',
      }));

      const mappedPYQs = pyqData.map((p) => ({
        ...p,
        subject: subChapData.subjects.find((s) => s.id === p.subjectId)?.name || p.subject || 'General',
        chapter: subChapData.chapters.find((c) => c.id === p.chapterId)?.chapterName || p.chapter || '',
      }));

      const mappedDoubts = doubtData.map((d) => ({
        ...d,
        subject: subChapData.subjects.find((s) => s.id === d.subjectId)?.name || d.subject || 'General',
        chapter: subChapData.chapters.find((c) => c.id === d.chapterId)?.chapterName || d.chapter || '',
      }));

      setNotes(mappedNotes);
      setPYQs(mappedPYQs);
      setDoubts(mappedDoubts);
      setTasks(taskData);
      setSessions(sessionData);
    } catch (err: any) {
      console.error('Error loading study data:', err);
      if (isMounted) {
        setError(err?.message || 'Unable to load study data. Please refresh or try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateChapterStatus = async (chapterId: string, subjectId: string, status: ChapterStatus) => {
    if (!currentUser) return;
    try {
      const updated = await updateStatusService(currentUser.uid, chapterId, subjectId, status);
      setProgressList((prev) => {
        const idx = prev.findIndex((p) => p.chapterId === chapterId);
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = updated;
          return newArr;
        }
        return [...prev, updated];
      });
    } catch (err) {
      console.error('Failed to update chapter status:', err);
    }
  };

  const handleCarryForwardTasks = async () => {
    if (!currentUser) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const carriedCount = await carryForwardIncompleteTasks(currentUser.uid, todayStr);
    if (carriedCount > 0) {
      const updatedTasks = await getTasks(currentUser.uid);
      setTasks(updatedTasks);
    }
    return carriedCount;
  };

  // Derived Metrics
  const overallProgress = calculateOverallProgress(subjects, chapters, progressList);

  const subjectProgressList = subjects.map((sub) => {
    const { progressPercentage, completedChapters, totalChapters } = calculateSubjectProgress(
      sub.id,
      chapters,
      progressList
    );
    return {
      subjectId: sub.id,
      subjectName: sub.name,
      progressPercentage,
      completedChapters,
      totalChapters,
    };
  });

  const revisionRecommendations = generateRevisionRecommendations(chapters, subjects, progressList);

  const pendingDoubtsCount = doubts.filter((d) => d.status !== 'Resolved').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.sessionDate === todayStr);
  const todayStudyMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const totalStudyMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const sessionDates = sessions.map((s) => s.sessionDate);
  const studyStreak = calculateStreak(sessionDates);

  const todayTasks = tasks.filter((t) => t.targetDate === todayStr);
  const completedTodayTasksCount = todayTasks.filter((t) => t.completed).length;

  return {
    subjects,
    chapters,
    progressList,
    notes,
    pyqs,
    doubts,
    tasks,
    todayTasks,
    sessions,
    loading,
    error,
    overallProgress,
    subjectProgressList,
    revisionRecommendations,
    pendingDoubtsCount,
    todayStudyMinutes,
    totalStudyMinutes,
    studyStreak,
    completedTodayTasksCount,
    refetchData: loadData,
    updateChapterStatus,
    handleCarryForwardTasks,
  };
}
