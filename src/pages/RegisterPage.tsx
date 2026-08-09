import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserPlus, AlertCircle, Target } from 'lucide-react';
import { registerWithEmail } from '../services/authService';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/ui/PageTransition';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [boardName, setBoardName] = useState('CBSE');
  const [targetPercentage, setTargetPercentage] = useState(95);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await registerWithEmail(email, password, fullName, boardName, targetPercentage);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-[#15161F] text-[#F5F5F2] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-[#1B1C26] border border-[#343541] rounded-2xl p-8 shadow-2xl bg-tech-grid">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#BFA7FF] text-[#15161F] flex items-center justify-center font-bold font-mono">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base text-[#F5F5F2]">StudyPrep</span>
          </Link>
          <h2 className="text-2xl font-bold text-[#F5F5F2]">Start your preparation</h2>
          <p className="text-xs text-[#A7A7AD] mt-1">Build a study system that keeps you on track.</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-[#FF8F9A]/10 border border-[#FF8F9A]/30 text-[#FF8F9A] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] placeholder-[#74747D] focus:outline-none focus:border-[#BFA7FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              required
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
              required
              className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] placeholder-[#74747D] focus:outline-none focus:border-[#BFA7FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5">Board Examination</label>
              <select
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              >
                <option value="CBSE">CBSE Board</option>
                <option value="ICSE">ICSE Board</option>
                <option value="State Board">State Board</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5 flex items-center justify-between">
                <span>Target Score</span>
                <span className="text-[#D8FF9A] font-bold">{targetPercentage}%</span>
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-4"
            disabled={submitting}
            icon={<UserPlus className="w-4 h-4" />}
          >
            {submitting ? 'Creating account...' : 'Create Account & Start Preparing'}
          </Button>
        </form>

        <p className="text-center text-xs text-[#A7A7AD] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#BFA7FF] font-semibold hover:underline">
            Log in here
          </Link>
        </p>

      </div>
    </PageTransition>
  );
};
