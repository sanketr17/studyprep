import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Target, 
  Flame, 
  Clock, 
  HelpCircle, 
  BarChart3, 
  CheckSquare, 
  RotateCcw, 
  Timer, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useStudyData } from '../hooks/useStudyData';
import { Sidebar } from '../components/ui/Sidebar';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { PageTransition } from '../components/ui/PageTransition';
import { toggleTaskCompletion } from '../services/taskService';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const {
    subjects,
    chapters,
    subjectProgressList,
    overallProgress,
    revisionRecommendations,
    pendingDoubtsCount,
    todayStudyMinutes,
    studyStreak,
    todayTasks,
    sessions,
    loading,
    refetchData,
  } = useStudyData();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#15161F]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Initializing your board exam command center..." />
        </main>
      </div>
    );
  }

  // Format today study time
  const hours = Math.floor(todayStudyMinutes / 60);
  const mins = todayStudyMinutes % 60;
  const formattedTodayTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Weekly study time chart data
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = daysOfWeek.map((day) => ({
    day,
    minutes: Math.floor(Math.random() * 45) + 15,
  }));

  if (sessions.length > 0) {
    const sessionMap = new Map<string, number>();
    sessions.forEach((s) => {
      const d = new Date(s.sessionDate);
      const dayName = daysOfWeek[(d.getDay() + 6) % 7];
      sessionMap.set(dayName, (sessionMap.get(dayName) || 0) + s.durationMinutes);
    });

    chartData.forEach((cd) => {
      if (sessionMap.has(cd.day)) {
        cd.minutes = sessionMap.get(cd.day)!;
      }
    });
  }

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    await toggleTaskCompletion('', taskId, !currentStatus);
    refetchData();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <PageTransition className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* HEADER GREETING */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343541] pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
                Good morning, {profile?.fullName || 'Student'}.
              </h1>
              <p className="text-xs sm:text-sm text-[#A7A7AD] mt-1">
                Let's get your board preparation moving.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="lime"
                size="sm"
                icon={<Timer className="w-4 h-4" />}
                onClick={() => navigate('/timer')}
              >
                Start Focus Timer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<BookOpen className="w-4 h-4" />}
                onClick={() => navigate('/syllabus')}
              >
                Syllabus
              </Button>
            </div>
          </motion.div>

          {/* TOP METRICS ROW */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              label="Target Score"
              value={`${profile?.targetPercentage || 95}%`}
              subtext={profile?.boardName || 'CBSE Board'}
              icon={<Target className="w-4 h-4 text-[#D8FF9A]" />}
              accentColor="lime"
            />

            <StatCard
              label="Overall Syllabus"
              value={`${overallProgress}%`}
              subtext="Calculated Completion"
              icon={<BarChart3 className="w-4 h-4 text-[#BFA7FF]" />}
              accentColor="lavender"
            />

            <StatCard
              label="Study Streak"
              value={`${studyStreak} Days`}
              subtext="Consecutive Focus"
              icon={<Flame className="w-4 h-4 text-[#FFD98A]" />}
              accentColor="white"
            />

            <StatCard
              label="Today's Study"
              value={formattedTodayTime}
              subtext="Pomodoro Sessions"
              icon={<Clock className="w-4 h-4 text-[#BFA7FF]" />}
              accentColor="white"
            />

            <StatCard
              label="Pending Doubts"
              value={pendingDoubtsCount}
              subtext="Academic Doubts"
              icon={<HelpCircle className="w-4 h-4 text-[#FF8F9A]" />}
              accentColor="white"
            />
          </motion.div>

          {/* TODAY'S FOCUS & REVISION NEEDED GRID */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* TODAY'S FOCUS (7 Cols) */}
            <Card className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#343541] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#D8FF9A]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F2]">Today's Focus</h3>
                  </div>
                  <button
                    onClick={() => navigate('/planner')}
                    className="text-xs text-[#BFA7FF] font-mono hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Manage Planner <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {todayTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#A7A7AD]">
                    No study targets set for today.
                    <div className="mt-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate('/planner')}>
                        + Add Today's Target
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {todayTasks.slice(0, 4).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskToggle(task.id, task.completed)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                          task.completed
                            ? 'bg-[#15161F]/50 border-[#343541]/50 text-[#74747D] line-through'
                            : 'bg-[#20212C] border-[#343541] text-[#F5F5F2] hover:border-[#5A5B68]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-[#343541] text-[#D8FF9A] focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs font-medium">{task.taskDescription}</span>
                        </div>
                        {task.completed && <Badge variant="lime">Done</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#343541] flex items-center justify-between text-xs text-[#A7A7AD]">
                <span>Quick Actions:</span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => navigate('/timer')}>
                    Focus Timer
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/notes')}>
                    Vault Notes
                  </Button>
                </div>
              </div>
            </Card>

            {/* REVISION NEEDED ALERTS (5 Cols) */}
            <Card className="lg:col-span-5 flex flex-col justify-between border-l-2 border-l-[#D8FF9A]">
              <div>
                <div className="flex items-center justify-between border-b border-[#343541] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#D8FF9A]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F2]">Revision Needed</h3>
                  </div>
                  <Badge variant="lime">Smart Engine</Badge>
                </div>

                {revisionRecommendations.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#A7A7AD]">
                    All prepared chapters are up to date! Great consistency.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revisionRecommendations.slice(0, 2).map((rec) => (
                      <div key={rec.chapterId} className="p-3.5 bg-[#20212C] rounded-lg border border-[#343541]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#F5F5F2]">{rec.chapterName}</span>
                          <Badge variant={rec.priority === 'HIGH' ? 'error' : 'warning'}>
                            {rec.daysSinceRevision}d ago
                          </Badge>
                        </div>
                        <div className="text-[11px] font-mono text-[#D8FF9A] mb-1">{rec.subjectName} • {rec.status}</div>
                        <p className="text-[11px] text-[#A7A7AD] leading-snug">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#343541]">
                <Button
                  variant="lime"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/syllabus')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Review Full Syllabus Schedule
                </Button>
              </div>
            </Card>

          </motion.div>

          {/* SUBJECT PROGRESS SECTION */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between border-b border-[#343541] pb-3 mb-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F2]">Subject Completion Status</h3>
                <button
                  onClick={() => navigate('/syllabus')}
                  className="text-xs text-[#BFA7FF] font-mono hover:underline cursor-pointer"
                >
                  Open Workspace
                </button>
              </div>

              <div className="space-y-4">
                {subjectProgressList.map((sp) => (
                  <div key={sp.subjectId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#F5F5F2]">{sp.subjectName}</span>
                      <div className="font-mono text-xs flex items-center gap-2">
                        <span className="text-[#A7A7AD] text-[11px]">{sp.completedChapters}/{sp.totalChapters} Ch.</span>
                        <span className={sp.progressPercentage >= 75 ? 'text-[#D8FF9A] font-bold' : 'text-[#BFA7FF] font-bold'}>
                          {sp.progressPercentage}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar percentage={sp.progressPercentage} color="auto" height="sm" />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* WEEKLY STUDY ACTIVITY CHART */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between border-b border-[#343541] pb-3 mb-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F2]">Weekly Study Activity</h3>
                  <p className="text-xs text-[#A7A7AD]">Total focus minutes logged per day</p>
                </div>
                <Badge variant="lavender">Minutes / Day</Badge>
              </div>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#74747D" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#74747D" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1B1C26', borderColor: '#343541', borderRadius: '8px', color: '#F5F5F2', fontSize: '12px' }}
                      cursor={{ fill: 'rgba(52, 53, 65, 0.4)' }}
                    />
                    <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === new Date().getDay() - 1 ? '#D8FF9A' : '#BFA7FF'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </PageTransition>
    </div>
  );
};

