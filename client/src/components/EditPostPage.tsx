import { useParams } from "wouter";
import React from "react";
import { usePost, useUpdatePost } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import NewPostPage from "./NewPostPage";
import { LoadingCard } from "@/components/ui/loading";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, error } = usePost(id || "");
  const updateMutation = useUpdatePost();
  const { toast } = useToast();

  // Handle form save (update)
  const handleSave = async (formData: any) => {
    if (!id) return;
    
    try {
      await updateMutation.mutateAsync({ id, ...formData });
      toast({
        title: "Post updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form publish (update with published status)
  const handlePublish = async (formData: any) => {
    if (!id) return;
    
    try {
      await updateMutation.mutateAsync({ 
        id, 
        ...formData, 
        status: "published",
        publishedAt: new Date().toISOString()
      });
      toast({
        title: "Post published",
        description: "Your post has been published successfully.",
      });
    } catch (error) {
      toast({
        title: "Publish failed", 
        description: "Failed to publish your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle preview
  const handlePreview = (formData: any) => {
    console.log("Preview post:", formData);
    toast({
      title: "Preview mode",
      description: "Preview functionality will be implemented soon.",
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
        </div>
        <LoadingCard />
        <LoadingCard />
      </div>
    );
  }

  // Show error toast when error occurs
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Failed to load post",
        description: "Unable to load the post for editing. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Show error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Post not found</h1>
        <p className="text-muted-foreground">
          The post you're trying to edit could not be found.
        </p>
      </div>
    );
  }

  // Transform post data for the form
  const initialFormData = post ? {
    title: post.title || "",
    content: post.content || "",
    excerpt: post.excerpt || "",
    category: post.categoryId || "",
    tags: post.tags?.map((tag: any) => tag.name) || [],
    status: post.status || "draft",
    featured: post.featured || false,
    allowComments: post.allowComments !== false, // Default to true
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    publishDate: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : ""
  } : undefined;

  return (
    <NewPostPage
      mode="edit"
      initialData={initialFormData}
      onSave={handleSave}
      onPublish={handlePublish}
      onPreview={handlePreview}
      isLoading={updateMutation.isPending}
    />
  );
}