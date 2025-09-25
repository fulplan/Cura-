import { createContext, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { User } from '@shared/schema';

type AuthUser = Omit<User, 'password'>;

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthQuery() {
  return useQuery<AuthUser | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        return data.user;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await response.json();
      return data.user;
    },
    onSuccess: () => {
      // Invalidate auth query to refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      // Clear all cached data and redirect
      queryClient.invalidateQueries();
      queryClient.setQueryData(['/api/auth/me'], null);
    },
  });
}