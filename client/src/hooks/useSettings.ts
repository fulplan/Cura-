import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Setting, InsertSetting } from "@shared/schema";

// Hook to fetch all settings or settings by category
export function useSettings(category?: string) {
  return useQuery({
    queryKey: ['/api/settings', 'list', { category }],
    queryFn: async () => {
      const url = category ? `/api/settings?category=${category}` : '/api/settings';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}

// Hook to fetch a specific setting by key
export function useSetting(key: string) {
  return useQuery({
    queryKey: ['/api/settings', 'detail', key],
    queryFn: async () => {
      const response = await fetch(`/api/settings/${key}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch setting');
      }
      return response.json();
    },
    enabled: !!key,
    staleTime: 30000,
    retry: 1,
  });
}

// Hook to create or update a setting (admin only)
export function useSetSetting() {
  return useMutation({
    mutationFn: async ({ key, value, category, isPublic, description }: { 
      key: string; 
      value: any; 
      category?: string; 
      isPublic?: boolean; 
      description?: string; 
    }) => {
      const response = await apiRequest('POST', '/api/settings', {
        key,
        value,
        category,
        isPublic,
        description
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['/api/settings', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings', 'detail', variables.key] });
      if (variables.category) {
        queryClient.invalidateQueries({ queryKey: ['/api/settings', 'list', { category: variables.category }] });
      }
    },
  });
}

// Hook to update a specific setting (admin only)
export function useUpdateSetting() {
  return useMutation({
    mutationFn: async ({ key, ...updates }: { key: string } & Partial<InsertSetting>) => {
      const response = await apiRequest('PUT', `/api/settings/${key}`, updates);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['/api/settings', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings', 'detail', variables.key] });
    },
  });
}

// Hook to delete a setting (admin only)
export function useDeleteSetting() {
  return useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest('DELETE', `/api/settings/${key}`);
      return response.json();
    },
    onSuccess: (data, key) => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['/api/settings', 'list'] });
      queryClient.removeQueries({ queryKey: ['/api/settings', 'detail', key] });
    },
  });
}

// Helper hook for common site settings
export function useSiteSettings() {
  return useSettings('general');
}

// Helper hook for email settings
export function useEmailSettings() {
  return useSettings('email');
}

// Helper hook for social media settings
export function useSocialSettings() {
  return useSettings('social');
}

// Helper hook to get a specific setting value with default fallback
export function useSettingValue<T>(key: string, defaultValue: T): T {
  const { data: setting, isLoading } = useSetting(key);
  
  if (isLoading || !setting) {
    return defaultValue;
  }
  
  return setting.value ?? defaultValue;
}