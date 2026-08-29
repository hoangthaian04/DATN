import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import type { User } from '@/types/auth.types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu true để verify token

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
        // Token hết hạn hoặc không hợp lệ → xóa
        await AuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    void restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await AuthService.login({ email, password });
    AuthService.saveTokens(response);
    setUser(response.user);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const response = await AuthService.loginWithGoogle(idToken);
    AuthService.saveTokens(response);
    setUser(response.user);
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
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook để sử dụng auth context trong bất kỳ component nào */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return ctx;
};
