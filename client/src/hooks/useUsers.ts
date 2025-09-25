import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, InsertUser } from "@shared/schema";

// Hook to fetch all users (admin only)
export function useUsers() {
  return useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

// Hook to fetch a single user by ID (admin only)
export function useUser(id: string) {
  return useQuery({
    queryKey: ['/api/users', id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 60000,
    retry: 1,
  });
}

// Hook to create a new user (admin only)
export function useCreateUser() {
  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest('POST', '/api/users', userData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });
}

// Hook to update a user (admin only)
export function useUpdateUser() {
  return useMutation({
    mutationFn: async ({ id, ...userData }: { id: string } & Partial<InsertUser>) => {
      const response = await apiRequest('PUT', `/api/users/${id}`, userData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', variables.id] });
    },
  });
}

// Hook to delete a user (admin only)
export function useDeleteUser() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });
}