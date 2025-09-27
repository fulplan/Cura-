import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingCard } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { useSections, useCreateSection, useDeleteSection, useReorderSections } from "@/hooks/useSections";
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
  const { toast } = useToast();

  // Use real API data
  const { data: sections = [], isLoading, error } = useSections();
  const createSectionMutation = useCreateSection();
  const deleteSectionMutation = useDeleteSection();
  const reorderSectionsMutation = useReorderSections();

  const sectionTypes = [
    { id: "hero", name: "Hero Section", icon: Layout, description: "Large banner with title and CTA" },
    { id: "text", name: "Text Block", icon: Type, description: "Rich text content area" },
    { id: "image", name: "Image Gallery", icon: Image, description: "Image carousel or grid" },
    { id: "video", name: "Video Embed", icon: Video, description: "YouTube or video player" },
  ];

  // Handle section creation
  const handleAddSection = async (sectionType: string) => {
    try {
      const sectionTemplate = sectionTypes.find(type => type.id === sectionType);
      if (!sectionTemplate) return;

      await createSectionMutation.mutateAsync({
        title: `New ${sectionTemplate.name}`,
        type: sectionType,
        content: { description: sectionTemplate.description },
        status: "draft",
        order: sections.length,
      });

      toast({
        title: "Section added",
        description: `${sectionTemplate.name} has been added to your layout.`,
      });

      onAddSection?.(sectionType);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add section. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle section deletion
  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSectionMutation.mutateAsync(sectionId);
      toast({
        title: "Section deleted",
        description: "The section has been moved to trash.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      try {
        // Calculate new order based on drop position
        const targetIndex = sections.findIndex((s: any) => s.id === targetId);
        const draggedIndex = sections.findIndex((s: any) => s.id === draggedItem);
        
        if (targetIndex !== -1 && draggedIndex !== -1) {
          // Create new order array
          const reorderedSections = [...sections];
          const [draggedSection] = reorderedSections.splice(draggedIndex, 1);
          reorderedSections.splice(targetIndex, 0, draggedSection);
          
          // Extract IDs in new order
          const newSectionIds = reorderedSections.map((s: any) => s.id);
          
          await reorderSectionsMutation.mutateAsync(newSectionIds);
          
          toast({
            title: "Sections reordered",
            description: "The page layout has been updated.",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to reorder sections. Please try again.",
          variant: "destructive",
        });
      }
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

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Layout Manager</h1>
            <p className="text-muted-foreground text-sm md:text-base">Drag and drop to arrange your page sections</p>
          </div>
          <Button disabled size="sm" className="shrink-0">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Section</span>
          </Button>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <LoadingCard key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Layout Manager</h1>
            <p className="text-muted-foreground text-sm md:text-base">Drag and drop to arrange your page sections</p>
          </div>
          <Button onClick={() => window.location.reload()} size="sm" className="shrink-0">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Retry</span>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load sections</h3>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Button 
              data-testid="button-add-section" 
              size="sm" 
              className="shrink-0"
              disabled={createSectionMutation.isPending}
            >
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
                  onClick={() => handleAddSection(type.id)}
                  data-testid={`menu-add-${type.id}`}
                  disabled={createSectionMutation.isPending}
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
                  onClick={() => handleAddSection(type.id)}
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
            {sections.map((section: any, index: number) => {
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
                          onClick={() => {
                            toast({
                              title: "Preview",
                              description: "Section preview functionality coming soon.",
                            });
                          }}
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
                          }}
                          data-testid={`button-edit-${section.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon" 
                          className="w-8 h-8"
                          onClick={() => {
                            toast({
                              title: "Duplicate",
                              description: "Section duplication functionality coming soon.",
                            });
                          }}
                          data-testid={`button-duplicate-${section.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSection(section.id)}
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

          {sections.length === 0 && (
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