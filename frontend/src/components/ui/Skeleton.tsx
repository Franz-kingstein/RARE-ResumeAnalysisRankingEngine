import { cn } from "../../utils/cn";

interface SkeletonProps {
  className?: string;
}

/** Animated shimmer placeholder — drop-in replacement for any loading element. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-violet-50 via-violet-100/60 to-violet-50",
        className,
      )}
    />
  );
}

/** Skeleton for a single candidate row in RankedShortlistCard. */
export function CandidateRowSkeleton() {
  return (
    <div className="grid grid-cols-[1.6fr_0.7fr_1fr_1.2fr] items-center gap-4 py-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-7 w-14 rounded-full" />
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-10 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-4/5" />
      </div>
    </div>
  );
}

/** Skeleton for an analytics chart card. */
export function ChartSkeleton() {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel">
      <Skeleton className="mb-4 h-4 w-36" />
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  );
}

/** Skeleton for a candidate directory card. */
export function CandidateCardSkeleton() {
  return (
    <div className="rounded-xl2 border border-violet-100 bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="ml-auto h-7 w-14 rounded-full" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-5 w-14 rounded-md" />
        ))}
      </div>
      <Skeleton className="mt-3 h-2.5 w-full" />
      <Skeleton className="mt-1.5 h-2.5 w-3/4" />
    </div>
  );
}
