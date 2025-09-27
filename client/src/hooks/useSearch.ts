import { useQuery } from "@tanstack/react-query";

export interface SearchResult {
  id: string;
  title: string;
  excerpt?: string;
  slug?: string;
  status?: string;
  createdAt: string;
  type: 'post' | 'category' | 'media';
  authorName?: string;
  categoryName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export function useSearch(query: string, type: string = "all", limit: number = 10) {
  return useQuery<SearchResponse>({
    queryKey: ['/api/search', query, type, limit],
    enabled: query.trim().length > 0,
    staleTime: 30000, // Consider results fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

export function useGlobalSearch(query: string) {
  return useSearch(query, "all", 8);
}