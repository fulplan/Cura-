import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter } from "lucide-react";

// Page Container
interface PageProps {
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function Page({ children, className, "data-testid": testId }: PageProps) {
  return (
    <div className={cn("flex flex-col h-full", className)} data-testid={testId}>
      {children}
    </div>
  );
}

// Page Header
interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
  "data-testid"?: string;
}

export function PageHeader({ children, className, sticky = true, "data-testid": testId }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        sticky && "sticky top-0 z-50",
        className
      )}
      data-testid={testId || "page-header"}
    >
      <div className="py-3 md:py-4">
        {children}
      </div>
    </header>
  );
}

// Page Title
interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
  description?: string;
  "data-testid"?: string;
}

export function PageTitle({ children, className, badge, description, "data-testid": testId }: PageTitleProps) {
  return (
    <div className={cn("space-y-1", className)} data-testid={testId || "page-title"}>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {children}
        </h1>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

// Page Toolbar (for search, filters, actions)
interface PageToolbarProps {
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function PageToolbar({ children, className, "data-testid": testId }: PageToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-center md:justify-between", className)} data-testid={testId || "page-toolbar"}>
      {children}
    </div>
  );
}

// Page Body
interface PageBodyProps {
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function PageBody({ children, className, "data-testid": testId }: PageBodyProps) {
  return (
    <main className={cn("flex-1 overflow-auto", className)} data-testid={testId || "page-body"}>
      {children}
    </main>
  );
}

// Page Actions (top-right actions on desktop)
interface PageActionsProps {
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function PageActions({ children, className, "data-testid": testId }: PageActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} data-testid={testId || "page-actions"}>
      {children}
    </div>
  );
}

// Mobile Action Bar (sticky bottom actions)
interface ActionBarProps {
  children: React.ReactNode;
  className?: string;
  show?: boolean;
  "data-testid"?: string;
}

export function ActionBar({ children, className, show = true, "data-testid": testId }: ActionBarProps) {
  if (!show) return null;

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-t px-4 py-3 pb-safe",
      className
    )} data-testid={testId || "action-bar"}>
      <div className="flex items-center justify-between gap-2">
        {children}
      </div>
    </div>
  );
}

// Floating Action Button
interface FABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
  "aria-label"?: string;
}

export function FAB({ onClick, icon = <Plus className="h-4 w-4" />, children, className, "data-testid": testId, "aria-label": ariaLabel }: FABProps) {
  return (
    <Button
      onClick={onClick}
      size={children ? "default" : "icon"}
      className={cn(
        "md:hidden fixed bottom-20 right-4 z-40 rounded-full shadow-lg",
        "hover:shadow-xl transition-all duration-200",
        children && "px-4",
        className
      )}
      data-testid={testId || "fab"}
      aria-label={ariaLabel || children?.toString() || "Floating action button"}
    >
      {icon}
      {children && <span className="ml-2">{children}</span>}
    </Button>
  );
}

// Filter Sheet (mobile filter overlay)
interface FilterSheetProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: string;
  className?: string;
  "data-testid"?: string;
}

export function FilterSheet({ 
  children, 
  trigger = (
    <Button variant="outline" size="sm" className="md:hidden" aria-label="Open filters">
      <Filter className="h-4 w-4 mr-2" />
      Filter
    </Button>
  ),
  title = "Filters",
  className,
  "data-testid": testId
}: FilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild data-testid={`${testId || 'filter-sheet'}-trigger`}>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className={cn("max-h-[80vh]", className)} data-testid={testId || "filter-sheet"}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}