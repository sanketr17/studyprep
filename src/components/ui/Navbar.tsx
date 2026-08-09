import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full bg-[#15161F]/90 backdrop-blur-md border-b border-[#343541]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#BFA7FF] text-[#15161F] flex items-center justify-center font-bold font-mono transition-transform group-hover:scale-105">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-[#F5F5F2]">StudyPrep</span>
            <span className="text-[10px] text-[#D8FF9A] font-mono block -mt-1 font-semibold">CLASS 10 BOARDS</span>
          </div>
        </Link>

        {/* CENTER: Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-[#A7A7AD]">
          <a href="#features" className="hover:text-[#F5F5F2] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#F5F5F2] transition-colors">How It Works</a>
          <a href="#syllabus" className="hover:text-[#F5F5F2] transition-colors">Syllabus</a>
          <a href="#analytics" className="hover:text-[#F5F5F2] transition-colors">Analytics</a>
        </div>

        {/* RIGHT: Auth CTAs */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <Button
              variant="lime"
              size="sm"
              icon={<LayoutDashboard className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login" className="text-xs font-mono uppercase tracking-wider text-[#A7A7AD] hover:text-[#F5F5F2] px-3 py-2 transition-colors">
                Log In
              </Link>
              <Button
                variant="primary"
                size="sm"
                icon={<LogIn className="w-4 h-4" />}
                onClick={() => navigate('/register')}
              >
                Start Preparing
              </Button>
            </>
          )}
        </div>

      </div>
    </motion.nav>
  );
};

