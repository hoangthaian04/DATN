import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './auth-context-definition';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return context;
};
