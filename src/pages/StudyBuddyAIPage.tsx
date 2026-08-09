import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  Target, 
  BookOpen, 
  AlertTriangle, 
  CircleHelp, 
  Clock, 
  CheckCircle2, 
  Brain, 
  Calendar, 
  FileQuestion, 
  ChevronRight, 
  Copy, 
  Check, 
  PanelRightOpen, 
  PanelRightClose,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/ui/Sidebar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { useStudyData } from '../hooks/useStudyData';


interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
}

export const StudyBuddyAIPage: React.FC = () => {
  const { profile } = useAuth();
  const {
    subjects,
    overallProgress,
    subjectProgressList,
    revisionRecommendations,
    pendingDoubtsCount,
    todayStudyMinutes,
    todayTasks,
    doubts,
  } = useStudyData();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('studybuddy_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<string>('general');
  const [showContextPanel, setShowContextPanel] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('studybuddy_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Derive weakest subject
  const sortedSubjects = [...subjectProgressList].sort(
    (a, b) => a.progressPercentage - b.progressPercentage
  );
  const weakestSubject = sortedSubjects.length > 0 ? sortedSubjects[0] : null;

  // Student Context Payload for AI
  const getContextPayload = () => {
    return {
      profile: {
        fullName: profile?.fullName || 'Student',
        boardName: profile?.boardName || 'CBSE',
        targetPercentage: profile?.targetPercentage || 95,
      },
      overallProgressPercentage: `${overallProgress}%`,
      subjectBreakdown: subjectProgressList.map((s) => ({
        name: s.subjectName,
        progress: `${s.progressPercentage}%`,
        completedChapters: `${s.completedChapters}/${s.totalChapters}`,
      })),
      weakestSubject: weakestSubject
        ? `${weakestSubject.subjectName} (${weakestSubject.progressPercentage}% progress)`
        : 'Not enough data',
      revisionDueCount: revisionRecommendations.length,
      revisionDueChapters: revisionRecommendations.map(
        (r) => `${r.chapterName} (${r.subjectName})`
      ),
      openDoubtsCount: pendingDoubtsCount,
      openDoubtsTitles: doubts
        .filter((d) => d.status !== 'Resolved')
        .map((d) => d.questionTitle)
        .slice(0, 5),
      todayStudyTimeMinutes: todayStudyMinutes,
      todayPendingTasks: todayTasks
        .filter((t) => !t.completed)
        .map((t) => t.title),
    };
  };

  const handleSendMessage = async (customPrompt?: string, intentOverride?: string) => {
    const query = (customPrompt || inputQuery).trim();
    if (!query || isGenerating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      intent: intentOverride || selectedIntent,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!customPrompt) setInputQuery('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/studybuddy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context: getContextPayload(),
          intent: intentOverride || selectedIntent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.reply || 'I am sorry, I could not generate a response right now.';

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('StudyBuddy AI request failed:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          '⚠️ StudyBuddy is temporarily unable to connect to the AI service. Please verify your connection or try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear your current conversation history with StudyBuddy?')) {
      setMessages([]);
      localStorage.removeItem('studybuddy_chat_history');
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const studentFirstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Student';

  // Quick action options
  const suggestionCards = [
    {
      title: 'Explain a Concept',
      subtitle: 'Break down complex topics simply',
      icon: <Brain className="w-4 h-4 text-[#BFA7FF]" />,
      prompt: 'Explain trigonometry concepts simply with key formulas.',
      intent: 'explain_simply',
    },
    {
      title: 'Today\'s Study Plan',
      subtitle: 'Personalized based on your goals',
      icon: <Calendar className="w-4 h-4 text-[#D8FF9A]" />,
      prompt: 'Help me plan my study routine for today based on my current progress.',
      intent: 'study_plan',
    },
    {
      title: '5-Mark Exam Question',
      subtitle: 'Format board-ready structured answers',
      icon: <FileQuestion className="w-4 h-4 text-[#FF8F9A]" />,
      prompt: 'Give me a 5-mark board exam question and solution for Science.',
      intent: 'exam_answer',
    },
    {
      title: 'Analyze Weakest Subject',
      subtitle: 'Actionable steps to boost scores',
      icon: <AlertTriangle className="w-4 h-4 text-[#FFC700]" />,
      prompt: 'Analyze my weakest subject and recommend 3 immediate focus steps.',
      intent: 'progress_analysis',
    },
    {
      title: 'Chapter Revision Guide',
      subtitle: 'Quick revision breakdown & key formulas',
      icon: <BookOpen className="w-4 h-4 text-[#BFA7FF]" />,
      prompt: 'Give me a 10-minute quick revision guide for my next pending chapter.',
      intent: 'revision',
    },
  ];

  const smartActionPills = [
    {
      label: 'Analyze My Progress',
      prompt: 'Based on my current syllabus progress, how prepared am I for the 10th Board Exam and what needs my attention first?',
      intent: 'progress_analysis',
    },
    {
      label: 'Plan My Day',
      prompt: 'Create a realistic study plan for today incorporating my incomplete tasks, pending doubts, and revision goals.',
      intent: 'study_plan',
    },
    {
      label: 'Find My Weakest Subject',
      prompt: 'Look at my subject progress data. Which subject is my weakest, and how should I study it this week?',
      intent: 'explain_simply',
    },
    {
      label: 'Revision Plan',
      prompt: 'I have chapters due for revision. Which chapters should I prioritize today and why?',
      intent: 'revision',
    },
    {
      label: 'Unresolved Doubts',
      prompt: 'Help me understand and resolve my open study doubts step-by-step.',
      intent: 'doubt_help',
    },
  ];

  return (
    <div className="flex h-screen bg-[#15161F] text-[#F5F5F2] overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="px-6 py-4 bg-[#1B1C26] border-b border-[#343541] flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BFA7FF]/20 to-[#D8FF9A]/20 border border-[#BFA7FF]/40 flex items-center justify-center text-[#BFA7FF]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-[#F5F5F2]">
                  StudyBuddy AI
                </h1>
                <Badge variant="success" className="text-[10px] px-2 py-0.5 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF9A] animate-ping" />
                  Groq Engine Active
                </Badge>
              </div>
              <p className="text-xs text-[#A7A7AD]">
                Your personal Class 10 board exam preparation assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="px-3 py-1.5 bg-[#20212C] hover:bg-[#282936] text-[#A7A7AD] hover:text-[#FF8F9A] border border-[#343541] rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                title="Clear Chat History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}

            <button
              onClick={() => setShowContextPanel(!showContextPanel)}
              className="px-3 py-1.5 bg-[#20212C] hover:bg-[#282936] text-[#BFA7FF] border border-[#343541] rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
              title="Toggle Student Context Panel"
            >
              {showContextPanel ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{showContextPanel ? 'Hide Context' : 'Show Context'}</span>
            </button>
          </div>
        </header>

        {/* Quick Smart Actions Bar */}
        <div className="px-6 py-2 bg-[#181923] border-b border-[#343541]/60 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-mono text-[#A7A7AD] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#D8FF9A]" /> Smart Actions:
          </span>
          {smartActionPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill.prompt, pill.intent)}
              disabled={isGenerating}
              className="px-2.5 py-1 bg-[#20212C] hover:bg-[#BFA7FF]/15 border border-[#343541] hover:border-[#BFA7FF]/40 rounded-full text-[11px] text-[#A7A7AD] hover:text-[#F5F5F2] whitespace-nowrap transition-all duration-150"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Main Content Workspace (Chat + Context Panel) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Conversation Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#15161F]">
            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {messages.length === 0 ? (
                /* Welcome Screen */
                <div className="max-w-2xl mx-auto my-auto py-8 space-y-6 text-center sm:text-left">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-[#F5F5F2] tracking-tight">
                      Hi {studentFirstName} 👋
                    </h2>
                    <p className="text-sm text-[#A7A7AD] leading-relaxed">
                      I'm <strong className="text-[#BFA7FF]">StudyBuddy AI</strong>, your personal Class 10 board preparation assistant. I analyze your syllabus progress, doubts, and goals to give you board-ready answers and study plans.
                    </p>
                    <p className="text-xs text-[#D8FF9A] font-mono">
                      What would you like to work on today?
                    </p>
                  </div>

                  {/* Suggestion Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {suggestionCards.map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(card.prompt, card.intent)}
                        disabled={isGenerating}
                        className="p-3.5 bg-[#1B1C26] hover:bg-[#20212C] border border-[#343541] hover:border-[#BFA7FF]/50 rounded-xl text-left transition-all duration-200 group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-[#20212C] rounded-lg border border-[#343541] group-hover:border-[#BFA7FF]/30">
                            {card.icon}
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#A7A7AD] group-hover:text-[#BFA7FF] transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-[#F5F5F2] group-hover:text-[#BFA7FF] transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-[11px] text-[#A7A7AD] line-clamp-1 mt-0.5">
                            {card.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Conversation Bubbles */
                <div className="space-y-5 max-w-3xl mx-auto">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className={`flex gap-3 ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-[#BFA7FF]/20 border border-[#BFA7FF]/40 text-[#BFA7FF] flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl text-xs space-y-2 ${
                          msg.role === 'user'
                            ? 'bg-[#2B273F] text-[#F5F5F2] border border-[#BFA7FF]/30 rounded-tr-none'
                            : 'bg-[#1B1C26] text-[#F5F5F2] border border-[#343541] rounded-tl-none shadow-md'
                        }`}
                      >
                        {/* Header & Timestamp */}
                        <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-[#A7A7AD] border-b border-[#343541]/40 pb-1.5 mb-1">
                          <span className="font-semibold text-[#BFA7FF]">
                            {msg.role === 'user' ? 'You' : 'StudyBuddy AI'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>{msg.timestamp}</span>
                            {msg.role === 'assistant' && (
                              <button
                                onClick={() => handleCopyText(msg.id, msg.content)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-[#F5F5F2] cursor-pointer"
                                title="Copy Response"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3 h-3 text-[#D8FF9A]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Content Body */}
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-[#20212C] border border-[#343541] text-[#A7A7AD] flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-xs">
                          {studentFirstName[0]}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Thinking Indicator */}
                  {isGenerating && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-lg bg-[#BFA7FF]/20 border border-[#BFA7FF]/40 text-[#BFA7FF] flex items-center justify-center shrink-0 animate-pulse">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="p-4 bg-[#1B1C26] border border-[#343541] rounded-2xl rounded-tl-none text-xs text-[#A7A7AD] flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#BFA7FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-[#BFA7FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-[#BFA7FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="font-mono text-[11px] text-[#BFA7FF]">
                          StudyBuddy is thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Bottom Input Section */}
            <div className="p-4 bg-[#1B1C26] border-t border-[#343541] shrink-0">
              <div className="max-w-3xl mx-auto space-y-2">
                {/* Assistance Mode Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                  <span className="text-[10px] font-mono text-[#A7A7AD] uppercase tracking-wider mr-1">
                    Mode:
                  </span>
                  {[
                    { id: 'general', label: '💬 Ask AI' },
                    { id: 'explain_simply', label: '💡 Explain Simply' },
                    { id: 'exam_answer', label: '📝 Exam 5-Mark' },
                    { id: 'step_solver', label: '🔢 Step Solver' },
                    { id: 'revision', label: '🎯 Revision Plan' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedIntent(mode.id)}
                      className={`px-2.5 py-1 rounded-lg font-mono transition-colors whitespace-nowrap ${
                        selectedIntent === mode.id
                          ? 'bg-[#BFA7FF]/20 text-[#BFA7FF] border border-[#BFA7FF]/40 font-semibold'
                          : 'bg-[#20212C] text-[#A7A7AD] border border-[#343541] hover:text-[#F5F5F2]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Input Text Box */}
                <div className="relative flex items-end bg-[#15161F] border border-[#343541] focus-within:border-[#BFA7FF]/60 rounded-xl transition-all">
                  <textarea
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask StudyBuddy anything about Class 10 Board prep..."
                    rows={2}
                    disabled={isGenerating}
                    className="w-full p-3 bg-transparent text-xs text-[#F5F5F2] placeholder-[#74747D] resize-none focus:outline-none"
                  />
                  <div className="p-2">
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputQuery.trim() || isGenerating}
                      className="p-2 bg-[#BFA7FF] hover:bg-[#a98be8] disabled:bg-[#343541] text-[#15161F] disabled:text-[#A7A7AD] rounded-lg transition-colors flex items-center justify-center font-bold"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#A7A7AD] font-mono px-1">
                  <span>Press Shift + Enter for new line</span>
                  <span>Context Active: {profile?.boardName || 'CBSE'} Class 10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Student Context Panel */}
          {showContextPanel && (
            <aside className="w-80 bg-[#1B1C26] border-l border-[#343541] flex flex-col h-full overflow-y-auto p-4 space-y-4 shrink-0 hidden md:flex">
              <div className="flex items-center justify-between pb-2 border-b border-[#343541]">
                <span className="text-xs font-mono font-bold text-[#F5F5F2] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#BFA7FF]" /> Student Context
                </span>
                <span className="text-[10px] font-mono text-[#D8FF9A] bg-[#D8FF9A]/10 px-1.5 py-0.5 rounded border border-[#D8FF9A]/20">
                  Real-time
                </span>
              </div>

              {/* Student Overview Card */}
              <div className="p-3 bg-[#20212C] rounded-xl border border-[#343541] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5F5F2]">{profile?.fullName || 'Student'}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                    {profile?.boardName || 'CBSE'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A7A7AD]">Target Score:</span>
                  <span className="font-mono font-bold text-[#D8FF9A]">{profile?.targetPercentage || 95}%</span>
                </div>
              </div>

              {/* Overall Progress */}
              <Card className="p-3 bg-[#15161F] border-[#343541] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A7A7AD] font-medium">Syllabus Complete:</span>
                  <span className="font-mono font-bold text-[#BFA7FF]">{overallProgress}%</span>
                </div>
                <ProgressBar value={overallProgress} color="lavender" size="sm" />
              </Card>

              {/* Weakest Subject */}
              <div className="p-3 bg-[#15161F] border border-[#343541] rounded-xl space-y-1.5">
                <div className="text-[10px] font-mono text-[#A7A7AD] uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#FFC700]" /> Focus Area (Weakest)
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5F5F2]">
                    {weakestSubject?.subjectName || 'None'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#FF8F9A]">
                    {weakestSubject?.progressPercentage || 0}%
                  </span>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#15161F] border border-[#343541] rounded-xl space-y-1">
                  <div className="text-[10px] font-mono text-[#A7A7AD] flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#BFA7FF]" /> Revision
                  </div>
                  <div className="font-mono font-bold text-[#F5F5F2]">
                    {revisionRecommendations.length} Chapters
                  </div>
                </div>

                <div className="p-2.5 bg-[#15161F] border border-[#343541] rounded-xl space-y-1">
                  <div className="text-[10px] font-mono text-[#A7A7AD] flex items-center gap-1">
                    <CircleHelp className="w-3 h-3 text-[#FF8F9A]" /> Open Doubts
                  </div>
                  <div className="font-mono font-bold text-[#FF8F9A]">
                    {pendingDoubtsCount} Pending
                  </div>
                </div>

                <div className="p-2.5 bg-[#15161F] border border-[#343541] rounded-xl space-y-1">
                  <div className="text-[10px] font-mono text-[#A7A7AD] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D8FF9A]" /> Today Study
                  </div>
                  <div className="font-mono font-bold text-[#D8FF9A]">
                    {todayStudyMinutes} Mins
                  </div>
                </div>

                <div className="p-2.5 bg-[#15161F] border border-[#343541] rounded-xl space-y-1">
                  <div className="text-[10px] font-mono text-[#A7A7AD] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#BFA7FF]" /> Pending Tasks
                  </div>
                  <div className="font-mono font-bold text-[#F5F5F2]">
                    {todayTasks.filter((t) => !t.completed).length} Tasks
                  </div>
                </div>
              </div>

              {/* AI Recommendation Context Box */}
              <div className="p-3 bg-gradient-to-br from-[#BFA7FF]/10 to-[#1B1C26] border border-[#BFA7FF]/30 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#BFA7FF]">
                  <Sparkles className="w-3.5 h-3.5" /> Context Tip
                </div>
                <p className="text-[11px] text-[#A7A7AD] leading-relaxed">
                  StudyBuddy uses your live progress, doubts, and goals to build custom study plans and exam strategies.
                </p>
                <button
                  onClick={() =>
                    handleSendMessage(
                      'Give me a personalized 30-minute revision strategy for my board exam preparation.',
                      'study_plan'
                    )
                  }
                  className="w-full py-1.5 bg-[#BFA7FF]/20 hover:bg-[#BFA7FF]/30 border border-[#BFA7FF]/40 text-[#BFA7FF] rounded-lg text-xs font-mono font-semibold transition-colors"
                >
                  Generate Strategy Now
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};
