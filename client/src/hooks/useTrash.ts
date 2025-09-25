import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post } from "@shared/schema";

// Hook to fetch all deleted posts in trash
export function useDeletedPosts(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['/api/trash/posts', 'list', { limit, offset }],
    queryFn: async () => {
      const response = await fetch(`/api/trash/posts?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deleted posts');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}

// Hook to soft delete (trash) a post
export function useSoftDeletePost() {
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest('DELETE', `/api/posts/${postId}/trash`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate post lists and trash list
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trash/posts'] });
    },
  });
}

// Hook to restore a post from trash
export function useRestorePost() {
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest('POST', `/api/trash/posts/${postId}/restore`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate post lists and trash list
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trash/posts'] });
    },
  });
}

// Hook to permanently delete a post (hard delete)
export function usePermanentDeletePost() {
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest('DELETE', `/api/posts/${postId}/permanent`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate trash list
      queryClient.invalidateQueries({ queryKey: ['/api/trash/posts'] });
    },
  });
}

// Hook to bulk restore posts
export function useBulkRestorePosts() {
  return useMutation({
    mutationFn: async (postIds: string[]) => {
      const promises = postIds.map(id => 
        apiRequest('POST', `/api/trash/posts/${id}/restore`)
      );
      await Promise.all(promises);
      return { restored: postIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trash/posts'] });
    },
  });
}

// Hook to bulk permanently delete posts
export function useBulkPermanentDelete() {
  return useMutation({
    mutationFn: async (postIds: string[]) => {
      const promises = postIds.map(id => 
        apiRequest('DELETE', `/api/posts/${id}/permanent`)
      );
      await Promise.all(promises);
      return { deleted: postIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trash/posts'] });
    },
  });
}

// Hook to empty trash (delete all trashed items)
export function useEmptyTrash() {
  return useMutation({
    mutationFn: async () => {
      // First get all deleted posts
      const response = await fetch('/api/trash/posts');
      const data = await response.json();
      
      if (data.posts && data.posts.length > 0) {
        // Permanently delete all
        const promises = data.posts.map((post: Post) => 
          apiRequest('DELETE', `/api/posts/${post.id}/permanent`)
        );
        await Promise.all(promises);
      }
      
      return { deleted: data.posts?.length || 0 };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trash/posts'] });
    },
  });
}