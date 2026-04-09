import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn(
                "h-4 rounded",
                j === 0 ? "w-32" : j === cols - 1 ? "w-16" : "w-24"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-9 w-16 mt-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function CandidateCardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-5 w-16 rounded" />
      <Skeleton className="h-5 w-12 rounded" />
    </div>
  );
}
