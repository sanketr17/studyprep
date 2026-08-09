import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, CheckCircle2, Clock, Calculator, ShieldCheck, Zap } from 'lucide-react';

export const Hero3DVisual: React.FC = () => {
  return (
    <div className="relative w-full h-[460px] md:h-[520px] flex items-center justify-center p-4 select-none">
      {/* Technical Grid Pattern Background */}
      <div className="absolute inset-0 bg-tech-grid opacity-60 rounded-2xl border border-[#343541]/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#15161F] via-transparent to-[#1B1C26]/80" />
      </div>

      {/* Decorative Technical Coordinate Corner Labels */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-[#74747D] tracking-widest uppercase flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#BFA7FF]" /> SYS_GRID // 10TH_BOARD_HQ
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-[#D8FF9A] tracking-widest uppercase">
        +95% TARGET_METRICS
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-[#74747D]">
        LAT: 28.61° N | LON: 77.20° E
      </div>

      {/* Central 3D Floating Composition Group */}
      <div className="relative w-full max-w-md h-full flex items-center justify-center">

        {/* Outer Glow Ring */}
        <div className="absolute w-72 h-72 rounded-full bg-[#BFA7FF]/10 blur-3xl animate-pulse-glow" />
        <div className="absolute w-56 h-56 rounded-full bg-[#D8FF9A]/10 blur-2xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

        {/* 1. Main Floating Digital Notebook (Card 1 - Dark Surface) */}
        <motion.div
          className="absolute w-72 p-5 bg-[#1B1C26]/90 backdrop-blur-md rounded-xl border border-[#343541] shadow-2xl shadow-black/80 z-20"
          initial={{ y: 20, rotate: -4, opacity: 0 }}
          animate={{ y: [0, -12, 0], rotate: [-4, -2, -4], opacity: 1 }}
          transition={{
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.8 },
          }}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#343541]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#BFA7FF]/20 flex items-center justify-center text-[#BFA7FF]">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs tracking-wider text-[#F5F5F2] uppercase">
                Syllabus Command
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D8FF9A]/20 text-[#D8FF9A] border border-[#D8FF9A]/30">
              68% REVISED
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-[#A7A7AD]">
            <div className="flex justify-between items-center bg-[#20212C] p-2 rounded border border-[#343541]/80">
              <span className="text-[#F5F5F2] font-medium">Mathematics</span>
              <span className="text-[#D8FF9A] font-mono font-bold">82%</span>
            </div>
            <div className="w-full bg-[#15161F] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#D8FF9A] h-full w-[82%]" />
            </div>

            <div className="flex justify-between items-center bg-[#20212C] p-2 rounded border border-[#343541]/80 mt-1">
              <span className="text-[#F5F5F2] font-medium">Science</span>
              <span className="text-[#BFA7FF] font-mono font-bold">71%</span>
            </div>
            <div className="w-full bg-[#15161F] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#BFA7FF] h-full w-[71%]" />
            </div>
          </div>
        </motion.div>

        {/* 2. Floating 3D Target Percentage Card (Top Right) */}
        <motion.div
          className="absolute -top-2 right-2 md:-right-6 w-44 p-3.5 bg-[#20212C]/95 backdrop-blur-md rounded-xl border border-[#343541] shadow-xl z-30"
          initial={{ y: -20, rotate: 6, opacity: 0 }}
          animate={{ y: [0, 10, 0], rotate: [6, 8, 6], opacity: 1 }}
          transition={{
            y: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            opacity: { duration: 0.8 },
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#A7A7AD] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D8FF9A]" />
            BOARD GOAL
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[#F5F5F2] tracking-tight">95</span>
            <span className="text-lg font-bold text-[#D8FF9A] font-mono">%</span>
          </div>
          <p className="text-[10px] text-[#A7A7AD] mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#BFA7FF]" /> On Track for CBSE Distinction
          </p>
        </motion.div>

        {/* 3. Floating 3D Circular Timer Card (Bottom Left) */}
        <motion.div
          className="absolute -bottom-4 -left-2 md:-left-8 w-48 p-3.5 bg-[#1B1C26]/95 backdrop-blur-md rounded-xl border border-[#343541] shadow-xl z-30"
          initial={{ y: 20, rotate: -6, opacity: 0 }}
          animate={{ y: [0, -14, 0], rotate: [-6, -4, -6], opacity: 1 }}
          transition={{
            y: { duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            rotate: { duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            opacity: { duration: 0.8 },
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-[#A7A7AD] uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#BFA7FF]" /> FOCUS SESSION
            </span>
            <span className="w-2 h-2 rounded-full bg-[#D8FF9A] animate-ping" />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full border-2 border-[#BFA7FF] flex items-center justify-center font-mono font-bold text-xs text-[#F5F5F2] bg-[#15161F]">
              24:37
            </div>
            <div>
              <p className="text-xs font-semibold text-[#F5F5F2]">Pomodoro</p>
              <p className="text-[10px] text-[#D8FF9A] font-medium">+25m Tracked</p>
            </div>
          </div>
        </motion.div>

        {/* 4. Floating Formula Pill / Geometric Badge */}
        <motion.div
          className="absolute bottom-16 right-0 md:-right-8 p-2.5 bg-[#20212C] rounded-lg border border-[#343541] shadow-lg z-10 flex items-center gap-2"
          animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          <div className="p-1 rounded bg-[#BFA7FF]/20 text-[#BFA7FF]">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-mono text-[#F5F5F2]">ax² + bx + c = 0</span>
        </motion.div>

        {/* Decorative Wireframe Spheres & Plus Marks */}
        <motion.div
          className="absolute -top-6 left-12 w-6 h-6 rounded-full border border-[#D8FF9A]/40 border-dashed"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/2 -right-10 text-[#343541] font-mono text-xl select-none"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          +
        </motion.div>
        <motion.div
          className="absolute bottom-12 left-1/3 text-[#343541] font-mono text-lg select-none"
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          ×
        </motion.div>

      </div>
    </div>
  );
};
