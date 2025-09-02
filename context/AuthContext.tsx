import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  user: User | null;
  upgradeToPremium: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Load user profile from database
  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('app_ba9387a6aa_user_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading user profile:', error);
        return;
      }

      const userData: User = {
        email: supabaseUser.email!,
        subscriptionStatus: profile?.subscription_status || 'free',
        profileCompleted: profile?.profile_completed || false,
        profile: profile ? {
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          dateOfBirth: profile.date_of_birth || '',
          profilePicture: profile.profile_picture,
          bio: profile.bio,
          location: profile.location,
          interests: profile.interests || []
        } : undefined
      };

      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Create user profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('app_ba9387a6aa_user_profiles')
        .insert({
          user_id: data.user.id,
          subscription_status: 'free',
          profile_completed: false
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
  }, []);

  const upgradeToPremium = useCallback(async () => {
    if (!user) return;

    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) return;

      const { error } = await supabase
        .from('app_ba9387a6aa_user_profiles')
        .update({ subscription_status: 'premium' })
        .eq('user_id', supabaseUser.id);

      if (error) {
        console.error('Error upgrading to premium:', error);
        return;
      }

      setUser(currentUser => {
        if (currentUser) {
          return { ...currentUser, subscriptionStatus: 'premium' };
        }
        return null;
      });
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    }
  }, [user]);

  const updateProfile = useCallback(async (profile: UserProfile) => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (!supabaseUser) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('app_ba9387a6aa_user_profiles')
        .upsert({
          user_id: supabaseUser.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          date_of_birth: profile.dateOfBirth,
          profile_picture: profile.profilePicture,
          bio: profile.bio,
          location: profile.location,
          interests: profile.interests,
          profile_completed: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        throw new Error(error.message);
      }

      setUser(currentUser => {
        if (currentUser) {
          return {
            ...currentUser,
            profile,
            profileCompleted: true
          };
        }
        return null;
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    upgradeToPremium,
    updateProfile,
  }), [isAuthenticated, user, login, signup, logout, upgradeToPremium, updateProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};