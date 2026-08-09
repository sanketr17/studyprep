import { supabase } from '../lib/supabase';
import { PYQ } from '../types';
import { resolveSubjectUuid } from './notesService';

function toUuidOrNull(str?: string | null): string | null {
  if (!str) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? str : null;
}

export async function createPYQ(
  userId: string,
  data: Omit<PYQ, 'id' | 'userId' | 'createdAt'>
): Promise<PYQ> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const validSubjectId = resolveSubjectUuid((data as any).subjectId, data.subject);
  const validChapterId = toUuidOrNull((data as any).chapterId);

  const newPYQ: PYQ = {
    id,
    userId,
    subject: data.subject || '',
    chapter: data.chapter || '',
    subjectId: validSubjectId,
    chapterId: validChapterId || '',
    question: data.question,
    marks: Number(data.marks) || 3,
    tags: data.tags || [],
    createdAt: now,
  };

  // Local storage update
  const existingPYQs = await getPYQs(userId);
  const updatedPYQs = [newPYQ, ...existingPYQs];
  localStorage.setItem(`pyqs_${userId}`, JSON.stringify(updatedPYQs));

  try {
    const { data: dbData, error } = await supabase
      .from('pyqs')
      .insert({
        id,
        user_id: userId,
        subject_id: validSubjectId,
        chapter_id: validChapterId,
        question: data.question,
        marks: Number(data.marks) || 3,
        tags: data.tags || [],
        created_at: now,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase createPYQ warning:', error.message);
      if (error.message.includes('foreign key constraint')) {
        throw new Error('Database Error: Subject ID invalid. ' + error.message);
      }
    } else if (dbData) {
      newPYQ.id = dbData.id;
    }
  } catch (err) {
    console.error('Failed to create PYQ in Supabase:', err);
  }

  return newPYQ;
}

export async function getPYQs(userId: string): Promise<PYQ[]> {
  try {
    const { data, error } = await supabase
      .from('pyqs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching PYQs from Supabase:', error.message);
      const local = localStorage.getItem(`pyqs_${userId}`);
      return local ? JSON.parse(local) : [];
    }

    if (data) {
      const pyqs: PYQ[] = data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        subject: '',
        chapter: '',
        subjectId: d.subject_id || '',
        chapterId: d.chapter_id || '',
        question: d.question,
        marks: d.marks,
        tags: d.tags || [],
        createdAt: d.created_at,
      }));
      localStorage.setItem(`pyqs_${userId}`, JSON.stringify(pyqs));
      return pyqs;
    }

    const local = localStorage.getItem(`pyqs_${userId}`);
    return local ? JSON.parse(local) : [];
  } catch (err) {
    console.error('Error fetching PYQs:', err);
    const local = localStorage.getItem(`pyqs_${userId}`);
    return local ? JSON.parse(local) : [];
  }
}

export async function updatePYQ(
  userId: string,
  pyqId: string,
  data: Partial<Omit<PYQ, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const existing = await getPYQs(userId);
  const updatedList = existing.map((p) => (p.id === pyqId ? { ...p, ...data } : p));
  localStorage.setItem(`pyqs_${userId}`, JSON.stringify(updatedList));

  const payload: any = {};
  if (data.question !== undefined) payload.question = data.question;
  if (data.marks !== undefined) payload.marks = Number(data.marks);
  if (data.tags !== undefined) payload.tags = data.tags;
  if ((data as any).subjectId !== undefined) {
    payload.subject_id = resolveSubjectUuid((data as any).subjectId, data.subject);
  }
  if ((data as any).chapterId !== undefined) {
    payload.chapter_id = toUuidOrNull((data as any).chapterId);
  }

  try {
    const { error } = await supabase
      .from('pyqs')
      .update(payload)
      .eq('id', pyqId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase updatePYQ warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to update PYQ in Supabase:', err);
  }
}

export async function deletePYQ(userId: string, pyqId: string): Promise<void> {
  const existing = await getPYQs(userId);
  const updatedList = existing.filter((p) => p.id !== pyqId);
  localStorage.setItem(`pyqs_${userId}`, JSON.stringify(updatedList));

  try {
    const { error } = await supabase
      .from('pyqs')
      .delete()
      .eq('id', pyqId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase deletePYQ warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to delete PYQ in Supabase:', err);
  }
}
