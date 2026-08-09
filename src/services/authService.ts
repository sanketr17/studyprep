import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createOrUpdateProfile, getProfile } from './profileService';
import { initializeUserSyllabusAndSeedData } from './syllabusService';

export type AppUser = SupabaseUser & { uid: string };

function formatUser(user: SupabaseUser | null): AppUser | null {
  if (!user) return null;
  return {
    ...user,
    uid: user.id,
  };
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return formatUser(user);
}

export async function registerWithEmail(
  email: string,
  pass: string,
  fullName: string,
  boardName: string = 'CBSE',
  targetPercentage: number = 95
): Promise<AppUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user) {
    throw new Error('User creation failed');
  }

  const appUser = formatUser(user)!;

  // Create Profile
  await createOrUpdateProfile(appUser.uid, {
    fullName,
    email: appUser.email || email,
    boardName,
    targetPercentage,
  });

  // Initialize Default Syllabus & Seed Data for User
  await initializeUserSyllabusAndSeedData(appUser.uid);

  return appUser;
}

export async function loginWithEmail(email: string, pass: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Login failed: User not found');
  }

  const appUser = formatUser(data.user)!;
  
  // Ensure profile and seed data exist
  const existingProfile = await getProfile(appUser.uid);
  if (!existingProfile) {
    await createOrUpdateProfile(appUser.uid, {
      fullName: appUser.user_metadata?.full_name || 'Board Student',
      email: appUser.email || email,
      boardName: 'CBSE',
      targetPercentage: 95,
    });
    await initializeUserSyllabusAndSeedData(appUser.uid);
  }

  return appUser;
}

export async function loginWithGoogle(): Promise<AppUser | null> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href,
    },
  });

  if (error) {
    throw error;
  }

  const appUser = await getCurrentUser();
  if (appUser) {
    const existingProfile = await getProfile(appUser.uid);
    if (!existingProfile) {
      await createOrUpdateProfile(appUser.uid, {
        fullName: appUser.user_metadata?.full_name || 'Board Student',
        email: appUser.email || '',
        boardName: 'CBSE',
        targetPercentage: 95,
      });
      await initializeUserSyllabusAndSeedData(appUser.uid);
    }
    return appUser;
  }

  return null;
}

export async function loginDemoAccount(): Promise<AppUser> {
  const demoEmail = 'student.demo@boardprep.app';
  const demoPass = 'DemoStudent#2026';

  try {
    return await loginWithEmail(demoEmail, demoPass);
  } catch (err: any) {
    try {
      return await registerWithEmail(demoEmail, demoPass, 'Sanket Rahul', 'CBSE', 95);
    } catch (regErr: any) {
      console.error('Demo registration failed:', regErr.message || regErr);
      throw new Error('Could not authenticate demo user with Supabase Auth: ' + (regErr.message || err.message));
    }
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('SignOut exception caught:', e);
  }
}
