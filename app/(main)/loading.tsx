import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Hero Skeleton */}
      <div className="hidden md:block relative w-full min-h-[500px] bg-background">
        <div className="max-w-[100rem] mx-auto px-12 py-8">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <div className="md:col-span-2 h-[500px]">
              <Skeleton className="h-full w-full rounded-[32px]" />
            </div>
            <div className="h-[500px]">
              <Skeleton className="h-full w-full rounded-[32px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-8">
        <div className="flex items-center justify-between md:justify-center mb-8">
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="flex gap-4 md:gap-8 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 flex-1">
              <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* City Section Skeleton */}
      <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-3xl" />
          ))}
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="max-w-[100rem] mx-auto px-2 md:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
