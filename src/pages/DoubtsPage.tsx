import React, { useState } from 'react';
import { 
  CircleHelp, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Check,
  RotateCcw
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
import { createDoubt, updateDoubt, deleteDoubt } from '../services/doubtService';
import { Doubt } from '../types';
import { useAuth } from '../context/AuthContext';

export const DoubtsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { doubts, subjects, chapters, loading, refetchData } = useStudyData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#15161F]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Opening Doubt Tracker..." />
        </main>
      </div>
    );
  }

  const filteredDoubts = doubts.filter((d) => {
    const matchesSearch =
      d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || d.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleOpenModal = () => {
    setQuestion('');
    setSubjectId(subjects[0]?.id || '');
    setChapterId('');
    setPriority('High');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveDoubt = async (e: React.FormEvent) => {
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
      await createDoubt(currentUser.uid, {
        question,
        subjectId,
        chapterId: chapterId || undefined,
        subject: selectedSubObj.name,
        chapter: selectedChapObj?.chapterName || '',
        priority,
        status: 'Unresolved',
      });
      setModalOpen(false);
      refetchData();
    } catch (err: any) {
      console.error('Error saving doubt:', err);
      setFormError(err.message || 'Failed to save doubt in database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleResolve = async (doubt: Doubt) => {
    if (!currentUser) return;
    const nextStatus = doubt.status === 'Resolved' ? 'Unresolved' : 'Resolved';
    await updateDoubt(currentUser.uid, doubt.id, { status: nextStatus });
    refetchData();
  };

  const handleDelete = async (doubtId: string) => {
    if (!currentUser || !window.confirm('Delete this doubt record?')) return;
    await deleteDoubt(currentUser.uid, doubtId);
    refetchData();
  };

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <PageTransition className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343541] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#20212C] border border-[#343541] text-[11px] font-mono text-[#FF8F9A] mb-2">
              <CircleHelp className="w-3.5 h-3.5" />
              <span>ACADEMIC DOUBT HUB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
              Doubt Tracker
            </h1>
            <p className="text-xs text-[#A7A7AD] mt-1">
              Record concept gaps and questions. Mark them resolved as teacher or self-study clarifies them.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenModal}
          >
            Record New Doubt
          </Button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#74747D]" />
            <input
              type="text"
              placeholder="Search doubts, chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] placeholder-[#74747D] focus:outline-none focus:border-[#BFA7FF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Unresolved">Unresolved</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* DOUBTS LIST */}
        {filteredDoubts.length === 0 ? (
          <EmptyState
            title="NO DOUBTS RECORDED"
            description="Clear study doubts lead to high board scores. Record your doubts here as you study."
            actionText="Record First Doubt"
            onAction={handleOpenModal}
            icon={<CircleHelp className="w-6 h-6" />}
          />
        ) : (
          <div className="space-y-4">
            {filteredDoubts.map((doubt) => {
              const isResolved = doubt.status === 'Resolved';
              return (
                <Card
                  key={doubt.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
                    isResolved
                      ? 'border-l-[#74747D] bg-[#1B1C26]/60'
                      : doubt.priority === 'High'
                      ? 'border-l-[#BFA7FF]'
                      : 'border-l-[#FFD98A]'
                  }`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Badge variant={doubt.priority === 'High' ? 'lavender' : 'warning'}>
                        {doubt.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <Badge variant={isResolved ? 'success' : 'muted'}>
                        {doubt.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-bold text-[#F5F5F2]">{doubt.subject}</span>
                      {doubt.chapter && (
                        <span className="text-xs text-[#A7A7AD] font-mono">• Ch: {doubt.chapter}</span>
                      )}
                    </div>

                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        isResolved ? 'text-[#74747D] line-through' : 'text-[#F5F5F2]'
                      }`}
                    >
                      "{doubt.question}"
                    </p>

                    <div className="text-[10px] font-mono text-[#74747D]">
                      Created: {new Date(doubt.createdAt).toLocaleDateString()}
                      {doubt.resolvedAt && (
                        <span className="text-[#D8FF9A] ml-2">
                          • Resolved: {new Date(doubt.resolvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <Button
                      variant={isResolved ? 'secondary' : 'lime'}
                      size="sm"
                      icon={isResolved ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      onClick={() => handleToggleResolve(doubt)}
                    >
                      {isResolved ? 'Reopen Doubt' : 'Mark Resolved'}
                    </Button>

                    <button
                      onClick={() => handleDelete(doubt.id)}
                      className="p-2 rounded-lg text-[#FF8F9A] hover:bg-[#FF8F9A]/10"
                      title="Delete Doubt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* RECORD DOUBT MODAL */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Record Academic Doubt"
          subtitle="Document questions or concept gaps that require clarification."
        >
          <form onSubmit={handleSaveDoubt} className="space-y-4">
            {formError && (
              <div className="p-3 bg-[#FF8F9A]/10 border border-[#FF8F9A]/40 rounded-lg text-[#FF8F9A] text-xs font-mono">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Doubt / Question</label>
              <textarea
                rows={4}
                placeholder="State your doubt clearly..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
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

              <div>
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

              <div>
                <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-2.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#343541]">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Record Doubt'}
              </Button>
            </div>
          </form>
        </Modal>

      </PageTransition>
    </div>
  );
};
