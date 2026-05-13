import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-[100rem] mx-auto px-4 md:px-12 py-8">
      {/* Search Header Skeleton */}
      <div className="mb-12 space-y-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar Skeleton (Desktop) */}
        <div className="hidden md:block w-64 space-y-8 flex-shrink-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32 rounded" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results Grid Skeleton */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
