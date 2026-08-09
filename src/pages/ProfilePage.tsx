import React, { useState, useEffect } from 'react';
import { 
  User, 
  Target, 
  BookOpen, 
  Save, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { Sidebar } from '../components/ui/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageTransition } from '../components/ui/PageTransition';
import { createOrUpdateProfile } from '../services/profileService';

export const ProfilePage: React.FC = () => {
  const { currentUser, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [boardName, setBoardName] = useState(profile?.boardName || 'CBSE');
  const [targetPercentage, setTargetPercentage] = useState(profile?.targetPercentage || 95);

  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setBoardName(profile.boardName);
      setTargetPercentage(profile.targetPercentage);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSubmitting(true);
      setSavedSuccess(false);

      await createOrUpdateProfile(currentUser.uid, {
        fullName,
        boardName,
        targetPercentage: Number(targetPercentage),
      });

      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <PageTransition className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="border-b border-[#343541] pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#20212C] border border-[#343541] text-[11px] font-mono text-[#BFA7FF] mb-2">
            <User className="w-3.5 h-3.5" />
            <span>STUDENT PROFILE &amp; TARGET</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
            Profile &amp; Examination Goal
          </h1>
          <p className="text-xs text-[#A7A7AD] mt-1">
            Configure your board target percentage and student profile settings.
          </p>
        </div>

        {/* PROFILE FORM CARD */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {savedSuccess && (
              <div className="p-3 bg-[#D8FF9A]/15 border border-[#D8FF9A]/30 rounded-lg text-[#D8FF9A] text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile and Target score updated successfully!</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5">
                  Full Student Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={currentUser?.email || profile?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#15161F]/60 border border-[#343541] rounded-lg text-xs text-[#74747D] cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1.5">
                    Board Examination
                  </label>
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
                    <span>Target Board Score</span>
                    <span className="text-[#D8FF9A] font-bold font-mono">{targetPercentage}%</span>
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
            </div>

            <div className="pt-4 border-t border-[#343541] flex justify-end">
              <Button
                type="submit"
                variant="lime"
                size="md"
                disabled={submitting}
                icon={<Save className="w-4 h-4" />}
              >
                {submitting ? 'Updating...' : 'Save Profile Changes'}
              </Button>
            </div>

          </form>
        </Card>

      </PageTransition>
    </div>
  );
};
