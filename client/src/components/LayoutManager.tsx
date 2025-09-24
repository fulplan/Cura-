import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  Eye,
  Copy,
  Layout,
  Image,
  Type,
  Video
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutManagerProps {
  onAddSection?: (type: string) => void;
  onEditSection?: (id: string) => void;
}

export default function LayoutManager({ onAddSection, onEditSection }: LayoutManagerProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // TODO: Remove mock data
  const sectionTypes = [
    { id: "hero", name: "Hero Section", icon: Layout, description: "Large banner with title and CTA" },
    { id: "text", name: "Text Block", icon: Type, description: "Rich text content area" },
    { id: "image", name: "Image Gallery", icon: Image, description: "Image carousel or grid" },
    { id: "video", name: "Video Embed", icon: Video, description: "YouTube or video player" },
  ];

  const currentSections = [
    {
      id: "section-1",
      type: "hero",
      title: "Welcome Hero",
      content: "Main landing page hero with call-to-action",
      status: "active",
      order: 0
    },
    {
      id: "section-2", 
      type: "text",
      title: "About Section",
      content: "Company overview and mission statement",
      status: "active",
      order: 1
    },
    {
      id: "section-3",
      type: "image", 
      title: "Feature Gallery",
      content: "Product screenshots and images",
      status: "draft",
      order: 2
    }
  ];

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      console.log(`Move section ${draggedItem} to position of ${targetId}`);
      // TODO: Implement section reordering
    }
    setDraggedItem(null);
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-500" : "bg-yellow-500";
  };

  const getSectionIcon = (type: string) => {
    const section = sectionTypes.find(s => s.id === type);
    return section?.icon || Layout;
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Layout Manager</h1>
          <p className="text-muted-foreground text-sm md:text-base">Drag and drop to arrange your page sections</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="button-add-section" size="sm" className="shrink-0">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Section</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {sectionTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => {
                    onAddSection?.(type.id);
                    console.log(`Add section: ${type.id}`);
                  }}
                  data-testid={`menu-add-${type.id}`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Section Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Section Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {sectionTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Card 
                  key={type.id} 
                  className="hover-elevate cursor-pointer"
                  onClick={() => {
                    onAddSection?.(type.id);
                    console.log(`Add section template: ${type.id}`);
                  }}
                  data-testid={`template-${type.id}`}
                >
                  <CardContent className="p-3 md:p-4 text-center">
                    <IconComponent className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium mb-1">{type.name}</h4>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Layout Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Page Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentSections.map((section, index) => {
              const SectionIcon = getSectionIcon(section.type);
              return (
                <Card
                  key={section.id}
                  className={`hover-elevate cursor-move ${draggedItem === section.id ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, section.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, section.id)}
                  data-testid={`section-${section.id}`}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                      
                      <div className="flex items-center gap-3 flex-1">
                        <SectionIcon className="w-5 h-5 text-primary" />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{section.title}</h4>
                            <Badge 
                              variant="secondary" 
                              className={`w-2 h-2 p-0 rounded-full ${getStatusColor(section.status)}`}
                            />
                            <span className="text-xs text-muted-foreground capitalize">
                              {section.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{section.content}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => console.log(`Preview section: ${section.id}`)}
                          data-testid={`button-preview-${section.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => {
                            onEditSection?.(section.id);
                            console.log(`Edit section: ${section.id}`);
                          }}
                          data-testid={`button-edit-${section.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon" 
                          className="w-8 h-8"
                          onClick={() => console.log(`Duplicate section: ${section.id}`)}
                          data-testid={`button-duplicate-${section.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-destructive hover:text-destructive"
                          onClick={() => console.log(`Delete section: ${section.id}`)}
                          data-testid={`button-delete-${section.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {currentSections.length === 0 && (
            <div className="text-center py-8">
              <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sections yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your page by adding sections above
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}