import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import { User, UserProfile } from '../types';

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

// Mock user store. In a real app, this would be a database.
const MOCK_USERS: { [key: string]: string } = {
  'user@moodflow.ai': 'password123',
};

// Mock user profiles store
const MOCK_USER_PROFILES: { [key: string]: User } = {};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('moodflow_user');
      if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (!parsed.subscriptionStatus) {
              parsed.subscriptionStatus = 'free';
          }
          if (parsed.profileCompleted === undefined) {
              parsed.profileCompleted = false;
          }
          return parsed;
      }
      return null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const isAuthenticated = !!user;
  
  useEffect(() => {
    if (user) {
      localStorage.setItem('moodflow_user', JSON.stringify(user));
      // Also store in mock profiles for persistence
      MOCK_USER_PROFILES[user.email] = user;
    } else {
      localStorage.removeItem('moodflow_user');
    }
  }, [user]);

  const login = useCallback(async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (MOCK_USERS[email] && MOCK_USERS[email] === pass) {
                // Check if user has existing profile
                const existingProfile = MOCK_USER_PROFILES[email];
                const loggedInUser: User = existingProfile || { 
                  email, 
                  subscriptionStatus: 'free',
                  profileCompleted: false
                };
                setUser(loggedInUser);
                resolve();
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, 500);
    });
  }, []);
  
  const signup = useCallback(async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (MOCK_USERS[email]) {
                reject(new Error('An account with this email already exists.'));
                return;
            }
            MOCK_USERS[email] = pass;
            const newUser: User = { 
              email, 
              subscriptionStatus: 'free',
              profileCompleted: false
            };
            setUser(newUser);
            resolve();
        }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const upgradeToPremium = useCallback(() => {
    setUser(currentUser => {
        if (currentUser) {
            const upgradedUser = { ...currentUser, subscriptionStatus: 'premium' as const };
            return upgradedUser;
        }
        return null;
    });
  }, []);

  const updateProfile = useCallback(async (profile: UserProfile) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        setUser(currentUser => {
          if (currentUser) {
            const updatedUser = { 
              ...currentUser, 
              profile,
              profileCompleted: true
            };
            return updatedUser;
          }
          return null;
        });
        resolve();
      }, 500);
    });
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};