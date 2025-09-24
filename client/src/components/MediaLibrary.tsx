import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Upload, 
  Grid3x3, 
  List, 
  Filter,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaLibraryProps {
  onUpload?: () => void;
  onSelectFile?: (file: any) => void;
}

export default function MediaLibrary({ onUpload, onSelectFile }: MediaLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState("all");

  // TODO: Remove mock data
  const mediaFiles = [
    {
      id: "1",
      name: "hero-image.jpg",
      type: "image",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      dimensions: "1920x1080",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
      used: true
    },
    {
      id: "2",
      name: "presentation.pdf",
      type: "document",
      size: "5.1 MB", 
      uploadDate: "2024-01-14",
      dimensions: null,
      thumbnail: null,
      used: false
    },
    {
      id: "3",
      name: "demo-video.mp4",
      type: "video",
      size: "45.2 MB",
      uploadDate: "2024-01-12",
      dimensions: "1920x1080",
      thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      used: true
    },
    {
      id: "4",
      name: "profile-photo.png", 
      type: "image",
      size: "856 KB",
      uploadDate: "2024-01-10",
      dimensions: "512x512",
      thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop",
      used: false
    },
    {
      id: "5",
      name: "screenshot-1.png",
      type: "image", 
      size: "1.2 MB",
      uploadDate: "2024-01-08",
      dimensions: "1440x900",
      thumbnail: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
      used: true
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return ImageIcon;
      case "video": return Video;
      case "document": return FileText;
      default: return FileText;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "image": return "text-green-500";
      case "video": return "text-purple-500";
      case "document": return "text-blue-500";
      default: return "text-gray-500";
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || file.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const GridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {filteredFiles.map((file) => {
        const FileIcon = getFileIcon(file.type);
        return (
          <Card 
            key={file.id} 
            className="hover-elevate cursor-pointer"
            onClick={() => {
              onSelectFile?.(file);
              console.log("Selected file:", file.name);
            }}
            data-testid={`file-card-${file.id}`}
          >
            <CardContent className="p-2 md:p-3">
              <div className="aspect-square rounded mb-3 bg-muted flex items-center justify-center overflow-hidden">
                {file.thumbnail ? (
                  <img 
                    src={file.thumbnail} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileIcon className={`w-8 h-8 ${getFileTypeColor(file.type)}`} />
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{file.size}</span>
                  {file.used && (
                    <Badge variant="secondary" className="text-xs px-1">In use</Badge>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100"
                    data-testid={`file-actions-${file.id}`}
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem data-testid={`menu-download-${file.id}`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" data-testid={`menu-delete-${file.id}`}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {filteredFiles.map((file) => {
        const FileIcon = getFileIcon(file.type);
        return (
          <Card 
            key={file.id} 
            className="hover-elevate cursor-pointer"
            onClick={() => {
              onSelectFile?.(file);
              console.log("Selected file:", file.name);
            }}
            data-testid={`file-row-${file.id}`}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {file.thumbnail ? (
                    <img 
                      src={file.thumbnail} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileIcon className={`w-6 h-6 ${getFileTypeColor(file.type)}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{file.size}</span>
                    {file.dimensions && <span>{file.dimensions}</span>}
                    <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {file.used && (
                    <Badge variant="secondary">In use</Badge>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" data-testid={`file-actions-list-${file.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Media Library</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your images, videos, and documents</p>
        </div>
        <Button onClick={onUpload} data-testid="button-upload-media" size="sm" className="shrink-0">
          <Upload className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Upload Files</span>
        </Button>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-media-search"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-type-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-center sm:justify-end">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                data-testid="button-grid-view"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                data-testid="button-list-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Content */}
      <div>
        {filteredFiles.length > 0 ? (
          viewMode === "grid" ? <GridView /> : <ListView />
        ) : (
          <Card>
            <CardContent className="text-center py-8 md:py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Upload your first file to get started"}
              </p>
              {!searchQuery && typeFilter === "all" && (
                <Button onClick={onUpload} data-testid="button-upload-first">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}