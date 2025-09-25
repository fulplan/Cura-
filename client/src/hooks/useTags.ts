import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tag, InsertTag } from "@shared/schema";

// Hook to fetch all tags
export function useTags() {
  return useQuery({
    queryKey: ['/api/tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

// Hook to fetch a single tag by ID
export function useTag(id: string) {
  return useQuery({
    queryKey: ['/api/tags', id],
    queryFn: async () => {
      const response = await fetch(`/api/tags/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tag');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 60000,
    retry: 1,
  });
}

// Hook to create a new tag
export function useCreateTag() {
  return useMutation({
    mutationFn: async (tagData: InsertTag) => {
      const response = await apiRequest('POST', '/api/tags', tagData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch tags
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
    },
  });
}

// Hook to update a tag
export function useUpdateTag() {
  return useMutation({
    mutationFn: async ({ id, ...tagData }: { id: string } & Partial<InsertTag>) => {
      const response = await apiRequest('PUT', `/api/tags/${id}`, tagData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch tags
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tags', variables.id] });
    },
  });
}

// Hook to delete a tag
export function useDeleteTag() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/tags/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch tags
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
    },
  });
}

// Hook to find or create tags by name - useful for post editing
export function useCreateTagsFromNames() {
  return useMutation({
    mutationFn: async (tagNames: string[]) => {
      const existingTags = queryClient.getQueryData(['/api/tags']) as any[] || [];
      const tagIds: string[] = [];
      
      // For each tag name, either find existing or create new
      for (const name of tagNames) {
        const existingTag = existingTags.find(tag => 
          tag.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingTag) {
          tagIds.push(existingTag.id);
        } else {
          // Create new tag
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const response = await apiRequest('POST', '/api/tags', { name, slug });
          const newTag = await response.json();
          tagIds.push(newTag.id);
        }
      }
      
      return tagIds;
    },
    onSuccess: () => {
      // Refetch tags to include any newly created ones
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
    },
  });
}