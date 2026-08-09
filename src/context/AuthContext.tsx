import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { getProfile } from '../services/profileService';
import { loginDemoAccount, logoutUser, AppUser } from '../services/authService';

interface AuthContextType {
  currentUser: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  loginDemo: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const p = await getProfile(uid);
      setProfile(p);
    } catch (e) {
      console.error('Failed to fetch profile in AuthProvider:', e);
    }
  };

  useEffect(() => {
    // 1. Initial session check from Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const appUser: AppUser = { ...session.user, uid: session.user.id };
        setCurrentUser(appUser);
        fetchProfile(appUser.uid);
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // 2. Listen to real-time auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const appUser: AppUser = { ...session.user, uid: session.user.id };
        setCurrentUser(appUser);
        await fetchProfile(appUser.uid);
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser.uid);
    }
  };

  const loginDemo = async () => {
    setLoading(true);
    try {
      const demoUser = await loginDemoAccount();
      setCurrentUser(demoUser);
      await fetchProfile(demoUser.uid);
    } catch (e) {
      console.error('Demo login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        refreshProfile,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
