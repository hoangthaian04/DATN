import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import type {
  LoginRequest,
  OnboardingRequest,
  RegisterRequest,
  User,
} from '@/types/auth.types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<User>;
  adminLogin: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  onboarding: (data: OnboardingRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session khi mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!AuthService.hasToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await AuthService.getMe();
        setUser(me);
      } catch {
        await AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    void restoreSession();
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<User> => {
    const response = await AuthService.login(data);
    AuthService.saveTokens(response);
    setUser(response.user);
    return response.user;
  }, []);

  const adminLogin = useCallback(async (data: LoginRequest): Promise<User> => {
    const response = await AuthService.adminLogin(data);
    AuthService.saveTokens(response);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<User> => {
    const response = await AuthService.register(data);
    AuthService.saveTokens(response);
    setUser(response.user);
    return response.user;
  }, []);

  const onboarding = useCallback(async (data: OnboardingRequest): Promise<void> => {
    await AuthService.onboarding(data);
    const me = await AuthService.getMe();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await AuthService.getMe();
    setUser(me);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        adminLogin,
        register,
        onboarding,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return ctx;
};
