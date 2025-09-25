import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Loading Skeleton for cards
interface LoadingCardProps {
  className?: string;
  count?: number;
  "data-testid"?: string;
}

export function LoadingCard({ className, count = 1, "data-testid": testId }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("p-4 border rounded-lg space-y-3", className)} data-testid={`${testId || 'loading-card'}-${i}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/6" />
          </div>
        </div>
      ))}
    </>
  );
}

// Loading Skeleton for table rows
interface LoadingTableProps {
  className?: string;
  rows?: number;
  columns?: number;
  "data-testid"?: string;
}

export function LoadingTable({ className, rows = 5, columns = 4, "data-testid": testId }: LoadingTableProps) {
  return (
    <div className={cn("space-y-2", className)} data-testid={testId || "loading-table"}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton 
              key={j} 
              className={cn(
                "h-4",
                j === 0 ? "w-8" : j === 1 ? "w-1/3" : j === columns - 1 ? "w-16" : "w-1/4"
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading Skeleton for grid
interface LoadingGridProps {
  className?: string;
  items?: number;
  columns?: number;
  "data-testid"?: string;
}

export function LoadingGrid({ className, items = 12, columns = 3, "data-testid": testId }: LoadingGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-2 md:grid-cols-3",
      columns === 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      columns === 6 && "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
      className
    )} data-testid={testId || "loading-grid"}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Loading Page
interface LoadingPageProps {
  className?: string;
  "data-testid"?: string;
}

export function LoadingPage({ className, "data-testid": testId }: LoadingPageProps) {
  return (
    <div className={cn("p-6 space-y-6", className)} data-testid={testId || "loading-page"}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-16 ml-auto" />
      </div>
      <LoadingCard count={3} />
    </div>
  );
}