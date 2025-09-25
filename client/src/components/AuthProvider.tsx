import { ReactNode } from 'react';
import { AuthContext, useAuthQuery, useLoginMutation, useLogoutMutation } from '@/hooks/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading } = useAuthQuery();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  const login = async (username: string, password: string) => {
    const userData = await loginMutation.mutateAsync({ username, password });
    return userData;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const authValue = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}