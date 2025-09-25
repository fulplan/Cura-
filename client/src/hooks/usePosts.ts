import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post } from "@shared/schema";

// Hook to fetch all posts with optional filters
export function usePosts(filters?: {
  status?: string;
  categoryId?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId);
  if (filters?.authorId) queryParams.append('authorId', filters.authorId);
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/api/posts?${queryString}` : '/api/posts';

  return useQuery({
    queryKey: ['/api/posts', filters],
    queryFn: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}

// Hook to fetch posts with detailed information (author, category)
export function usePostsWithDetails() {
  return useQuery({
    queryKey: ['/api/posts', { detailed: 'true' }],
    queryFn: async () => {
      const response = await fetch('/api/posts?detailed=true');
      if (!response.ok) {
        throw new Error('Failed to fetch posts with details');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 30000,
    retry: 1,
  });
}

// Hook to fetch a single post by ID
export function usePost(id: string) {
  return useQuery({
    queryKey: ['/api/posts', id],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 30000,
    retry: 1,
  });
}

// Hook to create a new post
export function useCreatePost() {
  return useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
  });
}

// Hook to update a post
export function useUpdatePost() {
  return useMutation({
    mutationFn: async ({ id, ...postData }: { id: string } & any) => {
      const response = await apiRequest('PUT', `/api/posts/${id}`, postData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
  });
}

// Hook to delete a post
export function useDeletePost() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/posts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
  });
}

// Mock data for development (fallback when API fails)
export const mockPosts = [
  {
    id: "1",
    title: "Getting Started with React and TypeScript",
    slug: "getting-started-react-typescript",
    status: "published" as const,
    author: {
      id: "1",
      username: "admin",
      displayName: "Administrator",
    },
    category: {
      id: "1", 
      name: "Development",
      slug: "development",
      color: "#3b82f6",
    },
    publishedAt: "2024-03-15T10:00:00Z",
    createdAt: "2024-03-15T10:00:00Z",
    viewCount: 1247,
    excerpt: "Learn how to set up a modern React project with TypeScript for better development experience and type safety.",
    content: "Complete guide content here...",
    featured: true
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns for React Development",
    slug: "advanced-typescript-patterns-react", 
    status: "published" as const,
    author: {
      id: "2",
      username: "editor",
      displayName: "Content Editor",
    },
    category: {
      id: "1",
      name: "Development", 
      slug: "development",
      color: "#3b82f6",
    },
    publishedAt: "2024-03-12T10:00:00Z",
    createdAt: "2024-03-12T10:00:00Z",
    viewCount: 856,
    excerpt: "Exploring advanced TypeScript features and design patterns for building better React applications.",
    content: "Advanced patterns content here...",
    featured: false
  },
  {
    id: "3",
    title: "Database Design Best Practices for Modern Applications",
    slug: "database-design-best-practices",
    status: "draft" as const,
    author: {
      id: "1",
      username: "admin", 
      displayName: "Administrator",
    },
    category: {
      id: "2",
      name: "Technology",
      slug: "technology", 
      color: "#10b981",
    },
    publishedAt: null,
    createdAt: "2024-03-10T10:00:00Z",
    viewCount: 0,
    excerpt: "Learn how to design scalable and efficient database schemas with modern best practices and optimization techniques.",
    content: "Database design content here...",
    featured: false
  }
];