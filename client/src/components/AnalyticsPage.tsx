import { useState } from "react";
import { TrendingUp, TrendingDown, Eye, Users, FileText, Calendar, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody, 
  PageActions,
  FilterSheet
} from "@/components/ui/page";

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: any;
}

interface TopContent {
  id: string;
  title: string;
  type: "post" | "page";
  views: number;
  engagement: number;
  publishDate: string;
}

interface AnalyticsPageProps {
  onExport?: (format: string, period: string) => void;
}

// Mock data
const mockMetrics: MetricCard[] = [
  {
    title: "Total Views",
    value: "24,580",
    change: "+12.5%",
    trend: "up",
    icon: Eye
  },
  {
    title: "Unique Visitors",
    value: "8,241",
    change: "+8.2%",
    trend: "up",
    icon: Users
  },
  {
    title: "Published Posts",
    value: "42",
    change: "+3",
    trend: "up",
    icon: FileText
  },
  {
    title: "Avg. Session Duration",
    value: "3m 42s",
    change: "-5.3%",
    trend: "down",
    icon: Calendar
  }
];

const mockTopContent: TopContent[] = [
  {
    id: "1",
    title: "Getting Started with React Development",
    type: "post",
    views: 3420,
    engagement: 85,
    publishDate: "2024-03-15"
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    type: "post", 
    views: 2680,
    engagement: 78,
    publishDate: "2024-03-10"
  },
  {
    id: "3",
    title: "About Our Company",
    type: "page",
    views: 1940,
    engagement: 45,
    publishDate: "2024-02-28"
  },
  {
    id: "4",
    title: "Modern CSS Techniques",
    type: "post",
    views: 1580,
    engagement: 72,
    publishDate: "2024-03-08"
  },
  {
    id: "5",
    title: "Contact Us",
    type: "page",
    views: 1320,
    engagement: 35,
    publishDate: "2024-02-15"
  }
];

export default function AnalyticsPage({ 
  onExport = (format, period) => console.log("Export analytics:", format, period)
}: AnalyticsPageProps) {
  const [timePeriod, setTimePeriod] = useState("30d");
  const [contentFilter, setContentFilter] = useState("all");

  const filteredContent = mockTopContent.filter(content => {
    if (contentFilter === "all") return true;
    return content.type === contentFilter;
  });

  const MetricCard = ({ metric }: { metric: MetricCard }) => {
    const Icon = metric.icon;
    const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : null;
    
    return (
      <Card data-testid={`metric-${metric.title.toLowerCase().replace(/\s+/g, "-")}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metric.value}</div>
          <div className="flex items-center gap-1 text-xs">
            {TrendIcon && (
              <TrendIcon className={`h-3 w-3 ${
                metric.trend === "up" ? "text-green-600" : "text-red-600"
              }`} />
            )}
            <span className={`${
              metric.trend === "up" ? "text-green-600" : 
              metric.trend === "down" ? "text-red-600" : "text-muted-foreground"
            }`}>
              {metric.change}
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ContentRow = ({ content }: { content: TopContent }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`content-${content.id}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium line-clamp-1">{content.title}</h4>
          <Badge variant="outline" className="capitalize text-xs">
            {content.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Published {new Date(content.publishDate).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right space-y-1">
        <div className="font-medium">{content.views.toLocaleString()} views</div>
        <div className="text-sm text-muted-foreground">{content.engagement}% engagement</div>
      </div>
    </div>
  );

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Time Period</label>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Content Type</label>
        <Select value={contentFilter} onValueChange={setContentFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="post">Posts Only</SelectItem>
            <SelectItem value="page">Pages Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Page data-testid="analytics-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle>
              Analytics & Reports
            </PageTitle>
            <PageActions>
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onExport("pdf", timePeriod)}
                  data-testid="export-pdf"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onExport("csv", timePeriod)}
                  data-testid="export-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </PageActions>
          </PageToolbar>
          
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <FilterSheet title="Analytics Filters">
                <FilterControls />
              </FilterSheet>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={contentFilter} onValueChange={setContentFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mockMetrics.map(metric => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Chart visualization would go here</p>
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Desktop</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-16 h-full bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">64%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mobile</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-12 h-full bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">28%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tablet</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-2 h-full bg-purple-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">8%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Content */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredContent.map(content => (
                <ContentRow key={content.id} content={content} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">New user registered from organic search</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Post "React Development" gained 50 new views</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Social media referral increased by 15%</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  );
}