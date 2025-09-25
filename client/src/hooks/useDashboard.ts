import { useQuery } from "@tanstack/react-query";

// Hook to fetch dashboard statistics
export function useDashboardStats() {
  return useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

// Hook to fetch popular posts for dashboard
export function usePopularPosts(limit = 5) {
  return useQuery({
    queryKey: ['/api/analytics/popular-posts', { limit }],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/popular-posts?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch popular posts');
      }
      return response.json();
    },
    enabled: true,
    staleTime: 300000, // 5 minutes
    retry: 1,
  });
}

// Mock data for development (fallback when API fails)
export const mockDashboardStats = {
  totalPosts: 124,
  publishedPosts: 98, 
  totalCategories: 8,
  totalTags: 24,
  totalMedia: 56,
  totalUsers: 12,
  recentPosts: [
    {
      id: "1",
      title: "Getting Started with React and TypeScript",
      status: "published",
      createdAt: "2024-03-15T10:00:00Z",
      viewCount: 1247
    },
    {
      id: "2", 
      title: "Advanced TypeScript Patterns for React Development",
      status: "published",
      createdAt: "2024-03-12T10:00:00Z", 
      viewCount: 856
    },
    {
      id: "3",
      title: "Database Design Best Practices for Modern Applications", 
      status: "draft",
      createdAt: "2024-03-10T10:00:00Z",
      viewCount: 0
    },
    {
      id: "4",
      title: "Modern CSS Techniques: Grid, Flexbox, and Beyond",
      status: "published", 
      createdAt: "2024-03-08T10:00:00Z",
      viewCount: 642
    },
    {
      id: "5",
      title: "Building Scalable APIs with Node.js and Express",
      status: "scheduled",
      createdAt: "2024-03-06T10:00:00Z",
      viewCount: 0
    }
  ]
};

export const mockPopularPosts = [
  {
    id: "1",
    title: "Getting Started with React and TypeScript", 
    slug: "getting-started-react-typescript",
    viewCount: 1247,
    publishedAt: "2024-03-15T10:00:00Z"
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns for React Development",
    slug: "advanced-typescript-patterns-react", 
    viewCount: 856,
    publishedAt: "2024-03-12T10:00:00Z"
  },
  {
    id: "4", 
    title: "Modern CSS Techniques: Grid, Flexbox, and Beyond",
    slug: "modern-css-techniques",
    viewCount: 642, 
    publishedAt: "2024-03-08T10:00:00Z"
  },
  {
    id: "6",
    title: "The Future of Web Development: Trends to Watch in 2024",
    slug: "future-web-development-2024-trends",
    viewCount: 534,
    publishedAt: "2024-03-05T10:00:00Z"
  }
];