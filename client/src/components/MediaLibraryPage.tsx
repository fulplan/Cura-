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
import { useMedia, useDeleteMedia } from "@/hooks/useMedia";
import { useToast } from "@/hooks/use-toast";
import type { Media } from "@shared/schema";

type MediaFile = Media & {
  type: "image" | "video" | "audio" | "document";
  name: string;
  uploadDate: string;
  dimensions?: { width: number; height: number };
  duration?: number;
};

interface MediaLibraryPageProps {
  onUpload?: () => void;
  onSelect?: (file: MediaFile) => void;
  onDelete?: (ids: string[]) => void;
  onDownload?: (ids: string[]) => void;
}


export default function MediaLibraryPage({ 
  onUpload,
  onSelect,
  onDelete,
  onDownload
}: MediaLibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { toast } = useToast();
  const { data: mediaData = [], isLoading, error } = useMedia();
  const deleteMediaMutation = useDeleteMedia();

  // Helper function to determine file type from MIME type
  const getFileTypeFromMime = (mimeType: string): MediaFile["type"] => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "document";
  };

  // Convert backend media data to frontend format
  const mediaFiles: MediaFile[] = mediaData.map((media: Media) => ({
    ...media,
    type: getFileTypeFromMime(media.mimeType),
    name: media.originalName,
    uploadDate: media.createdAt || new Date().toISOString(),
    // Extract metadata if available
    dimensions: media.metadata && typeof media.metadata === 'object' && 'dimensions' in media.metadata && media.metadata.dimensions ? 
      `${(media.metadata.dimensions as any).width}x${(media.metadata.dimensions as any).height}` : undefined,
    duration: media.metadata && typeof media.metadata === 'object' && 'duration' in media.metadata ? 
      (media.metadata.duration as number) : undefined
  }));

  // Get unique folders for filtering
  const folders = Array.from(new Set(mediaFiles.map(file => file.folder || "").filter(Boolean)));

  // Filter files based on search and filters
  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || file.type === typeFilter;
    const matchesFolder = folderFilter === "all" || 
      (folderFilter === "root" && !file.folder) || 
      file.folder === folderFilter;
    return matchesSearch && matchesType && matchesFolder;
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

  const handleDeleteFiles = async (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    
    try {
      // Delete files one by one
      for (const id of fileIds) {
        await deleteMediaMutation.mutateAsync(id);
      }
      
      toast({
        title: "Success",
        description: `${fileIds.length} file${fileIds.length === 1 ? '' : 's'} deleted successfully.`,
      });
      
      // Clear selection
      setSelectedFiles([]);
      setShowDeleteDialog(false);
      
      // Call parent callback if provided
      onDelete?.(fileIds);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkMoveToFolder = async (fileIds: string[], folder: string) => {
    try {
      // TODO: Implement bulk move API endpoint
      toast({
        title: "Feature Coming Soon",
        description: "Bulk move to folder will be available in a future update.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFiles = (fileIds: string[]) => {
    // For each file ID, find the file and download it
    fileIds.forEach(id => {
      const file = mediaFiles.find(f => f.id === id);
      if (file) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
    
    toast({
      title: "Download Started",
      description: `Starting download of ${fileIds.length} file${fileIds.length === 1 ? '' : 's'}.`,
    });
    
    onDownload?.(fileIds);
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
                <DropdownMenuItem onClick={() => onSelect?.(file)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadFiles([file.id])}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteFiles([file.id])}
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
            <DropdownMenuItem onClick={() => onSelect?.(file)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownloadFiles([file.id])}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteFiles([file.id])}
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
            <PageTitle badge={mediaFiles.length.toString()}>
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
                <Button onClick={() => onUpload?.()} data-testid="upload-desktop">
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
              
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  <SelectItem value="root">Root</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder} value={folder}>
                      <Folder className="h-4 w-4 mr-2 inline" />
                      {folder}
                    </SelectItem>
                  ))}
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
                onClick: () => onUpload?.()
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
                    <Button variant="outline" size="sm" onClick={() => handleDownloadFiles(selectedFiles)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteFiles(selectedFiles)}>
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
        onClick={() => onUpload?.()}
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
          <Button variant="outline" size="sm" onClick={() => handleDownloadFiles(selectedFiles)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteFiles(selectedFiles)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </ActionBar>
    </Page>
  );
}