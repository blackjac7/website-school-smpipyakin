"use client";

export function KaryaCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50 dark:border-gray-700">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function KaryaStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 animate-pulse"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-16 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function FeaturedSkeleton() {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="aspect-[4/3] rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 animate-pulse"
            >
              <div className="w-32 h-24 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {[...Array(6)].map((_, i) => (
        <KaryaCardSkeleton key={i} />
      ))}
    </div>
  );
}
