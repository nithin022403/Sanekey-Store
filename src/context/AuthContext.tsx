import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../lib/api';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate it
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await authAPI.validateToken();
          if (response.success && response.user) {
            setUser({
              id: response.user.id.toString(),
              email: response.user.email,
              full_name: response.user.fullName,
              avatar_url: response.user.avatarUrl,
              created_at: response.user.createdAt,
            });
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.signIn(email, password);
      
      if (response.success && response.user) {
        const userData: User = {
          id: response.user.id.toString(),
          email: response.user.email,
          full_name: response.user.fullName,
          avatar_url: response.user.avatarUrl,
          created_at: response.user.createdAt,
        };
        setUser(userData);
      } else {
        throw new Error(response.message || 'Sign in failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authAPI.signUp(email, password, fullName);
      
      if (response.success && response.user) {
        const userData: User = {
          id: response.user.id.toString(),
          email: response.user.email,
          full_name: response.user.fullName,
          avatar_url: response.user.avatarUrl,
          created_at: response.user.createdAt,
        };
        setUser(userData);
      } else {
        throw new Error(response.message || 'Sign up failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Sign up failed');
    }
  };

  const signOut = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if the API call fails, clear local state
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};