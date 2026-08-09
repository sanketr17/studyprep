import { supabase } from '../lib/supabase';
import { StudySession } from '../types';

export async function saveStudySession(
  userId: string,
  durationMinutes: number,
  sessionDate?: string
): Promise<StudySession> {
  const now = new Date();
  const dateStr = sessionDate || now.toISOString().split('T')[0];
  const createdAt = now.toISOString();
  const id = crypto.randomUUID();

  const newSession: StudySession = {
    id,
    userId,
    durationMinutes,
    sessionDate: dateStr,
    createdAt,
  };

  // Local storage update
  const existingSessions = await getStudySessions(userId);
  const updatedSessions = [newSession, ...existingSessions];
  localStorage.setItem(`sessions_${userId}`, JSON.stringify(updatedSessions));

  try {
    const { data: dbData, error } = await supabase
      .from('study_sessions')
      .insert({
        id,
        user_id: userId,
        duration_minutes: durationMinutes,
        session_date: dateStr,
        created_at: createdAt,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase saveStudySession warning:', error.message);
    } else if (dbData) {
      newSession.id = dbData.id;
    }
  } catch (err) {
    console.error('Failed to save study session in Supabase:', err);
  }

  return newSession;
}

export async function getStudySessions(userId: string): Promise<StudySession[]> {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching study sessions from Supabase:', error.message);
      const local = localStorage.getItem(`sessions_${userId}`);
      return local ? JSON.parse(local) : [];
    }

    if (data) {
      const sessions: StudySession[] = data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        durationMinutes: d.duration_minutes,
        sessionDate: d.session_date,
        createdAt: d.created_at,
      }));
      localStorage.setItem(`sessions_${userId}`, JSON.stringify(sessions));
      return sessions;
    }

    const local = localStorage.getItem(`sessions_${userId}`);
    return local ? JSON.parse(local) : [];
  } catch (err) {
    console.error('Error fetching study sessions:', err);
    const local = localStorage.getItem(`sessions_${userId}`);
    return local ? JSON.parse(local) : [];
  }
}

export function calculateStreak(sessionDates: string[]): number {
  if (sessionDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(sessionDates)).sort((a, b) => (b > a ? 1 : -1));
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentDateToCheck = uniqueDates.includes(today)
    ? today
    : uniqueDates.includes(yesterdayDate)
    ? yesterdayDate
    : null;

  if (!currentDateToCheck) {
    return 0;
  }

  let streak = 0;
  let tempDate = new Date(currentDateToCheck);
  while (true) {
    const dateStr = tempDate.toISOString().split('T')[0];
    if (uniqueDates.includes(dateStr)) {
      streak++;
      tempDate.setDate(tempDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
