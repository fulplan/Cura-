import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Save, Eye, MoreHorizontal, ImagePlus, Tag, Settings, Globe } from "lucide-react";
import { useCreatePost } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { insertPostSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RichTextEditor, type RichTextEditorRef } from "@/components/ui/rich-text-editor";

interface NewPostPageProps {
  mode?: 'create' | 'edit';
  initialData?: any;
  isLoading?: boolean;
  onSave?: (data: any) => void;
  onPublish?: (data: any) => void;
  onPreview?: (data: any) => void;
}

export default function NewPostPage({ 
  mode = 'create',
  initialData,
  isLoading: externalLoading = false,
  onSave,
  onPublish,
  onPreview = (data) => console.log("Preview post:", data)
}: NewPostPageProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("content");
  const editorRef = useRef<RichTextEditorRef>(null);
  const { toast } = useToast();
  const createPostMutation = useCreatePost();
  const isLoading = externalLoading || createPostMutation.isPending;
  const [formData, setFormData] = useState(() => initialData || {
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [] as string[],
    status: "draft",
    featured: false,
    allowComments: true,
    seoTitle: "",
    seoDescription: "",
    publishDate: ""
  });

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(initialData);
      setIsDirty(false);
    }
  }, [initialData, mode]);

  const [newTag, setNewTag] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateField("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField("tags", formData.tags.filter((tag: string) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        onSave(formData);
        return;
      }
      
      // Validate required fields
      if (!formData.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Post title is required.",
          variant: "destructive",
        });
        return;
      }
      
      // Create slug from title if not provided
      const slug = formData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const postData = {
        ...formData,
        slug,
        status: "draft"
      };
      
      await createPostMutation.mutateAsync(postData);
      
      toast({
        title: "Success",
        description: "Post saved as draft successfully.",
      });
      
      setIsDirty(false);
      // Navigate back to posts list
      setLocation("/posts");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    try {
      if (onPublish) {
        onPublish({ ...formData, status: "published" });
        return;
      }
      
      // Validate required fields
      if (!formData.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Post title is required.",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.content.trim()) {
        toast({
          title: "Validation Error",
          description: "Post content is required.",
          variant: "destructive",
        });
        return;
      }
      
      // Create slug from title if not provided
      const slug = formData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const postData = {
        ...formData,
        slug,
        status: "published",
        publishedAt: new Date().toISOString()
      };
      
      await createPostMutation.mutateAsync(postData);
      
      toast({
        title: "Success",
        description: "Post published successfully!",
      });
      
      setIsDirty(false);
      // Navigate back to posts list
      setLocation("/posts");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    onPreview(formData);
  };

  const ContentTab = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Enter your post title..."
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="text-lg font-medium"
          data-testid="post-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <RichTextEditor
          ref={editorRef}
          content={formData.content}
          placeholder="Write your post content here..."
          onChange={(content) => updateField("content", content)}
          editorClassName="min-h-[300px] md:min-h-[400px]"
        />
        <p className="text-xs text-muted-foreground">
          {editorRef.current?.getText().length || 0} characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          placeholder="Brief description of your post..."
          value={formData.excerpt}
          onChange={(e) => updateField("excerpt", e.target.value)}
          className="h-20"
          data-testid="post-excerpt"
        />
        <p className="text-xs text-muted-foreground">
          Optional summary that appears in post previews
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <ImagePlus className="h-4 w-4 mr-2" />
          Add Media
        </Button>
        <Button variant="outline" size="sm" onClick={handlePreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>
    </div>
  );

  const MetaTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => updateField("category", value)}>
            <SelectTrigger data-testid="post-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1"
              data-testid="new-tag-input"
            />
            <Button type="button" onClick={addTag} size="sm">
              <Tag className="h-4 w-4" />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag: string) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                  data-testid={`tag-${tag}`}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishDate">Publish Date</Label>
          <Input
            id="publishDate"
            type="datetime-local"
            value={formData.publishDate}
            onChange={(e) => updateField("publishDate", e.target.value)}
            data-testid="publish-date"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to publish immediately
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">Post Options</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Featured Post</Label>
            <p className="text-sm text-muted-foreground">
              Show this post prominently
            </p>
          </div>
          <Switch
            checked={formData.featured}
            onCheckedChange={(checked) => updateField("featured", checked)}
            data-testid="featured-toggle"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Allow Comments</Label>
            <p className="text-sm text-muted-foreground">
              Let readers comment on this post
            </p>
          </div>
          <Switch
            checked={formData.allowComments}
            onCheckedChange={(checked) => updateField("allowComments", checked)}
            data-testid="comments-toggle"
          />
        </div>
      </div>
    </div>
  );

  const SeoTab = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="seoTitle">SEO Title</Label>
        <Input
          id="seoTitle"
          placeholder="SEO optimized title..."
          value={formData.seoTitle}
          onChange={(e) => updateField("seoTitle", e.target.value)}
          data-testid="seo-title"
        />
        <p className="text-xs text-muted-foreground">
          {formData.seoTitle.length}/60 characters recommended
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="seoDescription">Meta Description</Label>
        <Textarea
          id="seoDescription"
          placeholder="Brief description for search engines..."
          value={formData.seoDescription}
          onChange={(e) => updateField("seoDescription", e.target.value)}
          className="h-20"
          data-testid="seo-description"
        />
        <p className="text-xs text-muted-foreground">
          {formData.seoDescription.length}/160 characters recommended
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Search Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-lg text-blue-600 font-medium line-clamp-1">
            {formData.seoTitle || formData.title || "Your Post Title"}
          </div>
          <div className="text-sm text-green-700">
            yoursite.com/posts/{formData.title.toLowerCase().replace(/\s+/g, "-") || "post-slug"}
          </div>
          <div className="text-sm text-gray-600 line-clamp-2">
            {formData.seoDescription || formData.excerpt || "Your post description will appear here..."}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Page data-testid="new-post-page">
      <PageHeader>
        <div className="px-4 md:px-6">
          <PageToolbar>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation("/posts")}
                data-testid="back-button"
                aria-label="Go back to posts"
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <PageTitle className="type-heading">
                  {formData.title || (mode === 'edit' ? "Edit Post" : "New Post")}
                </PageTitle>
                {isDirty && (
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                    Unsaved
                  </Badge>
                )}
              </div>
            </div>
            <PageActions>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" onClick={handlePreview} data-testid="preview-desktop">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSave} 
                  disabled={isLoading}
                  data-testid="save-desktop"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : (mode === 'edit' ? "Save Changes" : "Save Draft")}
                </Button>
                <Button 
                  onClick={handlePublish} 
                  disabled={isLoading}
                  data-testid="publish-desktop"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {isLoading ? "Publishing..." : "Publish"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="more-actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Schedule Post</DropdownMenuItem>
                    <DropdownMenuItem>Save as Template</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Discard Changes</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </PageActions>
          </PageToolbar>
        </div>
      </PageHeader>

      <PageBody className="px-4 md:px-6">
        {/* Mobile Tabs */}
        <div className="md:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="text-xs">
                <div className="flex flex-col items-center gap-1">
                  <span>Content</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="meta" className="text-xs">
                <div className="flex flex-col items-center gap-1">
                  <span>Settings</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs">
                <div className="flex flex-col items-center gap-1">
                  <span>SEO</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <ContentTab />
            </TabsContent>
            
            <TabsContent value="meta" className="space-y-4">
              <MetaTab />
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-4">
              <SeoTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-2 space-y-6">
            <ContentTab />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Post Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MetaTab />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SeoTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageBody>

      {/* Mobile Action Bar */}
      <ActionBar show={true}>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave} 
            disabled={isLoading}
            data-testid="save-mobile"
          >
            <Save className="h-4 w-4 mr-1" />
            {isLoading ? "Saving..." : (mode === 'edit' ? "Save" : "Save")}
          </Button>
          <Button 
            size="sm" 
            onClick={handlePublish} 
            disabled={isLoading}
            data-testid="publish-mobile"
          >
            <Globe className="h-4 w-4 mr-1" />
            {isLoading ? "Publishing..." : "Publish"}
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handlePreview} data-testid="preview-mobile">
          <Eye className="h-4 w-4" />
        </Button>
      </ActionBar>
    </Page>
  );
}