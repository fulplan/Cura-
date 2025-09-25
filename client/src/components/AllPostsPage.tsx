import { useState } from "react";
import { Link } from "wouter";
import { Search, Filter, MoreHorizontal, Edit, Eye, Trash2, Plus, Grid, List } from "lucide-react";
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
import { EmptyStates } from "@/components/ui/empty-state";
import { LoadingCard, LoadingTable } from "@/components/ui/loading";

interface Post {
  id: string;
  title: string;
  status: "published" | "draft" | "scheduled";
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  publishDate: string;
  views: number;
  excerpt: string;
}

interface AllPostsPageProps {
  onCreatePost?: () => void;
  onEditPost?: (id: string) => void;
  onPreviewPost?: (id: string) => void;
  onDeletePost?: (id: string) => void;
}

// Mock data - in real app, this would come from API
const mockPosts: Post[] = [
  {
    id: "1",
    title: "Getting Started with React and TypeScript",
    status: "published",
    author: { name: "Sarah Chen", avatar: "/avatars/sarah.jpg" },
    category: "Development",
    publishDate: "2024-03-15",
    views: 1247,
    excerpt: "Learn how to set up a modern React project with TypeScript for better development experience..."
  },
  {
    id: "2", 
    title: "10 Tips for Better UI Design",
    status: "draft",
    author: { name: "Mike Johnson", avatar: "/avatars/mike.jpg" },
    category: "Design",
    publishDate: "2024-03-20",
    views: 0,
    excerpt: "Discover essential UI design principles that will improve your user interface designs..."
  },
  {
    id: "3",
    title: "The Future of Web Development",
    status: "scheduled",
    author: { name: "Alex Rivera", avatar: "/avatars/alex.jpg" },
    category: "Technology",
    publishDate: "2024-03-25",
    views: 0,
    excerpt: "Exploring upcoming trends and technologies that will shape the future of web development..."
  }
];

export default function AllPostsPage({ 
  onCreatePost = () => console.log("Create post"),
  onEditPost = (id) => console.log("Edit post:", id),
  onPreviewPost = (id) => console.log("Preview post:", id),
  onDeletePost = (id) => console.log("Delete post:", id)
}: AllPostsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter posts based on search and filters
  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  const getStatusBadge = (status: Post["status"]) => {
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

  const PostCard = ({ post }: { post: Post }) => (
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
              <DropdownMenuItem onClick={() => onEditPost(post.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreviewPost(post.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeletePost(post.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(post.status)}
          <span className="text-xs text-muted-foreground">{post.category}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="text-xs">
                {post.author.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{post.views} views</span>
            <span>•</span>
            <span>{new Date(post.publishDate).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PostTableRow = ({ post }: { post: Post }) => (
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
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="text-xs">
              {post.author.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{post.author.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm">{post.category}</TableCell>
      <TableCell className="text-sm">{post.views}</TableCell>
      <TableCell className="text-sm">{new Date(post.publishDate).toLocaleDateString()}</TableCell>
      <TableCell className="w-12">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`post-menu-${post.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditPost(post.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPreviewPost(post.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeletePost(post.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
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
            <EmptyStates.Posts onCreatePost={onCreatePost} />
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
                    <Button variant="outline" size="sm">
                      Bulk Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      Delete Selected
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
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </ActionBar>
    </Page>
  );
}