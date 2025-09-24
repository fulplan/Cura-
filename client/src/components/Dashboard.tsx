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

interface DashboardProps {
  onQuickAction?: (action: string) => void;
}

export default function Dashboard({ onQuickAction }: DashboardProps) {
  // TODO: Remove mock data
  const stats = [
    { title: "Total Posts", value: "124", change: "+12%", icon: FileText, color: "text-blue-500" },
    { title: "Active Users", value: "48", change: "+8%", icon: Users, color: "text-green-500" },
    { title: "Page Views", value: "15.2k", change: "+23%", icon: Eye, color: "text-purple-500" },
    { title: "Monthly Growth", value: "18%", change: "+5%", icon: TrendingUp, color: "text-orange-500" },
  ];

  const recentPosts = [
    { title: "Getting Started with React", status: "published", date: "2 hours ago", views: "1.2k" },
    { title: "Advanced TypeScript Tips", status: "draft", date: "1 day ago", views: "0" },
    { title: "Database Design Principles", status: "scheduled", date: "Tomorrow", views: "0" },
    { title: "API Best Practices", status: "published", date: "3 days ago", views: "856" },
  ];

  const quickActions = [
    { label: "New Post", action: "new-post", icon: Plus },
    { label: "Schedule Content", action: "schedule", icon: Calendar },
    { label: "Upload Media", action: "upload", icon: Image },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-500";
      case "draft": return "bg-yellow-500";
      case "scheduled": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-2" data-testid="text-dashboard-title">Welcome back!</h1>
        <p className="text-muted-foreground text-sm md:text-base">Here's what's happening with your content today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-500">{stat.change}</p>
                </div>
                <stat.icon className={`w-6 h-6 md:w-8 md:h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest content activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-2 md:p-3 rounded hover-elevate" data-testid={`post-item-${index}`}>
                  <div className="flex-1">
                    <h4 className="font-medium">{post.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={`w-2 h-2 p-0 rounded-full ${getStatusColor(post.status)}`} />
                      <span className="text-xs text-muted-foreground capitalize">{post.status}</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{post.views}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
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
                  className="justify-start h-auto p-3 md:p-4 text-left"
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