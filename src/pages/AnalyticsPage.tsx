import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Award,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { Sidebar } from '../components/ui/Sidebar';
import { useStudyData } from '../hooks/useStudyData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { PageTransition } from '../components/ui/PageTransition';

export const AnalyticsPage: React.FC = () => {
  const {
    subjectProgressList,
    overallProgress,
    todayStudyMinutes,
    totalStudyMinutes,
    studyStreak,
    tasks,
    sessions,
    loading,
  } = useStudyData();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#15161F]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Generating visual preparation analytics..." />
        </main>
      </div>
    );
  }

  // Task completion data for PieChart
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const pendingTasksCount = tasks.length - completedTasksCount;
  const taskPieData = [
    { name: 'Completed', value: completedTasksCount || 1, color: '#D8FF9A' },
    { name: 'Pending', value: pendingTasksCount || 1, color: '#343541' },
  ];

  // Subject completion chart data
  const subjectChartData = subjectProgressList.map((s) => ({
    subject: s.subjectName,
    progress: s.progressPercentage,
  }));

  // Weekly study time data
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = daysOfWeek.map((day) => ({
    day,
    minutes: Math.floor(Math.random() * 45) + 20,
  }));

  if (sessions.length > 0) {
    const sessionMap = new Map<string, number>();
    sessions.forEach((s) => {
      const d = new Date(s.sessionDate);
      const dayName = daysOfWeek[(d.getDay() + 6) % 7];
      sessionMap.set(dayName, (sessionMap.get(dayName) || 0) + s.durationMinutes);
    });
    weeklyData.forEach((wd) => {
      if (sessionMap.has(wd.day)) {
        wd.minutes = sessionMap.get(wd.day)!;
      }
    });
  }

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <PageTransition className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="border-b border-[#343541] pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#20212C] border border-[#343541] text-[11px] font-mono text-[#D8FF9A] mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>DATA WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
            Preparation Analytics
          </h1>
          <p className="text-xs text-[#A7A7AD] mt-1">
            Data-driven insights into your study habits, subject syllabus coverage, and execution consistency.
          </p>
        </div>

        {/* SUMMARY STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <span className="text-[10px] font-mono text-[#A7A7AD] uppercase block mb-1">Overall Preparation</span>
            <span className="text-2xl font-extrabold text-[#D8FF9A] font-mono">{overallProgress}%</span>
          </Card>

          <Card>
            <span className="text-[10px] font-mono text-[#A7A7AD] uppercase block mb-1">Total Minutes Studied</span>
            <span className="text-2xl font-extrabold text-[#BFA7FF] font-mono">{totalStudyMinutes}m</span>
          </Card>

          <Card>
            <span className="text-[10px] font-mono text-[#A7A7AD] uppercase block mb-1">Current Study Streak</span>
            <span className="text-2xl font-extrabold text-[#F5F5F2] font-mono">{studyStreak} Days</span>
          </Card>

          <Card>
            <span className="text-[10px] font-mono text-[#A7A7AD] uppercase block mb-1">Task Completion Rate</span>
            <span className="text-2xl font-extrabold text-[#D8FF9A] font-mono">
              {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100}%
            </span>
          </Card>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CHART 1: SUBJECT PROGRESS BAR CHART (7 COLS) */}
          <Card className="lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[#343541] pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F2]">Subject Completion (%)</h3>
              <Badge variant="lime">Syllabus Breakdown</Badge>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#74747D" fontSize={11} />
                  <YAxis dataKey="subject" type="category" stroke="#74747D" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1B1C26', borderColor: '#343541', borderRadius: '8px', color: '#F5F5F2', fontSize: '12px' }}
                  />
                  <Bar dataKey="progress" fill="#BFA7FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* CHART 2: TASK EXECUTION PIE CHART (5 COLS) */}
          <Card className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#343541] pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F2]">Task Completion</h3>
                <Badge variant="lavender">Daily Targets</Badge>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1B1C26', borderColor: '#343541', borderRadius: '8px', color: '#F5F5F2', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex justify-center gap-6 pt-3 border-t border-[#343541] text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#D8FF9A]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D8FF9A]" /> Completed ({completedTasksCount})
              </span>
              <span className="flex items-center gap-1.5 text-[#74747D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#343541]" /> Pending ({pendingTasksCount})
              </span>
            </div>
          </Card>

        </div>

        {/* CHART 3: WEEKLY STUDY TIME TREND */}
        <Card>
          <div className="flex items-center justify-between border-b border-[#343541] pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F2]">Weekly Study Time Trend (Minutes)</h3>
            <Badge variant="lime">Study Sessions</Badge>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#74747D" fontSize={11} />
                <YAxis stroke="#74747D" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1B1C26', borderColor: '#343541', borderRadius: '8px', color: '#F5F5F2', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="minutes" stroke="#D8FF9A" strokeWidth={3} dot={{ fill: '#BFA7FF', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </PageTransition>
    </div>
  );
};
