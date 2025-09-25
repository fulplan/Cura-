import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody, 
  PageActions,
  ActionBar
} from "@/components/ui/page";
import { 
  Layout,
  Sidebar,
  FileText,
  Search,
  Mail,
  Share2,
  Calendar,
  BarChart3,
  Users,
  MessageSquare,
  Image,
  Tag,
  Clock,
  Save,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Copy,
  Edit3,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Tablet,
  Monitor
} from "lucide-react";

interface Widget {
  id: string;
  type: "recent-posts" | "search" | "newsletter" | "social-feed" | "calendar" | "analytics" | "users" | "comments" | "image-gallery" | "tag-cloud" | "clock";
  name: string;
  description: string;
  icon: any;
  category: "content" | "engagement" | "utility" | "social";
  settings: Record<string, any>;
  isActive: boolean;
}

interface LayoutZone {
  id: string;
  name: string;
  description: string;
  position: "left-sidebar" | "right-sidebar" | "footer" | "header" | "mobile-drawer";
  maxWidgets: number;
  widgets: string[]; // widget IDs
  isActive: boolean;
  responsive: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
}

interface WidgetsManagerPageProps {
  onSave?: (widgetsData: any) => void;
  onPreview?: (widgetsData: any) => void;
}

export default function WidgetsManagerPage({ 
  onSave = (data) => console.log("Save widgets:", data),
  onPreview = (data) => console.log("Preview widgets:", data)
}: WidgetsManagerPageProps) {
  const [activeTab, setActiveTab] = useState("library");
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isDirty, setIsDirty] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Widget Library
  const [widgetLibrary, setWidgetLibrary] = useState<Widget[]>([
    {
      id: "recent-posts-1",
      type: "recent-posts",
      name: "Recent Posts",
      description: "Display latest blog posts with thumbnails",
      icon: FileText,
      category: "content",
      settings: {
        count: 5,
        showThumbnails: true,
        showDate: true,
        showExcerpt: false,
        title: "Latest Posts"
      },
      isActive: true
    },
    {
      id: "search-1", 
      type: "search",
      name: "Site Search",
      description: "Search box for content discovery",
      icon: Search,
      category: "utility",
      settings: {
        placeholder: "Search...",
        showCategories: false,
        title: "Search"
      },
      isActive: true
    },
    {
      id: "newsletter-1",
      type: "newsletter",
      name: "Newsletter Signup",
      description: "Email subscription form",
      icon: Mail,
      category: "engagement",
      settings: {
        title: "Subscribe",
        description: "Get updates in your inbox",
        buttonText: "Subscribe",
        showPrivacyNote: true
      },
      isActive: true
    },
    {
      id: "social-feed-1",
      type: "social-feed",
      name: "Social Media Feed",
      description: "Display social media posts",
      icon: Share2,
      category: "social",
      settings: {
        platform: "twitter",
        count: 3,
        showAuthor: true,
        title: "Follow Us"
      },
      isActive: false
    },
    {
      id: "calendar-1",
      type: "calendar",
      name: "Event Calendar",
      description: "Upcoming events and dates",
      icon: Calendar,
      category: "utility",
      settings: {
        view: "upcoming",
        count: 5,
        showTime: true,
        title: "Upcoming Events"
      },
      isActive: false
    },
    {
      id: "analytics-1",
      type: "analytics",
      name: "Quick Stats",
      description: "Basic site analytics widget",
      icon: BarChart3,
      category: "utility",
      settings: {
        metrics: ["views", "visitors"],
        period: "week",
        title: "Site Stats"
      },
      isActive: false
    }
  ]);

  // Layout Zones
  const [layoutZones, setLayoutZones] = useState<LayoutZone[]>([
    {
      id: "left-sidebar",
      name: "Left Sidebar",
      description: "Main sidebar for navigation and widgets",
      position: "left-sidebar",
      maxWidgets: 6,
      widgets: ["recent-posts-1", "search-1"],
      isActive: true,
      responsive: {
        mobile: false,
        tablet: true,
        desktop: true
      }
    },
    {
      id: "right-sidebar",
      name: "Right Sidebar",
      description: "Secondary sidebar for additional content",
      position: "right-sidebar",
      maxWidgets: 4,
      widgets: ["newsletter-1"],
      isActive: true,
      responsive: {
        mobile: false,
        tablet: false,
        desktop: true
      }
    },
    {
      id: "footer-widgets",
      name: "Footer Widgets",
      description: "Footer area for contact and links",
      position: "footer",
      maxWidgets: 8,
      widgets: [],
      isActive: true,
      responsive: {
        mobile: true,
        tablet: true,
        desktop: true
      }
    },
    {
      id: "mobile-drawer",
      name: "Mobile Menu",
      description: "Mobile-only collapsible menu area",
      position: "mobile-drawer",
      maxWidgets: 3,
      widgets: [],
      isActive: true,
      responsive: {
        mobile: true,
        tablet: false,
        desktop: false
      }
    }
  ]);

  const handleWidgetDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleZoneDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (draggedWidget) {
      const zone = layoutZones.find(z => z.id === zoneId);
      if (zone && zone.widgets.length < zone.maxWidgets) {
        // Check if widget is already in zone
        if (!zone.widgets.includes(draggedWidget)) {
          setLayoutZones(layoutZones.map(z => 
            z.id === zoneId 
              ? { ...z, widgets: [...z.widgets, draggedWidget] }
              : z
          ));
          setIsDirty(true);
        }
      }
    }
    setDraggedWidget(null);
  };

  const removeWidgetFromZone = (zoneId: string, widgetId: string) => {
    setLayoutZones(layoutZones.map(z => 
      z.id === zoneId 
        ? { ...z, widgets: z.widgets.filter(w => w !== widgetId) }
        : z
    ));
    setIsDirty(true);
  };

  const reorderWidgetInZone = (zoneId: string, widgetId: string, direction: "up" | "down") => {
    const zone = layoutZones.find(z => z.id === zoneId);
    if (!zone) return;

    const currentIndex = zone.widgets.indexOf(widgetId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= zone.widgets.length) return;

    const newWidgets = [...zone.widgets];
    [newWidgets[currentIndex], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[currentIndex]];

    setLayoutZones(layoutZones.map(z => 
      z.id === zoneId ? { ...z, widgets: newWidgets } : z
    ));
    setIsDirty(true);
  };

  const updateWidgetSetting = (widgetId: string, setting: string, value: any) => {
    setWidgetLibrary(widgetLibrary.map(w => 
      w.id === widgetId 
        ? { ...w, settings: { ...w.settings, [setting]: value } }
        : w
    ));
    setIsDirty(true);
  };

  const toggleWidget = (widgetId: string) => {
    setWidgetLibrary(widgetLibrary.map(w => 
      w.id === widgetId ? { ...w, isActive: !w.isActive } : w
    ));
    setIsDirty(true);
  };

  const toggleZone = (zoneId: string) => {
    setLayoutZones(layoutZones.map(z => 
      z.id === zoneId ? { ...z, isActive: !z.isActive } : z
    ));
    setIsDirty(true);
  };

  const updateZoneResponsive = (zoneId: string, device: keyof LayoutZone["responsive"], enabled: boolean) => {
    setLayoutZones(layoutZones.map(z => 
      z.id === zoneId 
        ? { ...z, responsive: { ...z.responsive, [device]: enabled } }
        : z
    ));
    setIsDirty(true);
  };

  const handleSave = () => {
    const widgetsData = {
      widgets: widgetLibrary,
      zones: layoutZones,
      settings: { previewDevice }
    };
    onSave(widgetsData);
    setIsDirty(false);
  };

  const handlePreview = () => {
    const widgetsData = {
      widgets: widgetLibrary,
      zones: layoutZones,
      settings: { previewDevice }
    };
    onPreview(widgetsData);
  };

  const getDeviceIcon = (device: typeof previewDevice) => {
    switch (device) {
      case "mobile": return Smartphone;
      case "tablet": return Tablet;
      case "desktop": return Monitor;
      default: return Monitor;
    }
  };

  const getCategoryColor = (category: Widget["category"]) => {
    switch (category) {
      case "content": return "bg-blue-500";
      case "engagement": return "bg-green-500";
      case "utility": return "bg-purple-500";
      case "social": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const WidgetLibrary = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["content", "engagement", "utility", "social"].map((category) => {
          const categoryWidgets = widgetLibrary.filter(w => w.category === category);
          const activeCount = categoryWidgets.filter(w => w.isActive).length;
          
          return (
            <Card key={category} className="text-center">
              <CardContent className="p-4">
                <div className={`w-12 h-12 rounded-lg ${getCategoryColor(category as Widget["category"])} mx-auto mb-3 flex items-center justify-center`}>
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium capitalize mb-1">{category}</h3>
                <p className="text-sm text-muted-foreground">{activeCount}/{categoryWidgets.length} active</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Widget List */}
      <div className="space-y-4">
        {["content", "engagement", "utility", "social"].map((category) => {
          const categoryWidgets = widgetLibrary.filter(w => w.category === category);
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <div className={`w-4 h-4 rounded ${getCategoryColor(category as Widget["category"])}`} />
                  {category} Widgets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryWidgets.map((widget) => {
                    const IconComponent = widget.icon;
                    return (
                      <Card 
                        key={widget.id}
                        className={`cursor-move transition-all hover:shadow-md ${
                          draggedWidget === widget.id ? 'opacity-50' : ''
                        } ${!widget.isActive ? 'opacity-60' : ''}`}
                        draggable={widget.isActive}
                        onDragStart={(e) => widget.isActive && handleWidgetDragStart(e, widget.id)}
                        data-testid={`widget-${widget.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <IconComponent className="w-8 h-8 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium truncate">{widget.name}</h4>
                                <Switch
                                  checked={widget.isActive}
                                  onCheckedChange={() => toggleWidget(widget.id)}
                                  data-testid={`toggle-${widget.id}`}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{widget.description}</p>
                              
                              {widget.isActive && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedWidget(widget.id)}
                                    data-testid={`settings-${widget.id}`}
                                  >
                                    <Settings className="w-3 h-3 mr-1" />
                                    Settings
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const LayoutZones = () => (
    <div className="space-y-6">
      {/* Zone Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {layoutZones.map((zone) => (
          <Card key={zone.id} className={!zone.isActive ? 'opacity-60' : ''}>
            <CardContent className="p-4 text-center">
              <Sidebar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium mb-1">{zone.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {zone.widgets.length}/{zone.maxWidgets} widgets
              </p>
              <Switch
                checked={zone.isActive}
                onCheckedChange={() => toggleZone(zone.id)}
                data-testid={`toggle-zone-${zone.id}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Zone Management */}
      <div className="space-y-4">
        {layoutZones.map((zone) => (
          <Card key={zone.id} className={!zone.isActive ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sidebar className="w-4 h-4" />
                    {zone.name}
                    <Badge variant="secondary">
                      {zone.widgets.length}/{zone.maxWidgets}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{zone.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  data-testid={`configure-zone-${zone.id}`}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Responsive Settings */}
              {selectedZone === zone.id && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-3">Device Visibility</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(zone.responsive).map(([device, enabled]) => {
                      const DeviceIcon = getDeviceIcon(device as keyof LayoutZone["responsive"]);
                      return (
                        <div key={device} className="flex items-center gap-2">
                          <DeviceIcon className="w-4 h-4" />
                          <span className="capitalize text-sm">{device}</span>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => updateZoneResponsive(zone.id, device as keyof LayoutZone["responsive"], checked)}
                            data-testid={`responsive-${zone.id}-${device}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Drop Zone */}
              <div 
                className={`min-h-32 border-2 border-dashed rounded-lg p-4 transition-colors ${
                  draggedWidget ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                } ${zone.widgets.length >= zone.maxWidgets ? 'opacity-50' : ''}`}
                onDragOver={handleZoneDragOver}
                onDrop={(e) => handleZoneDrop(e, zone.id)}
                data-testid={`drop-zone-${zone.id}`}
              >
                {zone.widgets.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <p>Drag widgets here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {zone.widgets.map((widgetId, index) => {
                      const widget = widgetLibrary.find(w => w.id === widgetId);
                      if (!widget) return null;
                      
                      const IconComponent = widget.icon;
                      return (
                        <div 
                          key={widgetId}
                          className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:shadow-sm"
                          data-testid={`zone-widget-${widgetId}`}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <IconComponent className="w-4 h-4 text-primary" />
                          <span className="flex-1 font-medium">{widget.name}</span>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => reorderWidgetInZone(zone.id, widgetId, "up")}
                              disabled={index === 0}
                              data-testid={`move-up-${widgetId}`}
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => reorderWidgetInZone(zone.id, widgetId, "down")}
                              disabled={index === zone.widgets.length - 1}
                              data-testid={`move-down-${widgetId}`}
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6"
                              onClick={() => removeWidgetFromZone(zone.id, widgetId)}
                              data-testid={`remove-${widgetId}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const WidgetSettings = () => {
    const widget = selectedWidget ? widgetLibrary.find(w => w.id === selectedWidget) : null;
    
    if (!widget) {
      return (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Widget Selected</h3>
          <p className="text-muted-foreground">Select a widget from the library to configure its settings</p>
        </div>
      );
    }

    const IconComponent = widget.icon;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="w-5 h-5" />
              {widget.name} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Common Settings */}
            <div className="space-y-2">
              <Label htmlFor="widget-title">Widget Title</Label>
              <Input
                id="widget-title"
                value={widget.settings.title || widget.name}
                onChange={(e) => updateWidgetSetting(widget.id, "title", e.target.value)}
                data-testid="widget-title"
              />
            </div>

            {/* Widget-specific Settings */}
            {widget.type === "recent-posts" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="posts-count">Number of Posts</Label>
                    <Select 
                      value={widget.settings.count?.toString()} 
                      onValueChange={(value) => updateWidgetSetting(widget.id, "count", parseInt(value))}
                    >
                      <SelectTrigger data-testid="posts-count">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 posts</SelectItem>
                        <SelectItem value="5">5 posts</SelectItem>
                        <SelectItem value="10">10 posts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Show Thumbnails</Label>
                    <Switch
                      checked={widget.settings.showThumbnails}
                      onCheckedChange={(checked) => updateWidgetSetting(widget.id, "showThumbnails", checked)}
                      data-testid="show-thumbnails"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Date</Label>
                    <Switch
                      checked={widget.settings.showDate}
                      onCheckedChange={(checked) => updateWidgetSetting(widget.id, "showDate", checked)}
                      data-testid="show-date"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Excerpt</Label>
                    <Switch
                      checked={widget.settings.showExcerpt}
                      onCheckedChange={(checked) => updateWidgetSetting(widget.id, "showExcerpt", checked)}
                      data-testid="show-excerpt"
                    />
                  </div>
                </div>
              </>
            )}

            {widget.type === "search" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="search-placeholder">Placeholder Text</Label>
                  <Input
                    id="search-placeholder"
                    value={widget.settings.placeholder}
                    onChange={(e) => updateWidgetSetting(widget.id, "placeholder", e.target.value)}
                    data-testid="search-placeholder"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Categories Filter</Label>
                  <Switch
                    checked={widget.settings.showCategories}
                    onCheckedChange={(checked) => updateWidgetSetting(widget.id, "showCategories", checked)}
                    data-testid="show-categories"
                  />
                </div>
              </>
            )}

            {widget.type === "newsletter" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newsletter-description">Description</Label>
                  <Textarea
                    id="newsletter-description"
                    value={widget.settings.description}
                    onChange={(e) => updateWidgetSetting(widget.id, "description", e.target.value)}
                    className="h-20"
                    data-testid="newsletter-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="button-text">Button Text</Label>
                  <Input
                    id="button-text"
                    value={widget.settings.buttonText}
                    onChange={(e) => updateWidgetSetting(widget.id, "buttonText", e.target.value)}
                    data-testid="button-text"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Privacy Note</Label>
                  <Switch
                    checked={widget.settings.showPrivacyNote}
                    onCheckedChange={(checked) => updateWidgetSetting(widget.id, "showPrivacyNote", checked)}
                    data-testid="show-privacy-note"
                  />
                </div>
              </>
            )}

            {widget.type === "social-feed" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="social-platform">Platform</Label>
                  <Select 
                    value={widget.settings.platform} 
                    onValueChange={(value) => updateWidgetSetting(widget.id, "platform", value)}
                  >
                    <SelectTrigger data-testid="social-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feed-count">Number of Posts</Label>
                  <Select 
                    value={widget.settings.count?.toString()} 
                    onValueChange={(value) => updateWidgetSetting(widget.id, "count", parseInt(value))}
                  >
                    <SelectTrigger data-testid="feed-count">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 post</SelectItem>
                      <SelectItem value="3">3 posts</SelectItem>
                      <SelectItem value="5">5 posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const PreviewPanel = () => (
    <div className="space-y-4">
      {/* Device Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Layout Preview</h3>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          {(["mobile", "tablet", "desktop"] as const).map((device) => {
            const DeviceIcon = getDeviceIcon(device);
            return (
              <Button
                key={device}
                variant={previewDevice === device ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewDevice(device)}
                data-testid={`preview-${device}`}
              >
                <DeviceIcon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Preview Layout */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className={`transition-all duration-300 ${
          previewDevice === "mobile" ? "max-w-sm mx-auto" :
          previewDevice === "tablet" ? "max-w-2xl mx-auto" : "w-full"
        }`}>
          <div className="bg-background border rounded-lg overflow-hidden min-h-96">
            {/* Preview content based on device */}
            <div className={`grid gap-4 p-4 ${
              previewDevice === "desktop" ? "grid-cols-4" :
              previewDevice === "tablet" ? "grid-cols-3" : "grid-cols-1"
            }`}>
              {/* Main Content Area */}
              <div className={`${
                previewDevice === "desktop" ? "col-span-2" :
                previewDevice === "tablet" ? "col-span-2" : "col-span-1"
              } bg-muted/30 rounded-lg p-4 h-48 flex items-center justify-center`}>
                <span className="text-muted-foreground">Main Content</span>
              </div>

              {/* Sidebars */}
              {layoutZones
                .filter(zone => zone.isActive && zone.responsive[previewDevice])
                .map((zone) => (
                  <div key={zone.id} className="space-y-2">
                    <h4 className="text-sm font-medium">{zone.name}</h4>
                    <div className="space-y-2">
                      {zone.widgets.map((widgetId) => {
                        const widget = widgetLibrary.find(w => w.id === widgetId);
                        if (!widget || !widget.isActive) return null;
                        
                        const IconComponent = widget.icon;
                        return (
                          <div key={widgetId} className="bg-background border rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">{widget.settings.title || widget.name}</span>
                            </div>
                            <div className="h-8 bg-muted/50 rounded text-xs flex items-center justify-center text-muted-foreground">
                              Widget Content
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Page data-testid="widgets-manager-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle>
              Sidebars & Widgets
            </PageTitle>
            <PageActions>
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePreview}
                  data-testid="preview-widgets"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                {isDirty && (
                  <Button onClick={handleSave} data-testid="save-widgets-desktop">
                    <Save className="h-4 w-4 mr-2" />
                    Save Layout
                  </Button>
                )}
              </div>
            </PageActions>
          </PageToolbar>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full max-w-lg">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Widget Library
            </TabsTrigger>
            <TabsTrigger value="zones" className="flex items-center gap-2">
              <Sidebar className="h-4 w-4" />
              Layout Zones
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="library">
            <WidgetLibrary />
          </TabsContent>
          
          <TabsContent value="zones">
            <LayoutZones />
          </TabsContent>
          
          <TabsContent value="settings">
            <WidgetSettings />
          </TabsContent>
          
          <TabsContent value="preview">
            <PreviewPanel />
          </TabsContent>
        </Tabs>
      </PageBody>

      {/* Mobile Action Bar */}
      <ActionBar show={isDirty}>
        <span className="text-sm">Unsaved changes</span>
        <div className="flex gap-2">
          <Button onClick={handlePreview} size="sm" variant="outline" data-testid="preview-widgets-mobile">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button onClick={handleSave} size="sm" data-testid="save-widgets-mobile">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </ActionBar>
    </Page>
  );
}