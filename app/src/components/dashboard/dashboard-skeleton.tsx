'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </header>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Split view skeleton */}
      <div className="flex-1 px-6 pb-6 flex gap-4">
        {/* Email list skeleton */}
        <div className="w-1/2 border rounded-lg">
          <div className="space-y-1 p-2">
            {/* Priority header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>

            {/* Email items */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border-b border-border/50">
                <Skeleton className="h-4 w-4 mt-0.5 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail pane skeleton */}
        <div className="w-1/2 border rounded-lg p-4 flex flex-col items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-full mb-4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </div>

      {/* Footer skeleton */}
      <footer className="border-t px-6 py-2 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-48" />
      </footer>
    </main>
  )
}
