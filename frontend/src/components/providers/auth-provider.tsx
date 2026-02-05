'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from cookies on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('accessToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await authApi.getProfile();
        setUser(data);
      } catch (error) {
        // Token invalid or expired, clear cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    (accessToken: string, refreshToken: string, userData: User) => {
      Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
      Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
      setUser(userData);
    },
    []
  );

  const logout = useCallback(() => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.getProfile();
      setUser(data);
    } catch (error) {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
