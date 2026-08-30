import React, { useCallback, useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import type { LoginRequest, OnboardingRequest, RegisterRequest, RegistrationResponse, User } from '@/types/auth.types';
import { AuthContext } from './auth-context-definition';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        await AuthService.initializeCsrf();
        setUser(await AuthService.getMe());
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void restoreSession();
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<User> => {
    const { user: loggedInUser } = await AuthService.login(data);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string): Promise<User> => {
    const { user: loggedInUser } = await AuthService.googleLogin(idToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const adminLogin = useCallback(async (data: LoginRequest): Promise<User> => {
    const { user: loggedInUser } = await AuthService.adminLogin(data);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(
    (data: RegisterRequest): Promise<RegistrationResponse> => AuthService.register(data),
    [],
  );

  const onboarding = useCallback(async (data: OnboardingRequest, skip = false): Promise<void> => {
    if (!skip) {
      await AuthService.updateCompanyProfile(data);
    }
    await AuthService.completeOnboarding(skip);
    setUser(await AuthService.getMe());
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const refreshedUser = await AuthService.getMe();
    setUser(refreshedUser);
    return refreshedUser;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      loginWithGoogle,
      adminLogin,
      register,
      onboarding,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
