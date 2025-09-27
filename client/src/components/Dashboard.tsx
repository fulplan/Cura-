import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp, 
  Plus,
  Calendar,
  Image,
  Clock
} from "lucide-react";
import { useDashboardStats, usePopularPosts, mockDashboardStats } from "@/hooks/useDashboard";
import { LoadingCard } from "@/components/ui/loading";

interface DashboardProps {
  onQuickAction?: (action: string) => void;
}

export default function Dashboard({ onQuickAction }: DashboardProps) {
  // Fetch real dashboard data
  const { data: dashboardData, isLoading: isStatsLoading } = useDashboardStats();
  const { data: popularPosts, isLoading: isPostsLoading } = usePopularPosts(4);
  
  // Use real data if available, otherwise fall back to mock data
  const statsData = dashboardData || mockDashboardStats;
  const recentPostsData = popularPosts || mockDashboardStats.recentPosts;
  
  // Transform stats data for display
  const stats = [
    { title: "Total Posts", value: statsData.totalPosts?.toString() || "0", change: "+12%", icon: FileText },
    { title: "Published Posts", value: statsData.publishedPosts?.toString() || "0", change: "+8%", icon: Users },
    { title: "Categories", value: statsData.totalCategories?.toString() || "0", change: "+23%", icon: Eye },
    { title: "Total Users", value: statsData.totalUsers?.toString() || "0", change: "+5%", icon: TrendingUp },
  ];

  // Transform recent posts data for display
  const recentPosts = recentPostsData.slice(0, 4).map((post: any, index: number) => ({
    title: post.title,
    status: post.status,
    date: formatRelativeDate(post.createdAt),
    views: formatViewCount(post.viewCount || 0)
  }));
  
  // Helper functions
  function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return "Just now";
    }
  }
  
  function formatViewCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }

  const quickActions = [
    { label: "New Post", action: "new-post", icon: Plus },
    { label: "Schedule Content", action: "schedule", icon: Calendar },
    { label: "Upload Media", action: "upload", icon: Image },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-success text-success-foreground";
      case "draft": return "bg-warning text-warning-foreground";
      case "scheduled": return "bg-info text-info-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="type-hero mb-2" data-testid="text-dashboard-title">Welcome back!</h1>
        <p className="type-body-large text-muted-foreground">Here's what's happening with your content today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {isStatsLoading ? (
          // Loading state for stats cards
          Array.from({ length: 4 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : (
          stats.map((stat, index) => (
            <Card key={index} data-testid={`card-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="type-overline">{stat.title}</p>
                    <p className="type-heading num">{stat.value}</p>
                    <p className={`type-caption num ${stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>{stat.change}</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2">
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest content activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isPostsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-2 md:p-3 rounded interactive-slow hover-elevate focus-ring mobile-touch-target" data-testid={`post-item-${index}`}>
                    <div className="flex-1">
                      <h4 className="type-body font-medium">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`w-2 h-2 p-0 rounded-full ${getStatusColor(post.status)}`} />
                        <span className="text-xs text-muted-foreground capitalize">{post.status}</span>
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium num">{post.views}</p>
                      <p className="type-caption">views</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent posts found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-4 md:p-6 text-left interactive focus-ring mobile-touch-target"
                  onClick={() => {
                    onQuickAction?.(action.action);
                    console.log(`Quick action: ${action.action}`);
                  }}
                  data-testid={`button-${action.action}`}
                >
                  <action.icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">{action.label}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}