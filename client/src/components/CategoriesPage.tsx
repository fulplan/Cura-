import { useState } from "react";
import { Search, Plus, MoreHorizontal, Edit, Trash2, FolderPlus, Tag } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/useTags";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageToolbar, 
  PageBody, 
  PageActions,
  FAB
} from "@/components/ui/page";
import { EmptyState } from "@/components/ui/empty-state";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
  color?: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface CategoriesPageProps {
  onCreateCategory?: (data: any) => void;
  onEditCategory?: (id: string, data: any) => void;
  onDeleteCategory?: (id: string) => void;
  onCreateTag?: (data: any) => void;
  onEditTag?: (id: string, data: any) => void;
  onDeleteTag?: (id: string) => void;
}

// Mock data
const mockCategories: Category[] = [
  { id: "1", name: "Development", slug: "development", description: "Programming and software development content", postCount: 45, color: "#3b82f6" },
  { id: "2", name: "Design", slug: "design", description: "UI/UX design and visual content", postCount: 23, color: "#8b5cf6" },
  { id: "3", name: "Technology", slug: "technology", description: "Latest tech news and trends", postCount: 31, color: "#06b6d4" },
];

const mockTags: Tag[] = [
  { id: "1", name: "React", slug: "react", postCount: 18 },
  { id: "2", name: "TypeScript", slug: "typescript", postCount: 15 },
  { id: "3", name: "CSS", slug: "css", postCount: 12 },
  { id: "4", name: "JavaScript", slug: "javascript", postCount: 22 },
  { id: "5", name: "Tutorial", slug: "tutorial", postCount: 8 },
];

export default function CategoriesPage({ 
  onCreateCategory = (data) => console.log("Create category:", data),
  onEditCategory = (id, data) => console.log("Edit category:", id, data),
  onDeleteCategory = (id) => console.log("Delete category:", id),
  onCreateTag = (data) => console.log("Create tag:", data),
  onEditTag = (id, data) => console.log("Edit tag:", id, data),
  onDeleteTag = (id) => console.log("Delete tag:", id)
}: CategoriesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("categories");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({ name: "", description: "" });
  
  const { toast } = useToast();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: tags = [], isLoading: tagsLoading } = useTags();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  const filteredCategories = categories.filter((category: any) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTags = tags.filter((tag: any) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateItem = async () => {
    try {
      const slug = newItemData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      
      if (activeTab === "categories") {
        await createCategoryMutation.mutateAsync({
          name: newItemData.name,
          description: newItemData.description,
          slug
        });
        toast({
          title: "Success",
          description: "Category created successfully.",
        });
        onCreateCategory({
          name: newItemData.name,
          description: newItemData.description,
          slug
        });
      } else {
        await createTagMutation.mutateAsync({
          name: newItemData.name,
          slug
        });
        toast({
          title: "Success",
          description: "Tag created successfully.",
        });
        onCreateTag({
          name: newItemData.name,
          slug
        });
      }
      setNewItemData({ name: "", description: "" });
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to create ${activeTab.slice(0, -1)}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
      onDeleteCategory(id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTagMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Tag deleted successfully.",
      });
      onDeleteTag(id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tag. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card className="hover-elevate" data-testid={`category-card-${category.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div 
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base line-clamp-1">{category.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                /{category.slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {category.postCount} posts
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0" data-testid={`category-menu-${category.id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditCategory(category.id, category)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      {category.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        </CardContent>
      )}
    </Card>
  );

  const TagCard = ({ tag }: { tag: Tag }) => (
    <Card className="hover-elevate" data-testid={`tag-card-${tag.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base line-clamp-1">{tag.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                /{tag.slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {tag.postCount}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0" data-testid={`tag-menu-${tag.id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditTag(tag.id, tag)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  const CreateDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent data-testid="create-dialog">
        <DialogHeader>
          <DialogTitle>
            Create New {activeTab === "categories" ? "Category" : "Tag"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder={`Enter ${activeTab === "categories" ? "category" : "tag"} name...`}
              value={newItemData.name}
              onChange={(e) => setNewItemData(prev => ({ ...prev, name: e.target.value }))}
              data-testid="item-name"
            />
          </div>
          {activeTab === "categories" && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter category description..."
                value={newItemData.description}
                onChange={(e) => setNewItemData(prev => ({ ...prev, description: e.target.value }))}
                className="h-20"
                data-testid="item-description"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} disabled={!newItemData.name.trim()}>
              Create {activeTab === "categories" ? "Category" : "Tag"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Page data-testid="categories-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <PageTitle>
              Categories & Tags
            </PageTitle>
            <PageActions>
              <div className="hidden md:flex items-center gap-2">
                <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="create-desktop">
                  <Plus className="h-4 w-4 mr-2" />
                  New {activeTab === "categories" ? "Category" : "Tag"}
                </Button>
              </div>
            </PageActions>
          </PageToolbar>
          
          <div className="mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="search-input"
              />
            </div>
          </div>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Categories ({mockCategories.length})
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags ({mockTags.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-4">
            {filteredCategories.length === 0 ? (
              searchQuery ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms.
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={<FolderPlus className="h-8 w-8 text-muted-foreground" />}
                  title="No categories yet"
                  description="Create your first category to organize your posts."
                  action={{
                    label: "Create Category",
                    onClick: () => setIsCreateDialogOpen(true)
                  }}
                />
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tags" className="space-y-4">
            {filteredTags.length === 0 ? (
              searchQuery ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No tags found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms.
                  </p>
                </div>
              ) : (
                <EmptyState
                  icon={<Tag className="h-8 w-8 text-muted-foreground" />}
                  title="No tags yet"
                  description="Create your first tag to help categorize your content."
                  action={{
                    label: "Create Tag",
                    onClick: () => setIsCreateDialogOpen(true)
                  }}
                />
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredTags.map(tag => (
                  <TagCard key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageBody>

      {/* Mobile FAB */}
      <FAB 
        onClick={() => setIsCreateDialogOpen(true)}
        aria-label={`Create new ${activeTab === "categories" ? "category" : "tag"}`}
        data-testid="create-fab"
      >
        New {activeTab === "categories" ? "Category" : "Tag"}
      </FAB>

      <CreateDialog />
    </Page>
  );
}