'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, SignupFormData, LoginFormData, AuthResponse } from '@/lib/types/auth';
import { 
  signupUser, 
  loginUser, 
  logoutUser, 
  getCurrentSession, 
  updateUserProfile, 
  refreshSession 
} from '@/lib/services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from session
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const session = getCurrentSession();
        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Refresh session periodically
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      const session = refreshSession();
      if (!session) {
        setUser(null);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const signup = async (userData: SignupFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await signupUser(userData);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginFormData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await loginUser(credentials);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResponse> => {
    if (!user) {
      return { success: false, message: 'No user logged in' };
    }

    setIsLoading(true);
    try {
      const response = await updateUserProfile(user.id, updates);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const session = getCurrentSession();
    if (session) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for protected routes
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { user, isLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setShouldRedirect(true);
    }
  }, [user, isLoading]);

  return { user, isLoading, shouldRedirect, redirectTo };
}