"use client";

import { memo } from "react";

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

// Base skeleton component
export const Skeleton = memo(
  ({ className = "", animate = true }: SkeletonProps) => (
    <div
      className={`bg-gray-200 rounded-md ${animate ? "animate-pulse" : ""} ${className}`}
    />
  )
);
Skeleton.displayName = "Skeleton";

// Preset skeleton components for common use cases
export const SkeletonText = memo(
  ({ lines = 3, className = "" }: { lines?: number; className?: string }) => (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  )
);
SkeletonText.displayName = "SkeletonText";

export const SkeletonCard = memo(
  ({ className = "" }: { className?: string }) => (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-4 ${className}`}
    >
      <Skeleton className="h-40 w-full rounded-lg mb-4" />
      <Skeleton className="h-5 w-2/3 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
);
SkeletonCard.displayName = "SkeletonCard";

export const SkeletonTable = memo(
  ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div
        className="grid gap-4 p-4 bg-gray-50 border-b border-gray-100"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 border-b border-gray-50"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  )
);
SkeletonTable.displayName = "SkeletonTable";

export const SkeletonStat = memo(
  ({ className = "" }: { className?: string }) => (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-5 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-1/3 mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
);
SkeletonStat.displayName = "SkeletonStat";

export const SkeletonProfile = memo(
  ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
);
SkeletonProfile.displayName = "SkeletonProfile";

// Dashboard-specific skeleton layouts
export const SkeletonDashboard = memo(() => (
  <div className="space-y-6">
    {/* Stats Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonTable rows={5} columns={4} />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  </div>
));
SkeletonDashboard.displayName = "SkeletonDashboard";

export const SkeletonList = memo(({ items = 5 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
      >
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
      </div>
    ))}
  </div>
));
SkeletonList.displayName = "SkeletonList";

export default Skeleton;
