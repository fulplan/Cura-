import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Section, InsertSection } from "@shared/schema";

// Hook to fetch all sections with optional filtering
export function useSections(pageId?: string, includeDeleted = false) {
  const queryParams = new URLSearchParams();
  
  if (pageId) queryParams.append('pageId', pageId);
  if (includeDeleted) queryParams.append('includeDeleted', 'true');

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/sections?${queryString}` : '/api/sections';

  return useQuery({
    queryKey: ['/api/sections', { pageId, includeDeleted }],
    queryFn: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}

// Hook to fetch a single section by ID
export function useSection(id: string) {
  return useQuery({
    queryKey: ['/api/sections', id],
    queryFn: async () => {
      const response = await fetch(`/api/sections/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch section');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 30000,
    retry: 1,
  });
}

// Hook to create a new section
export function useCreateSection() {
  return useMutation({
    mutationFn: async (sectionData: InsertSection) => {
      const response = await apiRequest('POST', '/api/sections', sectionData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch sections
      queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
    },
  });
}

// Hook to update a section
export function useUpdateSection() {
  return useMutation({
    mutationFn: async ({ id, ...sectionData }: { id: string } & Partial<InsertSection>) => {
      const response = await apiRequest('PUT', `/api/sections/${id}`, sectionData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch sections
      queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sections', variables.id] });
    },
  });
}

// Hook to delete a section
export function useDeleteSection() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/sections/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch sections
      queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
    },
  });
}

// Hook to restore a deleted section
export function useRestoreSection() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/sections/${id}/restore`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch sections
      queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
    },
  });
}

// Hook to reorder sections
export function useReorderSections() {
  return useMutation({
    mutationFn: async (sectionIds: string[]) => {
      const response = await apiRequest('POST', '/api/sections/reorder', { sectionIds });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch sections
      queryClient.invalidateQueries({ queryKey: ['/api/sections'] });
    },
  });
}