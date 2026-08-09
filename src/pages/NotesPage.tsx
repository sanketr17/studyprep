import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Tag, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { Sidebar } from '../components/ui/Sidebar';
import { useStudyData } from '../hooks/useStudyData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageTransition } from '../components/ui/PageTransition';
import { createNote, updateNote, deleteNote } from '../services/notesService';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';

export const NotesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { notes, subjects, chapters, loading, refetchData } = useStudyData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('Formula, Important');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#15161F]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Opening Notes &amp; Formula Vault..." />
        </main>
      </div>
    );
  }

  // Extract all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  );

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubject === 'ALL' || n.subjectId === selectedSubject || n.subject === selectedSubject;
    const matchesTag = selectedTag === 'ALL' || (n.tags && n.tags.includes(selectedTag));

    return matchesSearch && matchesSubject && matchesTag;
  });

  const handleOpenAddModal = () => {
    setEditingNote(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setChapterId('');
    setContent('');
    setTagsInput('Formula, Important');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    const initialSubId = note.subjectId || subjects.find((s) => s.name === note.subject)?.id || subjects[0]?.id || '';
    const initialChapId = note.chapterId || chapters.find((c) => c.chapterName === note.chapter)?.id || '';
    setSubjectId(initialSubId);
    setChapterId(initialChapId);
    setContent(note.content);
    setTagsInput((note.tags || []).join(', '));
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title || !content) return;

    setFormError(null);
    const selectedSubObj = subjects.find((s) => s.id === subjectId);
    const selectedChapObj = chapters.find((c) => c.id === chapterId);

    if (!subjectId || !selectedSubObj) {
      setFormError('Please select a valid subject.');
      return;
    }

    try {
      setSubmitting(true);
      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (editingNote) {
        await updateNote(currentUser.uid, editingNote.id, {
          title,
          subjectId,
          chapterId: chapterId || undefined,
          subject: selectedSubObj.name,
          chapter: selectedChapObj?.chapterName || '',
          content,
          tags: tagsArray,
        });
      } else {
        await createNote(currentUser.uid, {
          title,
          subjectId,
          chapterId: chapterId || undefined,
          subject: selectedSubObj.name,
          chapter: selectedChapObj?.chapterName || '',
          content,
          tags: tagsArray,
        });
      }

      setModalOpen(false);
      refetchData();
    } catch (err: any) {
      console.error('Error saving note:', err);
      setFormError(err.message || 'Failed to save note in database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!currentUser || !window.confirm('Delete this formula/note?')) return;
    await deleteNote(currentUser.uid, noteId);
    refetchData();
  };

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <PageTransition className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343541] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#20212C] border border-[#343541] text-[11px] font-mono text-[#BFA7FF] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DIGITAL KNOWLEDGE VAULT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
              Notes &amp; Formula Vault
            </h1>
            <p className="text-xs text-[#A7A7AD] mt-1">
              Store formulas, definitions, chemical reactions, and quick revision notes.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Create New Note
          </Button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#74747D]" />
            <input
              type="text"
              placeholder="Search formulas, concepts, chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] placeholder-[#74747D] focus:outline-none focus:border-[#BFA7FF]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              >
                <option value="ALL">All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    Tag: {t}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* NOTES GRID */}
        {filteredNotes.length === 0 ? (
          <EmptyState
            title="NO NOTES FOUND"
            description="Your best formulas, chemical reactions, and definitions deserve a place here."
            actionText="Add Your First Note"
            onAction={handleOpenAddModal}
            icon={<FileText className="w-6 h-6" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="lavender">{note.subject}</Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(note)}
                        className="p-1 rounded text-[#A7A7AD] hover:text-[#F5F5F2] hover:bg-[#20212C]"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 rounded text-[#FF8F9A] hover:bg-[#FF8F9A]/10"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#F5F5F2] mb-1">{note.title}</h3>
                  {note.chapter && (
                    <p className="text-[11px] font-mono text-[#D8FF9A] mb-3">Ch: {note.chapter}</p>
                  )}

                  <div className="text-xs text-[#A7A7AD] whitespace-pre-line bg-[#15161F] p-3 rounded-lg border border-[#343541]/60 font-mono leading-relaxed mb-4">
                    {note.content}
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-[#343541]">
                  {note.tags &&
                    note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-[#74747D] bg-[#20212C] px-2 py-0.5 rounded border border-[#343541]"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CREATE / EDIT NOTE MODAL */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingNote ? 'Edit Vault Note' : 'Add New Note / Formula'}
          subtitle="Save formulas, definitions, and quick revision notes."
        >
          <form onSubmit={handleSaveNote} className="space-y-4">
            {formError && (
              <div className="p-3 bg-[#FF8F9A]/10 border border-[#FF8F9A]/40 rounded-lg text-[#FF8F9A] text-xs font-mono">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Title</label>
              <input
                type="text"
                placeholder="e.g. Quadratic Formula & Discriminant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setChapterId('');
                  }}
                  className="w-full px-3 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Chapter (Optional)</label>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
                >
                  <option value="">Select Chapter (Optional)</option>
                  {chapters
                    .filter((c) => c.subjectId === subjectId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        Ch {c.chapterNumber}: {c.chapterName}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Content / Formula</label>
              <textarea
                rows={5}
                placeholder="Enter formulas, reactions, or definitions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] font-mono focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                placeholder="Formula, Important, Board Favourite"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#343541]">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
              </Button>
            </div>
          </form>
        </Modal>

      </PageTransition>
    </div>
  );
};
