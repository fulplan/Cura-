import { useState, useEffect } from "react";
import React from "react";
import { Link } from "wouter";
import { Search, Filter, MoreHorizontal, Edit, Eye, Trash2, Plus, Grid, List, FileText } from "lucide-react";
import { usePostsWithDetails, useDeletePost, mockPosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody, 
  PageActions,
  ActionBar,
  FAB,
  FilterSheet
} from "@/components/ui/page";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard, LoadingTable } from "@/components/ui/loading";

interface PostWithDetails {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "published" | "draft" | "scheduled";
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  } | null;
}

interface AllPostsPageProps {
  onCreatePost?: () => void;
  onEditPost?: (id: string) => void;
  onPreviewPost?: (id: string) => void;
  onDeletePost?: (id: string) => void;
}

// Transform API data to match component expectations
const transformPostData = (apiPost: any): PostWithDetails => ({
  id: apiPost.id,
  title: apiPost.title,
  slug: apiPost.slug,
  excerpt: apiPost.excerpt || "",
  status: apiPost.status,
  viewCount: apiPost.viewCount || 0,
  publishedAt: apiPost.publishedAt,
  createdAt: apiPost.createdAt,
  author: apiPost.author || { id: "", username: "Unknown", displayName: "Unknown User" },
  category: apiPost.category || { id: "", name: "Uncategorized", slug: "uncategorized", color: "#6b7280" }
});

export default function AllPostsPage({ 
  onCreatePost,
  onEditPost,
  onPreviewPost,
  onDeletePost
}: AllPostsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  
  const { toast } = useToast();
  
  // Fetch posts with details (author, category info)
  const { data: postsData, isLoading, error } = usePostsWithDetails();
  const deleteMutation = useDeletePost();
  
  // Show error notification if API call fails (only once)
  React.useEffect(() => {
    if (error && !postsData) {
      toast({
        title: "Connection Error",
        description: "Unable to load posts from server.",
        variant: "destructive",
      });
    }
  }, [error, postsData, toast]);
  
  // Use real data if available, show loading state or empty state appropriately
  const rawPosts = postsData || [];
  const posts: PostWithDetails[] = rawPosts.map(transformPostData);

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author?.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || post.category?.name === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await deleteMutation.mutateAsync(postId);
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
      onDeletePost?.(postId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    
    try {
      // Delete posts in parallel
      await Promise.all(
        selectedPosts.map(postId => deleteMutation.mutateAsync(postId))
      );
      
      toast({
        title: "Posts deleted",
        description: `Successfully deleted ${selectedPosts.length} post${selectedPosts.length !== 1 ? 's' : ''}.`,
      });
      
      // Clear selection
      setSelectedPosts([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some posts. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedPosts.length === 0) return;
    
    try {
      // Update posts in parallel
      await Promise.all(
        selectedPosts.map(async (postId) => {
          const response = await fetch(`/api/posts/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: newStatus,
              publishedAt: newStatus === 'published' ? new Date().toISOString() : undefined
            })
          });
          if (!response.ok) {
            throw new Error('Failed to update post');
          }
          return response.json();
        })
      );
      
      toast({
        title: "Posts updated",
        description: `Successfully updated ${selectedPosts.length} post${selectedPosts.length !== 1 ? 's' : ''} to ${newStatus}.`,
      });
      
      // Clear selection and refresh data
      setSelectedPosts([]);
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some posts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts([...selectedPosts, postId]);
    } else {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(filteredPosts.map(post => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const getStatusBadge = (status: PostWithDetails["status"]) => {
    const variants = {
      published: "default",
      draft: "secondary", 
      scheduled: "outline"
    } as const;
    
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const PostCard = ({ post }: { post: PostWithDetails }) => (
    <Card className="hover-elevate" data-testid={`post-card-${post.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Checkbox
              checked={selectedPosts.includes(post.id)}
              onCheckedChange={(checked) => handleSelectPost(post.id, !!checked)}
              data-testid={`post-checkbox-${post.id}`}
            />
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
              {post.title}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" data-testid={`post-menu-${post.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditPost?.(post.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreviewPost?.(post.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeletePost(post.id)}
                className="text-destructive focus:text-destructive"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(post.status)}
          <span className="text-xs text-muted-foreground">{post.category?.name || "Uncategorized"}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {post.author?.displayName.split(" ").map(n => n[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <span>{post.author?.displayName || "Unknown User"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{post.viewCount} views</span>
            <span>•</span>
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PostTableRow = ({ post }: { post: PostWithDetails }) => (
    <TableRow key={post.id} data-testid={`post-row-${post.id}`}>
      <TableCell className="w-12">
        <Checkbox
          checked={selectedPosts.includes(post.id)}
          onCheckedChange={(checked) => handleSelectPost(post.id, !!checked)}
          data-testid={`post-checkbox-${post.id}`}
        />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium line-clamp-1">{post.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</div>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(post.status)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {post.author?.displayName.split(" ").map(n => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{post.author?.displayName || "Unknown User"}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm">{post.category?.name || "Uncategorized"}</TableCell>
      <TableCell className="text-sm">{post.viewCount}</TableCell>
      <TableCell className="text-sm">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</TableCell>
      <TableCell className="w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`post-menu-${post.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditPost?.(post.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPreviewPost?.(post.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeletePost(post.id)}
              className="text-destructive focus:text-destructive"
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Page data-testid="all-posts-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle badge="124">
              All Posts
            </PageTitle>
            <PageActions>
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="view-grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                  data-testid="view-table"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Link href="/posts/new">
                  <Button data-testid="create-post-desktop">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </Link>
              </div>
            </PageActions>
          </PageToolbar>
          
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="search-posts"
                />
              </div>
              <FilterSheet title="Filter Posts">
                <FilterControls />
              </FilterSheet>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <LoadingCard count={6} />
            </div>
          ) : (
            <LoadingTable rows={10} columns={8} />
          )
        ) : filteredPosts.length === 0 ? (
          searchQuery || statusFilter !== "all" || categoryFilter !== "all" ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="No posts yet"
              description="Create your first post to get started with your content."
              action={onCreatePost ? {
                label: "Create Post",
                onClick: onCreatePost
              } : undefined}
            />
          )
        ) : (
          <>
            {/* Selection Bar */}
            {selectedPosts.length > 0 && (
              <div className="bg-muted/50 border rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkStatusChange("published")}
                      disabled={deleteMutation.isPending}
                    >
                      Publish Selected
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkStatusChange("draft")}
                      disabled={deleteMutation.isPending}
                    >
                      Make Draft
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive"
                      onClick={handleBulkDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete Selected"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Content */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="hidden md:block border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                          onCheckedChange={handleSelectAll}
                          data-testid="select-all-posts"
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map(post => (
                      <PostTableRow key={post.id} post={post} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </PageBody>

      {/* Mobile FAB */}
      <Link href="/posts/new">
        <FAB 
          aria-label="Create new post"
          data-testid="create-post-fab"
        >
          New Post
        </FAB>
      </Link>

      {/* Mobile Action Bar for bulk actions */}
      <ActionBar show={selectedPosts.length > 0}>
        <span className="text-sm font-medium">
          {selectedPosts.length} selected
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleBulkStatusChange("published")}
            disabled={deleteMutation.isPending}
          >
            Publish
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleBulkDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </ActionBar>
    </Page>
  );
}