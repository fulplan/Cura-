import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Media, InsertMedia } from "@shared/schema";

// Hook to fetch all media with pagination
export function useMedia(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['/api/media', 'list', { limit, offset }],
    queryFn: async () => {
      const response = await fetch(`/api/media?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

// Hook to fetch a single media item by ID
export function useMediaItem(id: string) {
  return useQuery({
    queryKey: ['/api/media', 'detail', id],
    queryFn: async () => {
      const response = await fetch(`/api/media/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch media');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 60000,
    retry: 1,
  });
}

// Hook to upload files
export function useUploadFiles() {
  return useMutation({
    mutationFn: async ({ files, alt, caption }: { 
      files: File[]; 
      alt?: string; 
      caption?: string; 
    }) => {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      if (alt) formData.append('alt', alt);
      if (caption) formData.append('caption', caption);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch media list
      queryClient.invalidateQueries({ queryKey: ['/api/media', 'list'] });
    },
  });
}

// Hook to create media metadata (for programmatic use)
export function useCreateMedia() {
  return useMutation({
    mutationFn: async ({ uploadedBy, ...mediaData }: { uploadedBy: string } & InsertMedia) => {
      const response = await apiRequest('POST', '/api/media', { ...mediaData, uploadedBy });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media', 'list'] });
    },
  });
}

// Hook to update media metadata
export function useUpdateMedia() {
  return useMutation({
    mutationFn: async ({ id, ...mediaData }: { id: string } & Partial<InsertMedia>) => {
      const response = await apiRequest('PUT', `/api/media/${id}`, mediaData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/media', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['/api/media', 'detail', variables.id] });
    },
  });
}

// Hook to delete media
export function useDeleteMedia() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/media/${id}`);
      return response.json();
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/media', 'list'] });
      queryClient.removeQueries({ queryKey: ['/api/media', 'detail', id] });
    },
  });
}

// Hook for upload progress tracking (for advanced upload UI)
export function useUploadWithProgress() {
  return useMutation({
    mutationFn: async ({ 
      files, 
      alt, 
      caption,
      onProgress 
    }: { 
      files: File[]; 
      alt?: string; 
      caption?: string;
      onProgress?: (progress: number) => void;
    }) => {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      if (alt) formData.append('alt', alt);
      if (caption) formData.append('caption', caption);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });

        xhr.onload = () => {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        
        xhr.open('POST', '/api/media/upload');
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media', 'list'] });
    },
  });
}