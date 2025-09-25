import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Tag as TagIcon } from "lucide-react";

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  postData: {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    status: string;
    featured: boolean;
    allowComments: boolean;
    seoTitle: string;
    seoDescription: string;
    publishDate: string;
  };
}

export function PostPreviewModal({ isOpen, onClose, postData }: PostPreviewModalProps) {
  const previewDate = postData.publishDate || new Date().toISOString().split('T')[0];
  const formattedDate = new Date(previewDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="post-preview-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Post Preview
          </DialogTitle>
          <DialogDescription>
            This is how your post will appear to readers
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={postData.status === 'published' ? 'default' : 'secondary'} data-testid="preview-status">
              {postData.status.charAt(0).toUpperCase() + postData.status.slice(1)}
            </Badge>
            {postData.featured && (
              <Badge variant="outline" data-testid="preview-featured">
                Featured
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Author
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight" data-testid="preview-title">
              {postData.title || "Untitled Post"}
            </h1>
            
            {/* Excerpt */}
            {postData.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="preview-excerpt">
                {postData.excerpt}
              </p>
            )}
          </div>

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {postData.category && (
              <Badge variant="outline" className="font-medium" data-testid="preview-category">
                {postData.category}
              </Badge>
            )}
            {postData.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {postData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs" data-testid={`preview-tag-${index}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="border-t pt-6">
            <div 
              className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none
                prose-headings:font-medium prose-headings:text-foreground
                prose-p:text-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-em:text-foreground
                prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-muted prose-pre:text-foreground
                prose-blockquote:text-foreground prose-blockquote:border-l-border
                prose-hr:border-border
                prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground
                prose-table:text-foreground prose-thead:text-foreground prose-tbody:text-foreground
                prose-th:border-border prose-td:border-border"
              dangerouslySetInnerHTML={{ 
                __html: postData.content || '<p class="text-muted-foreground italic">No content provided</p>' 
              }}
              data-testid="preview-content"
            />
          </div>

          {/* Comments indicator */}
          {postData.allowComments && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground italic">
                Comments are enabled for this post
              </p>
            </div>
          )}

          {/* SEO Preview */}
          {(postData.seoTitle || postData.seoDescription) && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">SEO Preview</h3>
              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="text-blue-600 text-lg font-medium" data-testid="preview-seo-title">
                  {postData.seoTitle || postData.title || "Untitled Post"}
                </div>
                {postData.seoDescription && (
                  <div className="text-sm text-muted-foreground mt-1" data-testid="preview-seo-description">
                    {postData.seoDescription}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} data-testid="preview-close">
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}