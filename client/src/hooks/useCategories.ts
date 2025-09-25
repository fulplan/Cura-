import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Category, InsertCategory } from "@shared/schema";

// Hook to fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

// Hook to fetch a single category by ID
export function useCategory(id: string) {
  return useQuery({
    queryKey: ['/api/categories', id],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 60000,
    retry: 1,
  });
}

// Hook to create a new category
export function useCreateCategory() {
  return useMutation({
    mutationFn: async (categoryData: InsertCategory) => {
      const response = await apiRequest('POST', '/api/categories', categoryData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
  });
}

// Hook to update a category
export function useUpdateCategory() {
  return useMutation({
    mutationFn: async ({ id, ...categoryData }: { id: string } & Partial<InsertCategory>) => {
      const response = await apiRequest('PUT', `/api/categories/${id}`, categoryData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories', variables.id] });
    },
  });
}

// Hook to delete a category
export function useDeleteCategory() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
  });
}