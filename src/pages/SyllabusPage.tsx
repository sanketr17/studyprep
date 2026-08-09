import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Search, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/ui/Sidebar';
import { useStudyData } from '../hooks/useStudyData';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { PageTransition } from '../components/ui/PageTransition';
import { ChapterStatus } from '../types';

export const SyllabusPage: React.FC = () => {

  const {
    subjects,
    chapters,
    progressList,
    subjectProgressList,
    overallProgress,
    loading,
    error,
    refetchData,
    updateChapterStatus,
  } = useStudyData();

  const [expandedSubjectId, setExpandedSubjectId] = useState<string>('10000000-0000-4000-8000-000000000001');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#15161F]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Loading Class 10 syllabus..." />
        </main>
      </div>
    );
  }

  const statusOptions: ChapterStatus[] = [
    'Not Started',
    'Video Watched',
    'NCERT Read',
    'Questions Solved',
    'Fully Revised',
  ];

  const getBadgeVariantForStatus = (status: ChapterStatus) => {
    switch (status) {
      case 'Fully Revised':
        return 'lime';
      case 'Questions Solved':
        return 'lavender';
      case 'NCERT Read':
        return 'warning';
      case 'Video Watched':
        return 'warning';
      default:
        return 'muted';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343541] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#20212C] border border-[#343541] text-[11px] font-mono text-[#D8FF9A] mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#BFA7FF]" />
              <span>ACADEMIC WORKSPACE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
              Syllabus &amp; Chapter Tracker
            </h1>
            <p className="text-xs text-[#A7A7AD] mt-1">
              Class 10 Board preparation breakdown. Update preparation milestones per chapter.
            </p>
          </div>

          <div className="bg-[#1B1C26] border border-[#343541] p-4 rounded-xl flex items-center gap-6 min-w-[220px]">
            <div>
              <span className="text-[10px] font-mono text-[#A7A7AD] uppercase block">Overall Syllabus</span>
              <span className="text-2xl font-extrabold text-[#D8FF9A] font-mono">{overallProgress}%</span>
            </div>
            <div className="flex-1">
              <ProgressBar percentage={overallProgress} color="lime" height="md" />
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#74747D]" />
            <input
              type="text"
              placeholder="Search chapters (e.g. Quadratic Equations, Light, Power Sharing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] placeholder-[#74747D] focus:outline-none focus:border-[#BFA7FF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 bg-[#1B1C26] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUBJECT ACCORDION WORKSPACE */}
        {subjects.length === 0 ? (
          <Card className="p-8 text-center space-y-3 bg-[#1B1C26]">
            <p className="text-xs font-mono text-[#A7A7AD]">
              {error || 'Class 10 syllabus is not available yet.'}
            </p>
            <button
              onClick={() => refetchData()}
              className="px-4 py-2 bg-[#20212C] border border-[#343541] hover:border-[#BFA7FF] rounded-lg text-xs font-mono text-[#F5F5F2] transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#BFA7FF]" />
              Try Again
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            {subjects.map((sub) => {
            const sp = subjectProgressList.find((s) => s.subjectId === sub.id) || {
              progressPercentage: 0,
              completedChapters: 0,
              totalChapters: 0,
            };

            const isExpanded = expandedSubjectId === sub.id;
            const subjectChapters = chapters.filter((c) => c.subjectId === sub.id);

            // Filter chapters if searching or status filtered
            const filteredChapters = subjectChapters.filter((chap) => {
              const prog = progressList.find((p) => p.chapterId === chap.id);
              const status = prog ? prog.status : 'Not Started';

              const matchesSearch = chap.chapterName.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesStatus = filterStatus === 'ALL' || status === filterStatus;

              return matchesSearch && matchesStatus;
            });

            if (searchQuery && filteredChapters.length === 0) return null;

            return (
              <Card key={sub.id} className="overflow-hidden p-0">
                {/* Subject Header */}
                <div
                  onClick={() => setExpandedSubjectId(isExpanded ? '' : sub.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#20212C] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#20212C] border border-[#343541] flex items-center justify-center text-[#BFA7FF] font-mono font-bold text-sm">
                      0{sub.displayOrder}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-[#F5F5F2]">{sub.name}</h3>
                        <span className="text-xs font-mono text-[#A7A7AD]">
                          {sp.completedChapters}/{sp.totalChapters} Ch. Fully Done
                        </span>
                      </div>
                      <div className="w-full max-w-xs mt-2">
                        <ProgressBar percentage={sp.progressPercentage} height="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-extrabold font-mono text-[#D8FF9A]">
                      {sp.progressPercentage}%
                    </span>
                    <button className="p-1 text-[#A7A7AD] hover:text-[#F5F5F2]">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Chapter List Body */}
                {isExpanded && (
                  <div className="border-t border-[#343541] p-4 bg-[#15161F]/60 divide-y divide-[#343541]/60">
                    {filteredChapters.map((chap) => {
                      const userProg = progressList.find((p) => p.chapterId === chap.id);
                      const currentStatus: ChapterStatus = userProg ? userProg.status : 'Not Started';

                      return (
                        <div
                          key={chap.id}
                          className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1B1C26]/80 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-[#74747D] w-6">
                              {chap.chapterNumber < 10 ? `0${chap.chapterNumber}` : chap.chapterNumber}
                            </span>
                            <div>
                              <span className="text-xs font-semibold text-[#F5F5F2]">{chap.chapterName}</span>
                              {userProg?.lastRevisedAt && (
                                <span className="text-[10px] text-[#74747D] font-mono block">
                                  Last revised: {new Date(userProg.lastRevisedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Dropdown Picker */}
                          <div className="flex items-center gap-3">
                            <Badge variant={getBadgeVariantForStatus(currentStatus)}>
                              {currentStatus}
                            </Badge>

                            <select
                              value={currentStatus}
                              onChange={(e) =>
                                updateChapterStatus(chap.id, sub.id, e.target.value as ChapterStatus)
                              }
                              className="px-2.5 py-1 bg-[#20212C] border border-[#343541] rounded text-[11px] font-mono text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF] cursor-pointer"
                            >
                              {statusOptions.map((st) => (
                                <option key={st} value={st}>
                                  Set: {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        )}

      </main>
    </div>
  );
};
