import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, Zap, AlertCircle } from 'lucide-react';
import { loginWithEmail } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/ui/PageTransition';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. You can also use Quick Demo Login below!');
      } else {
        setError(err.message || 'Unable to log in. Please check credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    try {
      setSubmitting(true);
      setError('');
      await loginDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError('Error signing into demo account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-[#15161F] text-[#F5F5F2] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-[#1B1C26] border border-[#343541] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* LEFT COLUMN - Editorial Display */}
        <div className="md:col-span-5 bg-[#15161F] p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#343541] bg-tech-grid relative">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-7 h-7 rounded bg-[#BFA7FF] text-[#15161F] flex items-center justify-center font-bold text-xs font-mono">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-[#F5F5F2]">StudyPrep</span>
            </Link>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#F5F5F2] leading-tight">
              Your boards.{' '}
              <span className="font-editorial text-4xl text-[#BFA7FF] font-normal block mt-1">
                Your pace. Your progress.
              </span>
            </h2>

            <p className="text-xs text-[#A7A7AD] mt-4 leading-relaxed">
              Log in to your centralized exam command center to review study targets, formula vaults, and revision alerts.
            </p>
          </div>

          <div className="pt-8 border-t border-[#343541] mt-8 text-[11px] font-mono text-[#74747D]">
            CLASS 10 BOARD EXAM HUB // V1.0
          </div>
        </div>

        {/* RIGHT COLUMN - Login Form */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#F5F5F2]">Log In to Workspace</h3>
            <p className="text-xs text-[#A7A7AD] mt-1">
              Enter your credentials or use instant demo access.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FF8F9A]/10 border border-[#FF8F9A]/30 text-[#FF8F9A] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] placeholder-[#74747D] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] placeholder-[#74747D] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              disabled={submitting}
              icon={<LogIn className="w-4 h-4" />}
            >
              {submitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-[#343541] flex-1" />
            <span className="text-[10px] font-mono text-[#74747D] uppercase">OR</span>
            <div className="h-px bg-[#343541] flex-1" />
          </div>

          <Button
            type="button"
            variant="lime"
            size="md"
            className="w-full"
            onClick={handleQuickDemo}
            disabled={submitting}
            icon={<Zap className="w-4 h-4" />}
          >
            Quick Demo Login (Evaluator Access)
          </Button>

          <p className="text-center text-xs text-[#A7A7AD] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#BFA7FF] font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

      </div>
    </PageTransition>
  );
};
