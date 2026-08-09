import React, { useState } from 'react';
import { 
  FileQuestion, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  HelpCircle, 
  CheckCircle2, 
  Award 
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
import { createPYQ, updatePYQ, deletePYQ } from '../services/pyqService';
import { PYQ } from '../types';
import { useAuth } from '../context/AuthContext';

export const PYQPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { pyqs, subjects, chapters, loading, refetchData } = useStudyData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedMarks, setSelectedMarks] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPYQ, setEditingPYQ] = useState<PYQ | null>(null);

  const [question, setQuestion] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [marks, setMarks] = useState<number>(3);
  const [tagsInput, setTagsInput] = useState('Repeated Question, Board Favourite');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#15161F]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Opening PYQ Workspace..." />
        </main>
      </div>
    );
  }

  const filteredPYQs = pyqs.filter((p) => {
    const matchesSearch =
      p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubject === 'ALL' || p.subjectId === selectedSubject || p.subject === selectedSubject;
    const matchesMarks = selectedMarks === 'ALL' || p.marks === Number(selectedMarks);

    return matchesSearch && matchesSubject && matchesMarks;
  });

  const handleOpenAddModal = () => {
    setEditingPYQ(null);
    setQuestion('');
    setSubjectId(subjects[0]?.id || '');
    setChapterId('');
    setMarks(3);
    setTagsInput('Repeated Question, Board Favourite');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (pyq: PYQ) => {
    setEditingPYQ(pyq);
    setQuestion(pyq.question);
    const initialSubId = pyq.subjectId || subjects.find((s) => s.name === pyq.subject)?.id || subjects[0]?.id || '';
    const initialChapId = pyq.chapterId || chapters.find((c) => c.chapterName === pyq.chapter)?.id || '';
    setSubjectId(initialSubId);
    setChapterId(initialChapId);
    setMarks(pyq.marks);
    setTagsInput((pyq.tags || []).join(', '));
    setFormError(null);
    setModalOpen(true);
  };

  const handleSavePYQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !question) return;

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

      if (editingPYQ) {
        await updatePYQ(currentUser.uid, editingPYQ.id, {
          question,
          subjectId,
          chapterId: chapterId || undefined,
          subject: selectedSubObj.name,
          chapter: selectedChapObj?.chapterName || '',
          marks,
          tags: tagsArray,
        });
      } else {
        await createPYQ(currentUser.uid, {
          question,
          subjectId,
          chapterId: chapterId || undefined,
          subject: selectedSubObj.name,
          chapter: selectedChapObj?.chapterName || '',
          marks,
          tags: tagsArray,
        });
      }

      setModalOpen(false);
      refetchData();
    } catch (err: any) {
      console.error('Error saving PYQ:', err);
      setFormError(err.message || 'Failed to save PYQ in database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (pyqId: string) => {
    if (!currentUser || !window.confirm('Delete this Previous Year Question?')) return;
    await deletePYQ(currentUser.uid, pyqId);
    refetchData();
  };

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <PageTransition className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343541] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#20212C] border border-[#343541] text-[11px] font-mono text-[#D8FF9A] mb-2">
              <FileQuestion className="w-3.5 h-3.5 text-[#D8FF9A]" />
              <span>QUESTION WORKSPACE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
              Previous Year Questions (PYQs)
            </h1>
            <p className="text-xs text-[#A7A7AD] mt-1">
              Practice 1, 3, and 5-mark board exam questions sorted by frequency and chapter.
            </p>
          </div>

          <Button
            variant="lime"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            Add New PYQ
          </Button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#74747D]" />
            <input
              type="text"
              placeholder="Search PYQ questions, chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] placeholder-[#74747D] focus:outline-none focus:border-[#BFA7FF]"
            />
          </div>

          <div className="flex items-center gap-2">
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

            <select
              value={selectedMarks}
              onChange={(e) => setSelectedMarks(e.target.value)}
              className="px-3 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
            >
              <option value="ALL">All Marks</option>
              <option value="1">1 Mark</option>
              <option value="2">2 Marks</option>
              <option value="3">3 Marks</option>
              <option value="5">5 Marks</option>
            </select>
          </div>
        </div>

        {/* PYQ LIST */}
        {filteredPYQs.length === 0 ? (
          <EmptyState
            title="NO PREVIOUS YEAR QUESTIONS"
            description="Collect important board questions here to practice before your exams."
            actionText="Add First PYQ"
            onAction={handleOpenAddModal}
            icon={<FileQuestion className="w-6 h-6" />}
          />
        ) : (
          <div className="space-y-4">
            {filteredPYQs.map((pyq) => (
              <Card key={pyq.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Badge variant="lime">{pyq.marks} MARKS</Badge>
                    <span className="text-xs font-bold text-[#BFA7FF]">{pyq.subject}</span>
                    {pyq.chapter && (
                      <span className="text-xs text-[#A7A7AD] font-mono">• Ch: {pyq.chapter}</span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-[#F5F5F2] leading-relaxed">
                    "{pyq.question}"
                  </p>

                  <div className="flex items-center flex-wrap gap-1.5 pt-1">
                    {pyq.tags &&
                      pyq.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono text-[#D8FF9A] bg-[#D8FF9A]/10 px-2 py-0.5 rounded border border-[#D8FF9A]/20"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-[#343541]">
                  <button
                    onClick={() => handleOpenEditModal(pyq)}
                    className="p-2 rounded-lg text-[#A7A7AD] hover:text-[#F5F5F2] hover:bg-[#20212C]"
                    title="Edit PYQ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pyq.id)}
                    className="p-2 rounded-lg text-[#FF8F9A] hover:bg-[#FF8F9A]/10"
                    title="Delete PYQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* MODAL */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingPYQ ? 'Edit PYQ' : 'Add Board PYQ'}
          subtitle="Record past board examination questions for targeted revision."
        >
          <form onSubmit={handleSavePYQ} className="space-y-4">
            {formError && (
              <div className="p-3 bg-[#FF8F9A]/10 border border-[#FF8F9A]/40 rounded-lg text-[#FF8F9A] text-xs font-mono">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Question Text</label>
              <textarea
                rows={4}
                placeholder="Enter board question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setChapterId('');
                  }}
                  className="w-full px-2.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Chapter</label>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
                >
                  <option value="">Select Chapter</option>
                  {chapters
                    .filter((c) => c.subjectId === subjectId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        Ch {c.chapterNumber}: {c.chapterName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Marks Weight</label>
                <select
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full px-2.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
                >
                  <option value={1}>1 Mark</option>
                  <option value={2}>2 Marks</option>
                  <option value={3}>3 Marks</option>
                  <option value={5}>5 Marks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                placeholder="Repeated Question, 5 Marks, Board Favourite"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#343541]">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="lime" disabled={submitting}>
                {submitting ? 'Saving...' : editingPYQ ? 'Update PYQ' : 'Save PYQ'}
              </Button>
            </div>
          </form>
        </Modal>

      </PageTransition>
    </div>
  );
};
