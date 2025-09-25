import { useState } from "react";
import { Search, Grid, List, Upload, Filter, MoreHorizontal, Download, Eye, Trash2, Folder, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody, 
  PageActions,
  ActionBar,
  FAB,
  FilterSheet
} from "@/components/ui/page";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingGrid } from "@/components/ui/loading";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "document";
  url: string;
  size: number;
  uploadDate: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  mimeType: string;
}

interface MediaLibraryPageProps {
  onUpload?: () => void;
  onSelect?: (file: MediaFile) => void;
  onDelete?: (ids: string[]) => void;
  onDownload?: (ids: string[]) => void;
}

// Mock data
const mockFiles: MediaFile[] = [
  {
    id: "1",
    name: "hero-banner.jpg",
    type: "image",
    url: "/images/hero-banner.jpg",
    size: 245760,
    uploadDate: "2024-03-15",
    dimensions: { width: 1920, height: 1080 },
    mimeType: "image/jpeg"
  },
  {
    id: "2", 
    name: "product-demo.mp4",
    type: "video",
    url: "/videos/product-demo.mp4",
    size: 15728640,
    uploadDate: "2024-03-14",
    dimensions: { width: 1280, height: 720 },
    duration: 120,
    mimeType: "video/mp4"
  },
  {
    id: "3",
    name: "user-guide.pdf",
    type: "document",
    url: "/documents/user-guide.pdf",
    size: 1048576,
    uploadDate: "2024-03-13",
    mimeType: "application/pdf"
  },
  {
    id: "4",
    name: "logo-variants.png",
    type: "image",
    url: "/images/logo-variants.png",
    size: 89600,
    uploadDate: "2024-03-12",
    dimensions: { width: 800, height: 600 },
    mimeType: "image/png"
  },
  {
    id: "5",
    name: "background-music.mp3",
    type: "audio",
    url: "/audio/background-music.mp3",
    size: 5242880,
    uploadDate: "2024-03-11",
    duration: 180,
    mimeType: "audio/mpeg"
  }
];

export default function MediaLibraryPage({ 
  onUpload = () => console.log("Upload files"),
  onSelect = (file) => console.log("Select file:", file),
  onDelete = (ids) => console.log("Delete files:", ids),
  onDownload = (ids) => console.log("Download files:", ids)
}: MediaLibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter files based on search and filters
  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || file.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSelectFile = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles([...selectedFiles, fileId]);
    } else {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(filteredFiles.map(file => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (type: MediaFile["type"]) => {
    const icons = {
      image: Image,
      video: Video,
      audio: Video, // Using video icon for audio
      document: FileText
    };
    return icons[type] || FileText;
  };

  const getFileTypeColor = (type: MediaFile["type"]) => {
    const colors = {
      image: "bg-blue-500",
      video: "bg-purple-500", 
      audio: "bg-green-500",
      document: "bg-orange-500"
    };
    return colors[type] || "bg-gray-500";
  };

  const MediaGridItem = ({ file }: { file: MediaFile }) => {
    const Icon = getFileIcon(file.type);
    
    return (
      <Card className="hover-elevate group" data-testid={`media-item-${file.id}`}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <Checkbox
              checked={selectedFiles.includes(file.id)}
              onCheckedChange={(checked) => handleSelectFile(file.id, !!checked)}
              data-testid={`file-checkbox-${file.id}`}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100" data-testid={`file-menu-${file.id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect(file)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload([file.id])}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete([file.id])}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
            {file.type === "image" ? (
              <img 
                src={file.url} 
                alt={file.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center ${file.type === "image" ? "hidden" : ""}`}>
              <div className={`p-3 rounded-full ${getFileTypeColor(file.type)}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            {file.duration && (
              <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded">
                {Math.floor(file.duration / 60)}:{(file.duration % 60).toString().padStart(2, "0")}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium line-clamp-1" title={file.name}>
              {file.name}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              {file.dimensions && (
                <span>{file.dimensions.width}×{file.dimensions.height}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(file.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MediaListItem = ({ file }: { file: MediaFile }) => {
    const Icon = getFileIcon(file.type);
    
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover-elevate group" data-testid={`media-item-${file.id}`}>
        <Checkbox
          checked={selectedFiles.includes(file.id)}
          onCheckedChange={(checked) => handleSelectFile(file.id, !!checked)}
          data-testid={`file-checkbox-${file.id}`}
        />
        
        <div className={`p-2 rounded ${getFileTypeColor(file.type)}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium line-clamp-1">{file.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>
            {file.dimensions && (
              <>
                <span>•</span>
                <span>{file.dimensions.width}×{file.dimensions.height}</span>
              </>
            )}
            {file.duration && (
              <>
                <span>•</span>
                <span>{Math.floor(file.duration / 60)}:{(file.duration % 60).toString().padStart(2, "0")}</span>
              </>
            )}
            <span>•</span>
            <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100" data-testid={`file-menu-${file.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelect(file)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload([file.id])}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete([file.id])}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">File Type</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Page data-testid="media-library-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle badge="2.1k">
              Media Library
            </PageTitle>
            <PageActions>
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="view-grid"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button onClick={onUpload} data-testid="upload-desktop">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </PageActions>
          </PageToolbar>
          
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="search-files"
                />
              </div>
              <FilterSheet title="Filter Files">
                <FilterControls />
              </FilterSheet>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        {isLoading ? (
          <LoadingGrid items={12} columns={viewMode === "grid" ? 4 : 1} />
        ) : filteredFiles.length === 0 ? (
          searchQuery || typeFilter !== "all" ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <EmptyState
              icon={<Folder className="h-8 w-8 text-muted-foreground" />}
              title="No media files"
              description="Upload images, videos, and documents to your media library."
              action={{
                label: "Upload Files",
                onClick: onUpload
              }}
            />
          )
        ) : (
          <>
            {/* Selection Bar */}
            {selectedFiles.length > 0 && (
              <div className="bg-muted/50 border rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onDownload(selectedFiles)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => onDelete(selectedFiles)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Files Content */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFiles.map(file => (
                  <MediaGridItem key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map(file => (
                  <MediaListItem key={file.id} file={file} />
                ))}
              </div>
            )}
          </>
        )}
      </PageBody>

      {/* Mobile FAB */}
      <FAB 
        onClick={onUpload}
        aria-label="Upload files"
        data-testid="upload-fab"
      >
        Upload
      </FAB>

      {/* Mobile Action Bar for bulk actions */}
      <ActionBar show={selectedFiles.length > 0}>
        <span className="text-sm font-medium">
          {selectedFiles.length} selected
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onDownload(selectedFiles)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(selectedFiles)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </ActionBar>
    </Page>
  );
}