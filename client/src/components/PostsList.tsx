import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  MoreHorizontal,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PostsListProps {
  onCreatePost?: () => void;
  onEditPost?: (id: string) => void;
}

export default function PostsList({ onCreatePost, onEditPost }: PostsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // TODO: Remove mock data
  const posts = [
    {
      id: "1",
      title: "Getting Started with React Development",
      excerpt: "A comprehensive guide to building modern React applications...",
      status: "published",
      author: "John Doe",
      category: "Tutorial",
      publishDate: "2024-01-15",
      views: 1247,
      featured: true
    },
    {
      id: "2", 
      title: "Advanced TypeScript Patterns",
      excerpt: "Exploring advanced TypeScript features and design patterns...",
      status: "draft",
      author: "Jane Smith",
      category: "Programming",
      publishDate: null,
      views: 0,
      featured: false
    },
    {
      id: "3",
      title: "Database Design Best Practices", 
      excerpt: "Learn how to design scalable and efficient database schemas...",
      status: "scheduled",
      author: "Mike Johnson",
      category: "Database",
      publishDate: "2024-01-20",
      views: 0,
      featured: false
    },
    {
      id: "4",
      title: "Modern CSS Techniques",
      excerpt: "CSS Grid, Flexbox, and modern layout techniques explained...",
      status: "published",
      author: "Sarah Wilson",
      category: "CSS",
      publishDate: "2024-01-10",
      views: 856,
      featured: true
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      published: { variant: "default" as const, color: "bg-green-500" },
      draft: { variant: "secondary" as const, color: "bg-yellow-500" },
      scheduled: { variant: "outline" as const, color: "bg-blue-500" }
    };
    
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Posts</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your content and articles</p>
        </div>
        <Button onClick={onCreatePost} data-testid="button-create-post" size="sm" className="shrink-0">
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">New Post</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-posts-search"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-status-filter">
                  <Filter className="w-4 h-4 mr-2" />
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
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover-elevate" data-testid={`post-card-${post.id}`}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    {post.featured && (
                      <Badge variant="outline" className="text-xs">Featured</Badge>
                    )}
                    <Badge 
                      variant={getStatusBadge(post.status).variant}
                      className="text-xs capitalize"
                    >
                      {post.status}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{post.category}</span>
                    {post.publishDate && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.publishDate).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views.toLocaleString()} views
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid={`button-post-actions-${post.id}`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        onEditPost?.(post.id);
                        console.log(`Edit post: ${post.id}`);
                      }}
                      data-testid={`menu-edit-${post.id}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid={`menu-view-${post.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" data-testid={`menu-delete-${post.id}`}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 md:py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by creating your first post"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={onCreatePost} data-testid="button-create-first-post">
                <Plus className="w-4 h-4 mr-2" />
                Create your first post
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}