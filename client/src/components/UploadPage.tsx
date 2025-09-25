import { useState, useRef } from "react";
import { Upload, X, FileIcon, Image, Video, FileText, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody
} from "@/components/ui/page";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface UploadPageProps {
  onUpload?: (files: File[], destination?: string) => void;
  onCancel?: (fileId: string) => void;
  onRetry?: (fileId: string) => void;
}

export default function UploadPage({ 
  onUpload = (files, destination) => console.log("Upload files:", files, "to:", destination),
  onCancel = (fileId) => console.log("Cancel upload:", fileId),
  onRetry = (fileId) => console.log("Retry upload:", fileId)
}: UploadPageProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [destination, setDestination] = useState("media-library");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newUploadFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending" as const
    }));
    
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    
    // Simulate upload process
    newUploadFiles.forEach(uploadFile => {
      simulateUpload(uploadFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "uploading" } : f
    ));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        clearInterval(interval);
        // Simulate occasional failures
        const success = Math.random() > 0.1;
        
        setUploadFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            progress: 100, 
            status: success ? "completed" : "error",
            error: success ? undefined : "Failed to upload file"
          } : f
        ));
      } else {
        setUploadFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
      }
    }, 100);
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
    onCancel(fileId);
  };

  const retryUpload = (fileId: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "pending", progress: 0, error: undefined } : f
    ));
    simulateUpload(fileId);
    onRetry(fileId);
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Video;
    return FileText;
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const completedCount = uploadFiles.filter(f => f.status === "completed").length;
  const errorCount = uploadFiles.filter(f => f.status === "error").length;
  const uploadingCount = uploadFiles.filter(f => f.status === "uploading").length;

  return (
    <Page data-testid="upload-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle>
              Upload Media
            </PageTitle>
          </PageToolbar>
          
          <div className="mt-4 max-w-md">
            <Label htmlFor="destination">Upload Destination</Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger data-testid="upload-destination">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="media-library">Media Library</SelectItem>
                <SelectItem value="post-images">Post Images</SelectItem>
                <SelectItem value="user-avatars">User Avatars</SelectItem>
                <SelectItem value="site-assets">Site Assets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Zone */}
          <div className="space-y-6">
            <Card
              className={`border-2 border-dashed transition-colors ${
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-testid="upload-dropzone"
            >
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Drop files here to upload</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse your computer
                </p>
                <Button onClick={() => fileInputRef.current?.click()} data-testid="browse-files">
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Supports: Images, Videos, Audio, Documents (Max 10MB each)
                </p>
              </CardContent>
            </Card>

            {/* Upload Stats */}
            {uploadFiles.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Upload Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{uploadingCount}</div>
                      <div className="text-xs text-muted-foreground">Uploading</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upload Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Upload Queue ({uploadFiles.length})
              </h3>
              {uploadFiles.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUploadFiles([])}
                  data-testid="clear-queue"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadFiles.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <FileIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No files in queue. Add files to start uploading.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                uploadFiles.map(uploadFile => {
                  const Icon = getFileIcon(uploadFile.file.type);
                  const statusIcon = getStatusIcon(uploadFile.status);
                  
                  return (
                    <Card key={uploadFile.id} className="overflow-hidden" data-testid={`upload-item-${uploadFile.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <Icon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium line-clamp-1">
                                {uploadFile.file.name}
                              </p>
                              <div className="flex items-center gap-2">
                                {statusIcon}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeFile(uploadFile.id)}
                                  data-testid={`remove-file-${uploadFile.id}`}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                              <span>{formatFileSize(uploadFile.file.size)}</span>
                              <Badge 
                                variant={
                                  uploadFile.status === "completed" ? "default" :
                                  uploadFile.status === "error" ? "destructive" :
                                  uploadFile.status === "uploading" ? "secondary" : "outline"
                                }
                                className="text-xs"
                              >
                                {uploadFile.status}
                              </Badge>
                            </div>
                            
                            {uploadFile.status === "uploading" && (
                              <Progress value={uploadFile.progress} className="h-1" />
                            )}
                            
                            {uploadFile.status === "error" && uploadFile.error && (
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-destructive">{uploadFile.error}</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => retryUpload(uploadFile.id)}
                                  data-testid={`retry-upload-${uploadFile.id}`}
                                >
                                  Retry
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </PageBody>
    </Page>
  );
}