import { useState } from "react";
import { TrendingUp, TrendingDown, Eye, Users, FileText, Calendar, Download, Filter, Monitor, Smartphone, Tablet } from "lucide-react";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

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

// Chart data and configurations
const trafficData = [
  { date: "Mar 1", views: 2400, visitors: 1200, pages: 3400 },
  { date: "Mar 5", views: 3200, visitors: 1800, pages: 4200 },
  { date: "Mar 10", views: 2800, visitors: 1600, pages: 3800 },
  { date: "Mar 15", views: 4100, visitors: 2300, pages: 5200 },
  { date: "Mar 20", views: 3600, visitors: 2000, pages: 4600 },
  { date: "Mar 25", views: 4800, visitors: 2700, pages: 6100 },
  { date: "Mar 30", views: 5200, visitors: 3000, pages: 6800 }
];

const deviceData = [
  { device: "Desktop", value: 64, count: 15736, color: "hsl(210, 85%, 55%)" },
  { device: "Mobile", value: 28, count: 6889, color: "hsl(120, 75%, 45%)" },
  { device: "Tablet", value: 8, count: 1966, color: "hsl(270, 75%, 55%)" }
];

const trafficChartConfig = {
  views: {
    label: "Views",
    color: "hsl(210, 85%, 55%)"
  },
  visitors: {
    label: "Visitors",
    color: "hsl(120, 75%, 45%)"
  },
  pages: {
    label: "Page Views",
    color: "hsl(270, 75%, 55%)"
  }
};

const deviceChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(210, 85%, 55%)"
  },
  mobile: {
    label: "Mobile",
    color: "hsl(120, 75%, 45%)"
  },
  tablet: {
    label: "Tablet",
    color: "hsl(270, 75%, 55%)"
  }
};

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover-elevate transition-all duration-200" data-testid={`content-${content.id}`}>
      <div className="flex-1 min-w-0 space-y-2 sm:space-y-1">
        <div className="flex items-start gap-2">
          <h4 className="font-medium line-clamp-2 flex-1">{content.title}</h4>
          <Badge variant="outline" className="capitalize text-xs shrink-0">
            {content.type}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <p className="text-sm text-muted-foreground">
            Published {new Date(content.publishDate).toLocaleDateString()}
          </p>
          {/* Mobile: Show stats inline */}
          <div className="flex items-center gap-3 sm:hidden">
            <span className="text-sm font-medium">{content.views.toLocaleString()} views</span>
            <span className="text-sm text-muted-foreground">{content.engagement}% engagement</span>
          </div>
        </div>
      </div>
      {/* Desktop: Show stats in column */}
      <div className="hidden sm:block text-right space-y-1 ml-4">
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
          {/* Traffic Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Website traffic trends over time</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trafficChartConfig} className="h-64 w-full">
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stackId="1"
                    stroke={trafficChartConfig.views.color}
                    fill={trafficChartConfig.views.color}
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stackId="1"
                    stroke={trafficChartConfig.visitors.color}
                    fill={trafficChartConfig.visitors.color}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Device Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">Traffic by device type</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mobile-first: Show bars on small screens */}
                <div className="md:hidden space-y-3">
                  {deviceData.map((device) => {
                    const Icon = device.device === "Desktop" ? Monitor : 
                                device.device === "Mobile" ? Smartphone : Tablet;
                    return (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: device.color }} />
                          <span className="text-sm font-medium">{device.device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${device.value}%`, 
                                backgroundColor: device.color 
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">
                            {device.value}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Desktop: Show pie chart */}
                <div className="hidden md:block">
                  <ChartContainer config={deviceChartConfig} className="h-48 w-full">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ device, value }) => `${device}: ${value}%`}
                        labelLine={false}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
                
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  {deviceData.map((device) => (
                    <div key={device.device} className="text-center">
                      <div className="text-lg font-semibold">{device.count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{device.device}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Content - Enhanced */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Top Performing Content</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredContent.length} {contentFilter === "all" ? "items" : contentFilter + "s"} shown
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {timePeriod === "7d" ? "Last week" : 
                 timePeriod === "30d" ? "Last month" : 
                 timePeriod === "90d" ? "Last quarter" : "Last year"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredContent.map((content, index) => (
                <div key={content.id} className="relative">
                  {/* Ranking indicator */}
                  <div className="absolute -left-1 top-3 w-1 h-6 bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 rounded-full opacity-60" 
                       style={{ opacity: 1 - (index * 0.15) }} />
                  <ContentRow content={content} />
                </div>
              ))}
              
              {filteredContent.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No content found for the selected filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Enhanced with better mobile UX */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Activity
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded-lg hover-elevate transition-all duration-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">New user registered from organic search</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago • From Google</p>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">+1 User</Badge>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground">SEO</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg hover-elevate transition-all duration-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Post "React Development" gained 50 new views</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago • Trending up</p>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">+50 Views</Badge>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg hover-elevate transition-all duration-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Social media referral increased by 15%</p>
                  <p className="text-xs text-muted-foreground">1 hour ago • Twitter, Facebook</p>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">+15% Referrals</Badge>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground">Social</div>
                </div>
              </div>
              
              {/* Mobile-specific: Show more button */}
              <div className="md:hidden pt-2">
                <Button variant="ghost" size="sm" className="w-full">
                  View All Activity
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  );
}