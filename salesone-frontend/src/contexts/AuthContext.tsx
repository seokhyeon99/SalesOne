"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';

// Define user type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isStaff: boolean;
}

// Define the context state
interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  clearError: () => void;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

interface AuthResponse {
  user: User;
}

// Create the auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const router = useRouter();
  const { makeRequest } = useApi();

  // Check auth status on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!isAuthChecked) {
        try {
          const userData = await makeRequest<AuthResponse>('/api/auth/user/');
          if (isMounted) {
            setUser(userData.user);
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          if (isMounted) {
            setUser(null);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
            setIsAuthChecked(true);
          }
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  const clearError = () => setError(null);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await makeRequest<AuthResponse>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      setUser(response.user);
      setIsAuthChecked(true);
      router.push('/dashboard');
    } catch (err) {
      setError('이메일 또는 비밀번호가 잘못되었습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await makeRequest('/api/auth/logout/', {
        method: 'POST',
      });
      setUser(null);
      setIsAuthChecked(false);
      router.push('/login');
    } catch (err) {
      setError('로그아웃 중 오류가 발생했습니다.');
      console.error('Logout failed:', err);
    }
  };

  // Register function
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await makeRequest<AuthResponse>('/api/auth/registration/', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password1: password,
          password2: password,
          first_name: firstName,
          last_name: lastName
        }),
      });

      setUser(response.user);
      setIsAuthChecked(true);
      router.push('/dashboard');
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create context value object
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 