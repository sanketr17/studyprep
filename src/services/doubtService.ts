import { supabase } from '../lib/supabase';
import { Doubt } from '../types';
import { resolveSubjectUuid } from './notesService';

function toUuidOrNull(str?: string | null): string | null {
  if (!str) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? str : null;
}

export async function createDoubt(
  userId: string,
  data: Omit<Doubt, 'id' | 'userId' | 'createdAt' | 'resolvedAt'>
): Promise<Doubt> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const resolvedAt = data.status === 'Resolved' ? now : null;
  const validSubjectId = resolveSubjectUuid((data as any).subjectId, data.subject);
  const validChapterId = toUuidOrNull((data as any).chapterId);

  const newDoubt: Doubt = {
    id,
    userId,
    subject: data.subject || '',
    chapter: data.chapter || '',
    subjectId: validSubjectId,
    chapterId: validChapterId || '',
    question: data.question,
    priority: data.priority || 'Medium',
    status: data.status || 'Unresolved',
    createdAt: now,
    resolvedAt,
  };

  // Local storage update
  const existingDoubts = await getDoubts(userId);
  const updatedDoubts = [newDoubt, ...existingDoubts];
  localStorage.setItem(`doubts_${userId}`, JSON.stringify(updatedDoubts));

  try {
    const { data: dbData, error } = await supabase
      .from('doubts')
      .insert({
        id,
        user_id: userId,
        subject_id: validSubjectId,
        chapter_id: validChapterId,
        question: data.question,
        priority: data.priority || 'Medium',
        status: data.status || 'Unresolved',
        created_at: now,
        resolved_at: resolvedAt,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase createDoubt warning:', error.message);
      if (error.message.includes('foreign key constraint')) {
        throw new Error('Database Error: Subject ID invalid. ' + error.message);
      }
    } else if (dbData) {
      newDoubt.id = dbData.id;
    }
  } catch (err) {
    console.error('Failed to create doubt in Supabase:', err);
  }

  return newDoubt;
}

export async function getDoubts(userId: string): Promise<Doubt[]> {
  try {
    const { data, error } = await supabase
      .from('doubts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching doubts from Supabase:', error.message);
      const local = localStorage.getItem(`doubts_${userId}`);
      return local ? JSON.parse(local) : [];
    }

    if (data) {
      const doubts: Doubt[] = data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        subject: '',
        chapter: '',
        subjectId: d.subject_id || '',
        chapterId: d.chapter_id || '',
        question: d.question,
        priority: d.priority || 'Medium',
        status: d.status || 'Unresolved',
        createdAt: d.created_at,
        resolvedAt: d.resolved_at,
      }));
      localStorage.setItem(`doubts_${userId}`, JSON.stringify(doubts));
      return doubts;
    }

    const local = localStorage.getItem(`doubts_${userId}`);
    return local ? JSON.parse(local) : [];
  } catch (err) {
    console.error('Error fetching doubts:', err);
    const local = localStorage.getItem(`doubts_${userId}`);
    return local ? JSON.parse(local) : [];
  }
}

export async function updateDoubt(
  userId: string,
  doubtId: string,
  data: Partial<Omit<Doubt, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await getDoubts(userId);

  const updatedList = existing.map((d) => {
    if (d.id === doubtId) {
      const updatedStatus = data.status || d.status;
      let newResolvedAt = d.resolvedAt;
      if (updatedStatus === 'Resolved' && !d.resolvedAt) {
        newResolvedAt = now;
      } else if (data.status && data.status !== 'Resolved') {
        newResolvedAt = null;
      }
      return { ...d, ...data, resolvedAt: newResolvedAt };
    }
    return d;
  });
  localStorage.setItem(`doubts_${userId}`, JSON.stringify(updatedList));

  const payload: any = {};
  if (data.question !== undefined) payload.question = data.question;
  if (data.priority !== undefined) payload.priority = data.priority;
  if (data.status !== undefined) {
    payload.status = data.status;
    if (data.status === 'Resolved') {
      payload.resolved_at = now;
    } else {
      payload.resolved_at = null;
    }
  }
  if ((data as any).subjectId !== undefined) {
    payload.subject_id = resolveSubjectUuid((data as any).subjectId, data.subject);
  }
  if ((data as any).chapterId !== undefined) {
    payload.chapter_id = toUuidOrNull((data as any).chapterId);
  }

  try {
    const { error } = await supabase
      .from('doubts')
      .update(payload)
      .eq('id', doubtId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase updateDoubt warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to update doubt in Supabase:', err);
  }
}

export async function deleteDoubt(userId: string, doubtId: string): Promise<void> {
  const existing = await getDoubts(userId);
  const updatedList = existing.filter((d) => d.id !== doubtId);
  localStorage.setItem(`doubts_${userId}`, JSON.stringify(updatedList));

  try {
    const { error } = await supabase
      .from('doubts')
      .delete()
      .eq('id', doubtId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase deleteDoubt warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to delete doubt in Supabase:', err);
  }
}
