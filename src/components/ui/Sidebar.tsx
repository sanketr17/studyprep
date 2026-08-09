import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  FileQuestion, 
  CircleHelp, 
  CheckSquare, 
  Timer, 
  BarChart3, 
  User, 
  LogOut,
  Menu,
  X,
  Target,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Syllabus Tracker', path: '/syllabus', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Notes & Formulas', path: '/notes', icon: <FileText className="w-4 h-4" /> },
    { label: 'PYQ Manager', path: '/pyqs', icon: <FileQuestion className="w-4 h-4" /> },
    { label: 'Doubt Tracker', path: '/doubts', icon: <CircleHelp className="w-4 h-4" /> },
    { label: 'Daily Planner', path: '/planner', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'Study Timer', path: '/timer', icon: <Timer className="w-4 h-4" /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: '✦ StudyBuddy AI', path: '/studybuddy', icon: <Sparkles className="w-4 h-4 text-[#BFA7FF]" /> },
    { label: 'Profile & Goal', path: '/profile', icon: <User className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#15161F] border-b border-[#343541] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#BFA7FF] text-[#15161F] flex items-center justify-center font-bold text-xs font-mono">
            10
          </div>
          <span className="font-extrabold text-sm text-[#F5F5F2]">StudyPrep</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-[#A7A7AD] hover:text-[#F5F5F2] hover:bg-[#20212C] transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-[#15161F]/80 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#1B1C26] border-r border-[#343541] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:static'
        }`}
      >
        {/* Top Logo Section */}
        <div>
          <div className="p-5 border-b border-[#343541] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#BFA7FF] text-[#15161F] flex items-center justify-center font-bold font-mono text-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#F5F5F2] block">
                StudyPrep Hub
              </span>
              <span className="text-[10px] text-[#D8FF9A] font-mono tracking-wider uppercase block">
                Command Center
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#20212C] text-[#BFA7FF] border border-[#BFA7FF]/30 font-semibold'
                      : 'text-[#A7A7AD] hover:text-[#F5F5F2] hover:bg-[#20212C]'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Profile & Target Banner */}
        <div className="p-3 border-t border-[#343541] space-y-3">
          <div className="p-3 bg-[#20212C] rounded-xl border border-[#343541]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-[#F5F5F2] truncate max-w-[120px]">
                {profile?.fullName || 'Student'}
              </span>
              <span className="text-[10px] font-mono bg-[#D8FF9A]/10 text-[#D8FF9A] px-1.5 py-0.5 rounded border border-[#D8FF9A]/20">
                {profile?.boardName || 'CBSE'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#A7A7AD]">
              <span className="flex items-center gap-1 text-[#74747D]">
                <Target className="w-3 h-3 text-[#BFA7FF]" /> Board Target:
              </span>
              <span className="font-mono font-bold text-[#D8FF9A]">
                {profile?.targetPercentage || 95}%
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#FF8F9A] bg-[#FF8F9A]/10 hover:bg-[#FF8F9A]/20 border border-[#FF8F9A]/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

