import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Save,
  Settings,
  Image,
  Type,
  Square,
  Palette,
  Move,
  Plus,
  Trash2,
  GripVertical
} from "lucide-react";

interface HeroTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: "full-width" | "split-screen" | "centered" | "minimal" | "video-bg";
}

interface ContentZone {
  id: string;
  type: "headline" | "subtext" | "cta" | "image" | "video";
  content: string;
  settings: Record<string, any>;
  order: number;
}

interface HeroBuilderPageProps {
  onSave?: (heroData: any) => void;
  onPreview?: (heroData: any) => void;
}

export default function HeroBuilderPage({ 
  onSave = (data) => console.log("Save hero:", data),
  onPreview = (data) => console.log("Preview hero:", data)
}: HeroBuilderPageProps) {
  const [activeTab, setActiveTab] = useState("design");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isDirty, setIsDirty] = useState(false);
  const [draggedZone, setDraggedZone] = useState<string | null>(null);

  // Mock hero templates
  const heroTemplates: HeroTemplate[] = [
    {
      id: "full-width",
      name: "Full Width Hero",
      description: "Large banner spanning the full width with centered content",
      preview: "bg-gradient-to-r from-blue-600 to-purple-600",
      style: "full-width"
    },
    {
      id: "split-screen",
      name: "Split Screen",
      description: "Content on left, media on right layout",
      preview: "bg-gradient-to-r from-green-500 to-teal-500",
      style: "split-screen"
    },
    {
      id: "centered",
      name: "Centered Focus",
      description: "Centered content with minimal background",
      preview: "bg-gradient-to-br from-orange-400 to-red-500",
      style: "centered"
    },
    {
      id: "minimal",
      name: "Minimal Clean",
      description: "Clean, typography-focused design",
      preview: "bg-gradient-to-r from-gray-700 to-gray-900",
      style: "minimal"
    },
    {
      id: "video-bg",
      name: "Video Background",
      description: "Full-screen video with overlay content",
      preview: "bg-gradient-to-r from-indigo-600 to-blue-600",
      style: "video-bg"
    }
  ];

  // Mock content zones
  const [contentZones, setContentZones] = useState<ContentZone[]>([
    {
      id: "headline",
      type: "headline",
      content: "Build Amazing Experiences",
      settings: { fontSize: "large", align: "center", color: "white" },
      order: 0
    },
    {
      id: "subtext",
      type: "subtext", 
      content: "Create stunning hero sections that capture attention and drive engagement with our visual builder.",
      settings: { fontSize: "medium", align: "center", color: "gray-200" },
      order: 1
    },
    {
      id: "cta",
      type: "cta",
      content: "Get Started",
      settings: { variant: "primary", size: "large", link: "/signup" },
      order: 2
    }
  ]);

  const handleZoneDragStart = (e: React.DragEvent, zoneId: string) => {
    setDraggedZone(zoneId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleZoneDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedZone && draggedZone !== targetId) {
      const draggedIndex = contentZones.findIndex(z => z.id === draggedZone);
      const targetIndex = contentZones.findIndex(z => z.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newZones = [...contentZones];
        const [draggedItem] = newZones.splice(draggedIndex, 1);
        newZones.splice(targetIndex, 0, draggedItem);
        
        // Update order
        newZones.forEach((zone, index) => {
          zone.order = index;
        });
        
        setContentZones(newZones);
        setIsDirty(true);
      }
    }
    setDraggedZone(null);
  };

  const addContentZone = (type: ContentZone["type"]) => {
    const newZone: ContentZone = {
      id: `${type}-${Date.now()}`,
      type,
      content: type === "headline" ? "New Headline" : 
               type === "subtext" ? "New subtext content" :
               type === "cta" ? "Button Text" :
               type === "image" ? "/placeholder-image.jpg" : 
               "/placeholder-video.mp4",
      settings: type === "cta" ? { variant: "primary", size: "medium", link: "#" } : 
                type === "headline" ? { fontSize: "large", align: "center", color: "white" } :
                { fontSize: "medium", align: "center", color: "gray-200" },
      order: contentZones.length
    };
    
    setContentZones([...contentZones, newZone]);
    setIsDirty(true);
  };

  const removeContentZone = (zoneId: string) => {
    setContentZones(contentZones.filter(z => z.id !== zoneId));
    setIsDirty(true);
  };

  const updateZoneContent = (zoneId: string, content: string) => {
    setContentZones(contentZones.map(z => 
      z.id === zoneId ? { ...z, content } : z
    ));
    setIsDirty(true);
  };

  const updateZoneSetting = (zoneId: string, setting: string, value: any) => {
    setContentZones(contentZones.map(z => 
      z.id === zoneId ? { 
        ...z, 
        settings: { ...z.settings, [setting]: value }
      } : z
    ));
    setIsDirty(true);
  };

  const handleSave = () => {
    const heroData = {
      template: selectedTemplate,
      zones: contentZones,
      settings: {
        previewDevice
      }
    };
    onSave(heroData);
    setIsDirty(false);
  };

  const handlePreview = () => {
    const heroData = {
      template: selectedTemplate,
      zones: contentZones,
      settings: {
        previewDevice
      }
    };
    onPreview(heroData);
  };

  const getDeviceIcon = (device: typeof previewDevice) => {
    switch (device) {
      case "mobile": return Smartphone;
      case "tablet": return Tablet;
      case "desktop": return Monitor;
      default: return Monitor;
    }
  };

  const getDeviceClass = () => {
    switch (previewDevice) {
      case "mobile": return "max-w-sm mx-auto";
      case "tablet": return "max-w-2xl mx-auto";
      case "desktop": return "w-full";
      default: return "w-full";
    }
  };

  const getZoneIcon = (type: ContentZone["type"]) => {
    switch (type) {
      case "headline": return Type;
      case "subtext": return Type;
      case "cta": return Square;
      case "image": return Image;
      case "video": return Layout;
      default: return Layout;
    }
  };

  const TemplateGallery = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {heroTemplates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
              selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              setSelectedTemplate(template.id);
              setIsDirty(true);
            }}
            data-testid={`template-${template.id}`}
          >
            <CardContent className="p-4">
              <div className={`h-32 rounded-lg mb-3 ${template.preview} flex items-center justify-center`}>
                <Layout className="w-8 h-8 text-white opacity-80" />
              </div>
              <h3 className="font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ContentBuilder = () => (
    <div className="space-y-6">
      {/* Add Content Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addContentZone("headline")}
              data-testid="add-headline"
            >
              <Type className="w-4 h-4 mr-2" />
              Headline
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addContentZone("subtext")}
              data-testid="add-subtext"
            >
              <Type className="w-4 h-4 mr-2" />
              Subtext
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addContentZone("cta")}
              data-testid="add-cta"
            >
              <Square className="w-4 h-4 mr-2" />
              Button
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addContentZone("image")}
              data-testid="add-image"
            >
              <Image className="w-4 h-4 mr-2" />
              Image
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addContentZone("video")}
              data-testid="add-video"
            >
              <Layout className="w-4 h-4 mr-2" />
              Video
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Zones */}
      <div className="space-y-4">
        {contentZones.sort((a, b) => a.order - b.order).map((zone) => {
          const ZoneIcon = getZoneIcon(zone.type);
          return (
            <Card 
              key={zone.id}
              className={`hover-elevate cursor-move ${draggedZone === zone.id ? 'opacity-50' : ''}`}
              draggable
              onDragStart={(e) => handleZoneDragStart(e, zone.id)}
              onDragOver={handleZoneDragOver}
              onDrop={(e) => handleZoneDrop(e, zone.id)}
              data-testid={`zone-${zone.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab mt-1" />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <ZoneIcon className="w-4 h-4 text-primary" />
                      <Badge variant="secondary" className="capitalize">
                        {zone.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 ml-auto"
                        onClick={() => removeContentZone(zone.id)}
                        data-testid={`remove-${zone.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`content-${zone.id}`}>Content</Label>
                      {zone.type === "subtext" ? (
                        <Textarea
                          id={`content-${zone.id}`}
                          value={zone.content}
                          onChange={(e) => updateZoneContent(zone.id, e.target.value)}
                          className="h-20"
                          data-testid={`content-${zone.id}`}
                        />
                      ) : (
                        <Input
                          id={`content-${zone.id}`}
                          value={zone.content}
                          onChange={(e) => updateZoneContent(zone.id, e.target.value)}
                          data-testid={`content-${zone.id}`}
                        />
                      )}
                    </div>
                    
                    {/* Zone-specific settings */}
                    {zone.type === "headline" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label>Font Size</Label>
                          <Select 
                            value={zone.settings.fontSize} 
                            onValueChange={(value) => updateZoneSetting(zone.id, "fontSize", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="xl">Extra Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Alignment</Label>
                          <Select 
                            value={zone.settings.align} 
                            onValueChange={(value) => updateZoneSetting(zone.id, "align", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    
                    {zone.type === "cta" && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label>Style</Label>
                          <Select 
                            value={zone.settings.variant} 
                            onValueChange={(value) => updateZoneSetting(zone.id, "variant", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                              <SelectItem value="outline">Outline</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Size</Label>
                          <Select 
                            value={zone.settings.size} 
                            onValueChange={(value) => updateZoneSetting(zone.id, "size", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Link</Label>
                          <Input
                            value={zone.settings.link}
                            onChange={(e) => updateZoneSetting(zone.id, "link", e.target.value)}
                            placeholder="/page"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const PreviewPanel = () => {
    const selectedTemplateData = heroTemplates.find(t => t.id === selectedTemplate);
    
    return (
      <div className="space-y-4">
        {/* Device Controls */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Preview</h3>
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
        
        {/* Preview Area */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className={`transition-all duration-300 ${getDeviceClass()}`}>
            <div className={`rounded-lg overflow-hidden ${
              selectedTemplateData?.preview || "bg-gradient-to-r from-gray-700 to-gray-900"
            } min-h-[200px] md:min-h-[300px] flex flex-col items-center justify-center text-white p-6 md:p-12`}>
              {contentZones.sort((a, b) => a.order - b.order).map((zone) => (
                <div 
                  key={zone.id}
                  className={`mb-4 ${
                    zone.settings.align === 'center' ? 'text-center' :
                    zone.settings.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {zone.type === "headline" && (
                    <h1 className={`font-bold ${
                      zone.settings.fontSize === 'xl' ? 'text-4xl md:text-6xl' :
                      zone.settings.fontSize === 'large' ? 'text-3xl md:text-5xl' :
                      zone.settings.fontSize === 'medium' ? 'text-2xl md:text-4xl' :
                      'text-xl md:text-3xl'
                    }`}>
                      {zone.content}
                    </h1>
                  )}
                  
                  {zone.type === "subtext" && (
                    <p className={`${
                      zone.settings.fontSize === 'large' ? 'text-lg md:text-xl' :
                      zone.settings.fontSize === 'medium' ? 'text-base md:text-lg' :
                      'text-sm md:text-base'
                    } opacity-90 max-w-2xl`}>
                      {zone.content}
                    </p>
                  )}
                  
                  {zone.type === "cta" && (
                    <Button
                      variant={zone.settings.variant}
                      size={zone.settings.size}
                      className="mt-2"
                    >
                      {zone.content}
                    </Button>
                  )}
                  
                  {zone.type === "image" && (
                    <div className="w-full max-w-md h-32 bg-white/20 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  
                  {zone.type === "video" && (
                    <div className="w-full max-w-lg h-40 bg-black/30 rounded-lg flex items-center justify-center">
                      <Layout className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Page data-testid="hero-builder-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle>
              Hero / Featured Builder
            </PageTitle>
            <PageActions>
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePreview}
                  data-testid="preview-hero"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                {isDirty && (
                  <Button onClick={handleSave} data-testid="save-hero-desktop">
                    <Save className="h-4 w-4 mr-2" />
                    Save Hero
                  </Button>
                )}
              </div>
            </PageActions>
          </PageToolbar>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="design">
            <Card>
              <CardHeader>
                <CardTitle>Choose a Template</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select a hero layout template to get started
                </p>
              </CardHeader>
              <CardContent>
                <TemplateGallery />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <ContentBuilder />
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
          <Button onClick={handlePreview} size="sm" variant="outline" data-testid="preview-hero-mobile">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button onClick={handleSave} size="sm" data-testid="save-hero-mobile">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </ActionBar>
    </Page>
  );
}