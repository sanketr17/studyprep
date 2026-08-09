import { supabase } from '../lib/supabase';
import { Note } from '../types';

function toUuidOrNull(str?: string | null): string | null {
  if (!str) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? str : null;
}

const DEFAULT_SUBJECT_MAP: Record<string, string> = {
  'mathematics': '10000000-0000-4000-8000-000000000001',
  'maths': '10000000-0000-4000-8000-000000000001',
  'science': '10000000-0000-4000-8000-000000000002',
  'social science': '10000000-0000-4000-8000-000000000003',
  'english': '10000000-0000-4000-8000-000000000004',
  'hindi': '10000000-0000-4000-8000-000000000005',
};

export function resolveSubjectUuid(subjectId?: string | null, subjectName?: string | null): string {
  const validUuid = toUuidOrNull(subjectId);
  if (validUuid) return validUuid;

  if (subjectName) {
    const key = subjectName.trim().toLowerCase();
    if (DEFAULT_SUBJECT_MAP[key]) return DEFAULT_SUBJECT_MAP[key];
  }

  return '10000000-0000-4000-8000-000000000001';
}

export async function createNote(
  userId: string,
  data: Omit<Note, 'id' | 'userId' | 'createdAt'>
): Promise<Note> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const validSubjectId = resolveSubjectUuid(data.subjectId, data.subject);
  const validChapterId = toUuidOrNull(data.chapterId);

  const newNote: Note = {
    id,
    userId,
    title: data.title,
    subject: data.subject || '',
    chapter: data.chapter || '',
    subjectId: validSubjectId,
    chapterId: validChapterId || '',
    content: data.content,
    tags: data.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  // Local storage update for immediate reactivity
  const existingNotes = await getNotes(userId);
  const updatedNotes = [newNote, ...existingNotes];
  localStorage.setItem(`notes_${userId}`, JSON.stringify(updatedNotes));

  try {
    const { data: dbData, error } = await supabase
      .from('notes')
      .insert({
        id,
        user_id: userId,
        title: data.title,
        subject_id: validSubjectId,
        chapter_id: validChapterId,
        content: data.content,
        tags: data.tags || [],
        created_at: now,
        updated_at: now,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase createNote warning:', error.message);
      if (error.message.includes('foreign key constraint')) {
        throw new Error('Database Error: Subject ID invalid. ' + error.message);
      }
    } else if (dbData) {
      newNote.id = dbData.id;
    }
  } catch (err) {
    console.error('Failed to create note in Supabase:', err);
  }

  return newNote;
}

export async function getNotes(userId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching notes from Supabase:', error.message);
      const local = localStorage.getItem(`notes_${userId}`);
      return local ? JSON.parse(local) : [];
    }

    if (data) {
      const notes: Note[] = data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        title: d.title,
        subject: '',
        chapter: '',
        subjectId: d.subject_id || '',
        chapterId: d.chapter_id || '',
        content: d.content || '',
        tags: d.tags || [],
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
      localStorage.setItem(`notes_${userId}`, JSON.stringify(notes));
      return notes;
    }

    const local = localStorage.getItem(`notes_${userId}`);
    return local ? JSON.parse(local) : [];
  } catch (err) {
    console.error('Error fetching notes:', err);
    const local = localStorage.getItem(`notes_${userId}`);
    return local ? JSON.parse(local) : [];
  }
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const now = new Date().toISOString();

  const existing = await getNotes(userId);
  const updatedList = existing.map((n) => {
    if (n.id === noteId) {
      return { ...n, ...data, updatedAt: now };
    }
    return n;
  });
  localStorage.setItem(`notes_${userId}`, JSON.stringify(updatedList));

  const payload: any = { updated_at: now };
  if (data.title !== undefined) payload.title = data.title;
  if (data.subjectId !== undefined) payload.subject_id = toUuidOrNull(data.subjectId);
  if (data.chapterId !== undefined) payload.chapter_id = toUuidOrNull(data.chapterId);
  if (data.content !== undefined) payload.content = data.content;
  if (data.tags !== undefined) payload.tags = data.tags;

  try {
    const { error } = await supabase
      .from('notes')
      .update(payload)
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase updateNote warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to update note in Supabase:', err);
  }
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const existing = await getNotes(userId);
  const updatedList = existing.filter((n) => n.id !== noteId);
  localStorage.setItem(`notes_${userId}`, JSON.stringify(updatedList));

  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase deleteNote warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to delete note in Supabase:', err);
  }
}
