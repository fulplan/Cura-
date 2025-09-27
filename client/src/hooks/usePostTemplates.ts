import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PostTemplate, InsertPostTemplate } from "@shared/schema";

// Hook to fetch all post templates
export function usePostTemplates() {
  return useQuery({
    queryKey: ['/api/post-templates'],
    queryFn: async () => {
      const response = await fetch('/api/post-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch post templates');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}

// Hook to fetch a single post template
export function usePostTemplate(id: string) {
  return useQuery({
    queryKey: ['/api/post-templates', id],
    queryFn: async () => {
      const response = await fetch(`/api/post-templates/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post template');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 30000,
    retry: 1,
  });
}

// Hook to create a new post template
export function useCreatePostTemplate() {
  return useMutation({
    mutationFn: async (template: InsertPostTemplate) => {
      const response = await apiRequest('POST', '/api/post-templates', template);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch post templates
      queryClient.invalidateQueries({ queryKey: ['/api/post-templates'] });
    },
  });
}

// Hook to update a post template
export function useUpdatePostTemplate() {
  return useMutation({
    mutationFn: async ({ id, template }: { id: string; template: Partial<InsertPostTemplate> }) => {
      const response = await apiRequest('PATCH', `/api/post-templates/${id}`, template);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/post-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/post-templates', id] });
    },
  });
}

// Hook to delete a post template
export function useDeletePostTemplate() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/post-templates/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch post templates
      queryClient.invalidateQueries({ queryKey: ['/api/post-templates'] });
    },
  });
}