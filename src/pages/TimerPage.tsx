import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Award,
  Sparkles 
} from 'lucide-react';
import { Sidebar } from '../components/ui/Sidebar';
import { useStudyData } from '../hooks/useStudyData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/ui/PageTransition';
import { saveStudySession } from '../services/studySessionService';
import { useAuth } from '../context/AuthContext';

export const TimerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { todayStudyMinutes, totalStudyMinutes, studyStreak, refetchData } = useStudyData();

  const [selectedDuration, setSelectedDuration] = useState<number>(25); // in minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    setTimeLeft(selectedDuration * 60);
    setIsRunning(false);
    setIsCompleted(false);
    setSavedSuccess(false);
  }, [selectedDuration]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    setIsCompleted(true);

    if (currentUser) {
      try {
        await saveStudySession(currentUser.uid, selectedDuration);
        setSavedSuccess(true);
        refetchData();
      } catch (err) {
        console.error('Error saving study session:', err);
      }
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setIsCompleted(false);
    setSavedSuccess(false);
  };

  // Circular SVG progress math
  const totalSeconds = selectedDuration * 60;
  const progressFraction = (totalSeconds - timeLeft) / totalSeconds;
  const circumference = 2 * Math.PI * 120; // radius = 120
  const strokeDashoffset = circumference * (1 - progressFraction);

  const minutesDisplay = Math.floor(timeLeft / 60);
  const secondsDisplay = timeLeft % 60;
  const formattedTime = `${minutesDisplay < 10 ? '0' : ''}${minutesDisplay}:${secondsDisplay < 10 ? '0' : ''}${secondsDisplay}`;

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <PageTransition className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-8 flex flex-col justify-between">
        
        {/* HEADER */}
        <div className="border-b border-[#343541] pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#20212C] border border-[#343541] text-[11px] font-mono text-[#BFA7FF] mb-2">
            <Timer className="w-3.5 h-3.5" />
            <span>FOCUSED STUDY WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
            Pomodoro Study Timer
          </h1>
          <p className="text-xs text-[#A7A7AD] mt-1">
            Build intense focus with zero distractions. Completed study sessions automatically log to your board prep analytics.
          </p>
        </div>

        {/* CENTERPIECE TIMER CIRCLE */}
        <div className="flex flex-col items-center justify-center my-6">
          
          {/* Duration Selector Pills */}
          <div className="flex items-center gap-2 mb-8 bg-[#1B1C26] p-1.5 rounded-xl border border-[#343541]">
            {[15, 25, 45, 60].map((dur) => (
              <button
                key={dur}
                onClick={() => setSelectedDuration(dur)}
                disabled={isRunning}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  selectedDuration === dur
                    ? 'bg-[#BFA7FF] text-[#15161F] font-bold'
                    : 'text-[#A7A7AD] hover:text-[#F5F5F2]'
                }`}
              >
                {dur} Min
              </button>
            ))}
          </div>

          {/* SVG Circular Progress Ring */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="50%"
                cy="50%"
                r="120"
                className="stroke-[#20212C]"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Circle */}
              <circle
                cx="50%"
                cy="50%"
                r="120"
                className={`transition-all duration-1000 ${
                  isCompleted ? 'stroke-[#D8FF9A]' : 'stroke-[#BFA7FF]'
                }`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Time Text Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tighter text-[#F5F5F2]">
                {formattedTime}
              </span>
              <span className="text-xs font-mono text-[#D8FF9A] uppercase tracking-widest mt-2">
                {isCompleted ? 'SESSION COMPLETE' : isRunning ? 'FOCUS SESSION' : 'IDLE'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-8">
            {!isRunning ? (
              <Button
                variant="lime"
                size="lg"
                icon={<Play className="w-5 h-5 fill-current" />}
                onClick={handleStart}
              >
                {timeLeft < totalSeconds ? 'Resume Session' : 'Start Focus Session'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={<Pause className="w-5 h-5 fill-current" />}
                onClick={handlePause}
              >
                Pause Session
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>

          {/* Success Banner */}
          {savedSuccess && (
            <div className="mt-6 p-3 px-6 bg-[#D8FF9A]/15 border border-[#D8FF9A]/40 rounded-xl text-[#D8FF9A] text-xs font-mono flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>+{selectedDuration} Minutes saved to your board preparation database!</span>
            </div>
          )}

        </div>

        {/* BOTTOM METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#343541] pt-6">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-[#20212C] text-[#BFA7FF] rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#A7A7AD] uppercase block">Today's Focus</span>
              <span className="text-lg font-bold text-[#F5F5F2] font-mono">{todayStudyMinutes} Minutes</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="p-3 bg-[#20212C] text-[#D8FF9A] rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#A7A7AD] uppercase block">Current Streak</span>
              <span className="text-lg font-bold text-[#D8FF9A] font-mono">{studyStreak} Days</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="p-3 bg-[#20212C] text-[#BFA7FF] rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#A7A7AD] uppercase block">Total Logged Time</span>
              <span className="text-lg font-bold text-[#F5F5F2] font-mono">{totalStudyMinutes} Minutes</span>
            </div>
          </Card>
        </div>

      </PageTransition>
    </div>
  );
};
