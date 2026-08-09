import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Profile query notice:', error.message);
      const local = localStorage.getItem(`profile_${userId}`);
      if (local) return JSON.parse(local);
      return null;
    }

    if (data) {
      const profile: UserProfile = {
        id: data.user_id,
        fullName: data.full_name || 'Student',
        email: '',
        boardName: data.board_name || 'CBSE',
        targetPercentage: data.target_percentage ? Number(data.target_percentage) : 95,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
      return profile;
    }

    const local = localStorage.getItem(`profile_${userId}`);
    return local ? JSON.parse(local) : null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    const local = localStorage.getItem(`profile_${userId}`);
    return local ? JSON.parse(local) : null;
  }
}

export async function createOrUpdateProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'id'>>
): Promise<void> {
  if (!userId) return;
  const now = new Date().toISOString();

  const payload: any = {
    user_id: userId,
    updated_at: now,
  };

  if (data.fullName !== undefined) payload.full_name = data.fullName;
  if (data.boardName !== undefined) payload.board_name = data.boardName;
  if (data.targetPercentage !== undefined) payload.target_percentage = Number(data.targetPercentage);

  // Local storage cache update for instant UI feedback
  const existing = await getProfile(userId);
  const updatedLocal: UserProfile = {
    id: userId,
    fullName: data.fullName ?? existing?.fullName ?? 'Student',
    email: data.email ?? existing?.email ?? '',
    boardName: data.boardName ?? existing?.boardName ?? 'CBSE',
    targetPercentage: data.targetPercentage ?? existing?.targetPercentage ?? 95,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedLocal));

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.warn('Supabase profile upsert notice:', error.message);
    }
  } catch (err) {
    console.error('Failed to create/update profile in Supabase:', err);
  }
}
