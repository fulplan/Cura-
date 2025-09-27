import { useState } from "react";
import { Search, RotateCcw, Trash2, MoreHorizontal, Filter, FileText, Image, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody, 
  ActionBar,
  FilterSheet
} from "@/components/ui/page";
import { EmptyStates } from "@/components/ui/empty-state";
import { useDeletedPosts, useRestorePost, usePermanentDeletePost, useBulkRestorePosts, useBulkPermanentDelete, useEmptyTrash } from "@/hooks/useTrash";
import { useToast } from "@/hooks/use-toast";
import { LoadingCard } from "@/components/ui/loading";

interface TrashedItem {
  id: string;
  name: string;
  type: "post" | "page" | "media" | "user" | "category";
  deletedDate: string;
  deletedBy: string;
  originalLocation?: string;
  size?: number;
}

interface TrashPageProps {
  onRestore?: (ids: string[]) => void;
  onPermanentDelete?: (ids: string[]) => void;
  onEmptyTrash?: () => void;
}

export default function TrashPage({ 
  onRestore,
  onPermanentDelete,
  onEmptyTrash
}: TrashPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { toast } = useToast();
  
  // Fetch deleted posts
  const { data: deletedPostsData, isLoading: isLoadingPosts } = useDeletedPosts();
  const restorePostMutation = useRestorePost();
  const permanentDeleteMutation = usePermanentDeletePost();
  const bulkRestoreMutation = useBulkRestorePosts();
  const bulkDeleteMutation = useBulkPermanentDelete();
  const emptyTrashMutation = useEmptyTrash();

  // Convert deleted posts to TrashedItem format
  const trashedItems: TrashedItem[] = (deletedPostsData?.posts || []).map((post: any) => ({
    id: post.id,
    name: post.title,
    type: "post" as const,
    deletedDate: post.deletedAt ? new Date(post.deletedAt).toISOString().split('T')[0] : "",
    deletedBy: "Unknown", // Could be enhanced to track who deleted
    originalLocation: "/posts"
  }));

  const filteredItems = trashedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.deletedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleRestore = async (ids: string[]) => {
    try {
      if (ids.length === 1) {
        await restorePostMutation.mutateAsync(ids[0]);
        toast({
          title: "Success",
          description: "Item restored successfully.",
        });
      } else {
        await bulkRestoreMutation.mutateAsync(ids);
        toast({
          title: "Success", 
          description: `${ids.length} items restored successfully.`,
        });
      }
      setSelectedItems([]);
      onRestore?.(ids);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (ids: string[]) => {
    try {
      if (ids.length === 1) {
        await permanentDeleteMutation.mutateAsync(ids[0]);
        toast({
          title: "Success",
          description: "Item permanently deleted.",
        });
      } else {
        await bulkDeleteMutation.mutateAsync(ids);
        toast({
          title: "Success",
          description: `${ids.length} items permanently deleted.`,
        });
      }
      setSelectedItems([]);
      onPermanentDelete?.(ids);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyTrashMutation.mutateAsync();
      toast({
        title: "Success",
        description: "Trash emptied successfully.",
      });
      setSelectedItems([]);
      onEmptyTrash?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to empty trash. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return ` • ${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getTypeIcon = (type: TrashedItem["type"]) => {
    const icons = {
      post: FileText,
      page: FileText,
      media: Image,
      user: Users,
      category: Calendar
    };
    return icons[type] || FileText;
  };

  const getTypeBadge = (type: TrashedItem["type"]) => {
    const colors = {
      post: "bg-blue-100 text-blue-800",
      page: "bg-green-100 text-green-800",
      media: "bg-purple-100 text-purple-800",
      user: "bg-orange-100 text-orange-800",
      category: "bg-pink-100 text-pink-800"
    };
    
    return (
      <Badge variant="outline" className={`capitalize ${colors[type]}`}>
        {type}
      </Badge>
    );
  };

  const getDaysAgo = (dateString: string) => {
    const deletedDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const TrashCard = ({ item }: { item: TrashedItem }) => {
    const Icon = getTypeIcon(item.type);
    
    return (
      <Card className="hover-elevate" data-testid={`trash-item-${item.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                data-testid={`item-checkbox-${item.id}`}
              />
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm line-clamp-1">{item.name}</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTypeBadge(item.type)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0" data-testid={`trash-menu-${item.id}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRestore([item.id])}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handlePermanentDelete([item.id])}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Forever
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Deleted by {item.deletedBy}</p>
            <p>{getDaysAgo(item.deletedDate)}{formatFileSize(item.size)}</p>
            {item.originalLocation && (
              <p className="text-xs">From: {item.originalLocation}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Item Type</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="page">Pages</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="category">Categories</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Page data-testid="trash-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle>
              Trash & Archived
            </PageTitle>
            <div className="hidden md:flex items-center gap-2">
              {trashedItems.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleEmptyTrash}
                  data-testid="empty-trash-desktop"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Empty Trash
                </Button>
              )}
            </div>
          </PageToolbar>
          
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search deleted items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="search-trash"
                />
              </div>
              <FilterSheet title="Filter Items">
                <FilterControls />
              </FilterSheet>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="category">Categories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        {isLoadingPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          searchQuery || typeFilter !== "all" ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <EmptyStates.Trash />
          )
        ) : (
          <>
            {/* Bulk Actions Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={handleSelectAll}
                  data-testid="select-all-items"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length > 0 
                    ? `${selectedItems.length} of ${filteredItems.length} selected`
                    : `${filteredItems.length} items in trash`
                  }
                </span>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="hidden md:flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleRestore(selectedItems)}
                    data-testid="restore-selected"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore Selected
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handlePermanentDelete(selectedItems)}
                    data-testid="delete-selected"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Forever
                  </Button>
                </div>
              )}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <TrashCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </PageBody>

      {/* Mobile Action Bar for bulk actions */}
      <ActionBar show={selectedItems.length > 0}>
        <span className="text-sm font-medium">
          {selectedItems.length} selected
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleRestore(selectedItems)}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Restore
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handlePermanentDelete(selectedItems)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </ActionBar>
    </Page>
  );
}