import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Image, Users, Calendar, Settings, Trash2, Plus } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  className?: string;
  "data-testid"?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className,
  "data-testid": testId
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-4",
      className
    )} data-testid={testId || "empty-state"}>
      {icon && (
        <div className="mb-4 p-3 bg-muted rounded-full">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || "default"}
          size="sm"
          data-testid="empty-state-action"
        >
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Predefined empty states for common scenarios
export const EmptyStates = {
  Posts: (onCreatePost: () => void) => (
    <EmptyState
      icon={<FileText className="h-8 w-8 text-muted-foreground" />}
      title="No posts yet"
      description="Create your first post to get started with your content."
      action={{
        label: "Create Post",
        onClick: onCreatePost
      }}
    />
  ),
  
  Media: (onUpload: () => void) => (
    <EmptyState
      icon={<Image className="h-8 w-8 text-muted-foreground" />}
      title="No media files"
      description="Upload images, videos, and documents to your media library."
      action={{
        label: "Upload Files",
        onClick: onUpload
      }}
    />
  ),
  
  Users: (onInviteUser: () => void) => (
    <EmptyState
      icon={<Users className="h-8 w-8 text-muted-foreground" />}
      title="No users yet"
      description="Invite team members to collaborate on your content."
      action={{
        label: "Invite User",
        onClick: onInviteUser
      }}
    />
  ),
  
  Schedule: (onCreateSchedule: () => void) => (
    <EmptyState
      icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
      title="No scheduled content"
      description="Schedule posts and content to be published automatically."
      action={{
        label: "Schedule Content",
        onClick: onCreateSchedule
      }}
    />
  ),
  
  Trash: () => (
    <EmptyState
      icon={<Trash2 className="h-8 w-8 text-muted-foreground" />}
      title="Trash is empty"
      description="Deleted items will appear here and can be restored or permanently deleted."
    />
  ),
  
  Settings: () => (
    <EmptyState
      icon={<Settings className="h-8 w-8 text-muted-foreground" />}
      title="No settings configured"
      description="Configure your application settings to customize the experience."
    />
  )
};