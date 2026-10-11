import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithOtp: (identifier: string, code: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchDemoAccount: (roleKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mahavote_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('mahavote_access_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await api.get<{ success: boolean; data: User }>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      localStorage.removeItem('mahavote_access_token');
      localStorage.removeItem('mahavote_refresh_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        data: { user: User; accessToken: string; refreshToken: string };
      }>('/auth/login', { identifier, password });

      if (res.success && res.data) {
        localStorage.setItem('mahavote_access_token', res.data.accessToken);
        localStorage.setItem('mahavote_refresh_token', res.data.refreshToken);
        setToken(res.data.accessToken);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const loginWithOtp = async (identifier: string, code: string) => {
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        data: { user: User; accessToken: string; refreshToken: string };
      }>('/auth/otp/verify', { identifier, code });

      if (res.success && res.data?.accessToken) {
        localStorage.setItem('mahavote_access_token', res.data.accessToken);
        localStorage.setItem('mahavote_refresh_token', res.data.refreshToken);
        setToken(res.data.accessToken);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'OTP verification failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'OTP verification failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    }
    localStorage.removeItem('mahavote_access_token');
    localStorage.removeItem('mahavote_refresh_token');
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  // Quick 1-click Demo Account Switcher
  const switchDemoAccount = async (roleKey: string) => {
    setIsLoading(true);
    let id = '';
    let pass = '';

    switch (roleKey) {
      case 'SUPER_ADMIN':
        id = 'admin@mahavote.gov.in';
        pass = 'Admin@12345';
        break;
      case 'STATE_ADMIN':
        id = 'state.admin@mahavote.gov.in';
        pass = 'StateAdmin@12345';
        break;
      case 'DEO':
        id = 'deo.pune@mahavote.gov.in';
        pass = 'DeoPune@12345';
        break;
      case 'RO':
        id = 'ro.kasba@mahavote.gov.in';
        pass = 'RoKasba@12345';
        break;
      case 'AUDITOR':
        id = 'auditor@mahavote.gov.in';
        pass = 'Auditor@12345';
        break;
      case 'CANDIDATE':
        id = 'ananya@candidate.demo';
        pass = 'Candidate@12345';
        break;
      case 'VOTER':
      default:
        id = 'voter1@mahavote.demo';
        pass = 'Voter@12345';
        break;
    }

    await login(id, pass);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithOtp,
        logout,
        refreshUser,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
