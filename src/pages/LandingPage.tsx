import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  RotateCcw, 
  FileText, 
  Timer, 
  BarChart3, 
  Zap, 
  ShieldCheck,
  Brain
} from 'lucide-react';
import { Navbar } from '../components/ui/Navbar';
import { Hero3DVisual } from '../components/ui/Hero3DVisual';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/ui/PageTransition';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loginDemo } = useAuth();

  const handleStart = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleDemo = async () => {
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <PageTransition className="min-h-screen bg-[#15161F] text-[#F5F5F2] flex flex-col selection:bg-[#BFA7FF] selection:text-[#15161F]">
      <Navbar />

      {/* HERO SECTION - Editorial Split Layout */}
      <section className="relative overflow-hidden pt-8 pb-16 md:py-20 border-b border-[#343541]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT SIDE - Large Editorial Typography */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20212C] border border-[#343541] text-xs font-mono text-[#D8FF9A]">
                <Sparkles className="w-3.5 h-3.5 text-[#BFA7FF]" />
                <span>Class 10 Board Exam Command Center</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F5F2] leading-[1.1]">
                Prepare smarter.{' '}
                <span className="font-editorial text-5xl sm:text-6xl lg:text-7xl text-[#BFA7FF] font-normal block mt-1">
                  Own your boards.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#A7A7AD] leading-relaxed max-w-xl">
                Track your syllabus, organize formulas, manage doubts, practice previous year questions, and know exactly what to revise next with intelligent recommendations.
              </p>


              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleStart}
                >
                  Start Preparing Now
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Zap className="w-4 h-4 text-[#D8FF9A]" />}
                  onClick={handleDemo}
                >
                  Quick Demo Login
                </Button>
              </div>

              {/* Feature Pills */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-[#74747D]">
                <span className="flex items-center gap-1.5 text-[#A7A7AD]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8FF9A]" /> CBSE &amp; State Boards
                </span>
                <span className="flex items-center gap-1.5 text-[#A7A7AD]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8FF9A]" /> Smart Revision Engine
                </span>
                <span className="flex items-center gap-1.5 text-[#A7A7AD]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8FF9A]" /> 100% Private &amp; Secure
                </span>
              </div>

            </motion.div>

            {/* RIGHT SIDE - Experimental 3D Educational Composition */}
            <div className="lg:col-span-6">
              <Hero3DVisual />
            </div>

          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / MINIMAL STATISTICS STRIP */}
      <section className="bg-[#1B1C26] border-b border-[#343541] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#343541]">
            
            <div className="pt-2 md:pt-0 md:px-6 text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F2] font-mono">10K+</div>
              <div className="text-xs font-mono text-[#A7A7AD] uppercase tracking-wider mt-1">Study Sessions</div>
            </div>

            <div className="pt-2 md:pt-0 md:px-6 text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#D8FF9A] font-mono">95%</div>
              <div className="text-xs font-mono text-[#A7A7AD] uppercase tracking-wider mt-1">Target Tracking</div>
            </div>

            <div className="pt-2 md:pt-0 md:px-6 text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#BFA7FF] font-mono">25K+</div>
              <div className="text-xs font-mono text-[#A7A7AD] uppercase tracking-wider mt-1">Chapters Completed</div>
            </div>

            <div className="pt-2 md:pt-0 md:px-6 text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F2] font-mono">500K+</div>
              <div className="text-xs font-mono text-[#A7A7AD] uppercase tracking-wider mt-1">Minutes Studied</div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE PRODUCT MODULES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-mono text-[#D8FF9A] uppercase tracking-widest">
            // Core Architecture
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F2]">
            Everything you need for Class 10 success.
          </h3>
          <p className="text-sm text-[#A7A7AD]">
            Replaces scattered notebooks and messy PDFs with one cohesive study workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-[#1B1C26] p-6 rounded-xl border border-[#343541] hover:border-[#5A5B68] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#BFA7FF]/20 text-[#BFA7FF] flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#F5F5F2] mb-2">Syllabus &amp; Chapter Tracker</h4>
            <p className="text-xs text-[#A7A7AD] leading-relaxed">
              Preloaded CBSE &amp; State Board syllabus for Maths, Science, Social Science, English, and Hindi. Track status from Video Watched to Fully Revised.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#1B1C26] p-6 rounded-xl border border-[#343541] hover:border-[#5A5B68] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#D8FF9A]/20 text-[#D8FF9A] flex items-center justify-center mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#F5F5F2] mb-2">Smart Revision Engine</h4>
            <p className="text-xs text-[#A7A7AD] leading-relaxed">
              Automated rule-based alerts identify chapters needing revision based on elapsed days, status, and target board percentage.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#1B1C26] p-6 rounded-xl border border-[#343541] hover:border-[#5A5B68] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#BFA7FF]/20 text-[#BFA7FF] flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#F5F5F2] mb-2">Notes &amp; Formula Vault</h4>
            <p className="text-xs text-[#A7A7AD] leading-relaxed">
              Personal digital vault for key formulas, definitions, chemical reactions, and quick revision points tagged by subject and chapter.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#1B1C26] p-6 rounded-xl border border-[#343541] hover:border-[#5A5B68] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#D8FF9A]/20 text-[#D8FF9A] flex items-center justify-center mb-4">
              <Timer className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#F5F5F2] mb-2">Pomodoro Focus Timer</h4>
            <p className="text-xs text-[#A7A7AD] leading-relaxed">
              25-minute calm focus timer that automatically logs completed sessions, calculates total daily study hours, and tracks streaks.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#1B1C26] p-6 rounded-xl border border-[#343541] hover:border-[#5A5B68] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#BFA7FF]/20 text-[#BFA7FF] flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#F5F5F2] mb-2">PYQ &amp; Doubt Tracker</h4>
            <p className="text-xs text-[#A7A7AD] leading-relaxed">
              Organize 1, 3, and 5-mark previous year questions. Record academic doubts, assign priorities, and track resolutions.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#1B1C26] p-6 rounded-xl border border-[#343541] hover:border-[#5A5B68] transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#D8FF9A]/20 text-[#D8FF9A] flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#F5F5F2] mb-2">Preparation Analytics</h4>
            <p className="text-xs text-[#A7A7AD] leading-relaxed">
              Visual Recharts dashboards displaying subject completion curves, weekly study time trends, and task completion percentages.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 bg-[#1B1C26]/50 border-t border-b border-[#343541]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-mono text-[#BFA7FF] uppercase tracking-wider">Workflow</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F2] mt-1">
              How StudyPrep guides your preparation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#15161F] border border-[#343541] rounded-xl relative">
              <span className="font-mono text-xs font-bold text-[#D8FF9A] bg-[#D8FF9A]/10 px-2 py-1 rounded border border-[#D8FF9A]/30">01</span>
              <h4 className="text-base font-bold text-[#F5F5F2] mt-4 mb-2">Set Goal &amp; Track Status</h4>
              <p className="text-xs text-[#A7A7AD]">Set target score (e.g. 95%) and update chapter status as you watch videos, read NCERT, and solve questions.</p>
            </div>

            <div className="p-6 bg-[#15161F] border border-[#343541] rounded-xl relative">
              <span className="font-mono text-xs font-bold text-[#BFA7FF] bg-[#BFA7FF]/10 px-2 py-1 rounded border border-[#BFA7FF]/30">02</span>
              <h4 className="text-base font-bold text-[#F5F5F2] mt-4 mb-2">Store Vault Notes &amp; PYQs</h4>
              <p className="text-xs text-[#A7A7AD]">Keep key formulas, definitions, repeated board questions, and pending doubts in organized workspaces.</p>
            </div>

            <div className="p-6 bg-[#15161F] border border-[#343541] rounded-xl relative">
              <span className="font-mono text-xs font-bold text-[#D8FF9A] bg-[#D8FF9A]/10 px-2 py-1 rounded border border-[#D8FF9A]/30">03</span>
              <h4 className="text-base font-bold text-[#F5F5F2] mt-4 mb-2">Follow Smart Revision</h4>
              <p className="text-xs text-[#A7A7AD]">The system flags weak or overdue chapters so you always know what to study today to max out exam score.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4">
        <div className="p-10 rounded-2xl bg-[#1B1C26] border border-[#343541] bg-tech-grid relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F5F2]">
              Ready to own your Class 10 board exams?
            </h2>
            <p className="text-sm text-[#A7A7AD] max-w-lg mx-auto">
              Join thousands of students organizing their board preparation with total clarity and zero exam stress.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" onClick={handleStart}>
                Create Free Student Account
              </Button>
              <Button variant="lime" size="lg" onClick={handleDemo}>
                Try Demo Workspace
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#343541] py-8 text-center text-xs text-[#74747D] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#F5F5F2]">
            <BookOpen className="w-4 h-4 text-[#BFA7FF]" />
            <span className="font-bold">10th Class Board Prep Tracker &amp; Smart Study Hub</span>
          </div>
          <div>
            Prepare smarter. Own your boards. © 2026 StudyPrep
          </div>
        </div>
      </footer>

    </PageTransition>
  );
};
