'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface EmailListSkeletonProps {
  count?: number
}

export function EmailListSkeleton({ count = 5 }: EmailListSkeletonProps) {
  return (
    <div className="space-y-1">
      {/* Priority group header skeleton */}
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-6 rounded-full" />
      </div>

      {/* Email item skeletons */}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 border-b border-border/50">
          {/* Checkbox */}
          <Skeleton className="h-4 w-4 mt-0.5 rounded" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Category + badges row */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>

            {/* Subject */}
            <Skeleton className="h-4 w-3/4" />

            {/* Sender */}
            <Skeleton className="h-3 w-1/2" />

            {/* Snippet */}
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
