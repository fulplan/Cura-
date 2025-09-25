import { useState } from "react";
import { Calendar, Clock, Plus, Filter, MoreHorizontal, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody, 
  PageActions,
  FAB,
  FilterSheet
} from "@/components/ui/page";
import { EmptyStates } from "@/components/ui/empty-state";

interface ScheduledPost {
  id: string;
  title: string;
  type: "post" | "page" | "social";
  scheduledDate: string;
  status: "scheduled" | "published" | "failed" | "cancelled";
  author: string;
  platform?: string;
}

interface SchedulingPageProps {
  onCreateSchedule?: () => void;
  onEditSchedule?: (id: string) => void;
  onDeleteSchedule?: (id: string) => void;
  onPublishNow?: (id: string) => void;
}

// Mock data
const mockScheduledPosts: ScheduledPost[] = [
  {
    id: "1",
    title: "Getting Started with React Development",
    type: "post",
    scheduledDate: "2024-03-20T10:00:00",
    status: "scheduled",
    author: "John Doe"
  },
  {
    id: "2",
    title: "New Product Launch Announcement",
    type: "social",
    scheduledDate: "2024-03-19T14:30:00",
    status: "published",
    author: "Marketing Team",
    platform: "Twitter"
  },
  {
    id: "3",
    title: "Weekly Newsletter Content",
    type: "post",
    scheduledDate: "2024-03-21T09:00:00",
    status: "failed",
    author: "Jane Smith"
  },
  {
    id: "4",
    title: "About Us Page Update",
    type: "page",
    scheduledDate: "2024-03-22T16:00:00",
    status: "scheduled",
    author: "Admin"
  }
];

export default function SchedulingPage({ 
  onCreateSchedule = () => console.log("Create schedule"),
  onEditSchedule = (id) => console.log("Edit schedule:", id),
  onDeleteSchedule = (id) => console.log("Delete schedule:", id),
  onPublishNow = (id) => console.log("Publish now:", id)
}: SchedulingPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredPosts = mockScheduledPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesType = typeFilter === "all" || post.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: ScheduledPost["status"]) => {
    const variants = {
      scheduled: { variant: "secondary" as const, icon: Clock },
      published: { variant: "default" as const, icon: CheckCircle },
      failed: { variant: "destructive" as const, icon: AlertCircle },
      cancelled: { variant: "outline" as const, icon: AlertCircle }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="capitalize flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: ScheduledPost["type"]) => {
    const colors = {
      post: "bg-blue-100 text-blue-800",
      page: "bg-green-100 text-green-800", 
      social: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge variant="outline" className={`capitalize ${colors[type]}`}>
        {type}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString();
    
    let relative = "";
    if (diffDays === 0) relative = "Today";
    else if (diffDays === 1) relative = "Tomorrow";
    else if (diffDays === -1) relative = "Yesterday";
    else if (diffDays > 1) relative = `In ${diffDays} days`;
    else if (diffDays < -1) relative = `${Math.abs(diffDays)} days ago`;
    
    return { timeStr, dateStr, relative };
  };

  const ScheduleCard = ({ post }: { post: ScheduledPost }) => {
    const { timeStr, dateStr, relative } = formatDateTime(post.scheduledDate);
    
    return (
      <Card className="hover-elevate" data-testid={`schedule-card-${post.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base line-clamp-2 mb-2">{post.title}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(post.status)}
                {getTypeBadge(post.type)}
                {post.platform && (
                  <Badge variant="outline" className="text-xs">
                    {post.platform}
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0" data-testid={`schedule-menu-${post.id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditSchedule(post.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {post.status === "scheduled" && (
                  <DropdownMenuItem onClick={() => onPublishNow(post.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Now
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDeleteSchedule(post.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              By {post.author}
            </div>
            <div className="text-right">
              <div className="font-medium">{relative}</div>
              <div className="text-xs text-muted-foreground">
                {dateStr} at {timeStr}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="page">Pages</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const scheduledCount = mockScheduledPosts.filter(p => p.status === "scheduled").length;
  const failedCount = mockScheduledPosts.filter(p => p.status === "failed").length;

  return (
    <Page data-testid="scheduling-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle badge={scheduledCount.toString()}>
              Scheduling
            </PageTitle>
            <PageActions>
              <div className="hidden md:flex items-center gap-2">
                <Button onClick={onCreateSchedule} data-testid="create-schedule-desktop">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Content
                </Button>
              </div>
            </PageActions>
          </PageToolbar>
          
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search scheduled content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="search-scheduled"
                />
              </div>
              <FilterSheet title="Filter Schedule">
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{scheduledCount}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockScheduledPosts.filter(p => p.status === "published").length}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{mockScheduledPosts.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
        </div>

        {filteredPosts.length === 0 ? (
          searchQuery || statusFilter !== "all" || typeFilter !== "all" ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No scheduled content found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <EmptyStates.Schedule onCreateSchedule={onCreateSchedule} />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map(post => (
              <ScheduleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </PageBody>

      {/* Mobile FAB */}
      <FAB 
        onClick={onCreateSchedule}
        aria-label="Schedule new content"
        data-testid="schedule-fab"
      >
        Schedule
      </FAB>
    </Page>
  );
}