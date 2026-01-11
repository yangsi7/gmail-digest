'use client'

import { Button } from '@/components/ui/button'
import { Archive, Ban, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkToolbarProps {
  selectedCount: number
  onDismiss: () => void
  onBlacklist: () => void
  onClearSelection: () => void
  className?: string
}

export function BulkToolbar({
  selectedCount,
  onDismiss,
  onBlacklist,
  onClearSelection,
  className
}: BulkToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      role="toolbar"
      aria-label={`Bulk actions for ${selectedCount} selected email${selectedCount > 1 ? 's' : ''}`}
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-4 py-2',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        'border rounded-lg shadow-lg',
        'animate-in slide-in-from-bottom-4 duration-200',
        className
      )}
    >
      <span className="text-sm font-medium" aria-live="polite">
        {selectedCount} selected
      </span>

      <div className="h-4 w-px bg-border" aria-hidden="true" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="gap-1.5"
        aria-label={`Dismiss ${selectedCount} selected email${selectedCount > 1 ? 's' : ''}`}
      >
        <Archive className="h-4 w-4" aria-hidden="true" />
        Dismiss
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onBlacklist}
        className="gap-1.5 text-destructive hover:text-destructive"
        aria-label="Blacklist sender of selected email"
      >
        <Ban className="h-4 w-4" aria-hidden="true" />
        Blacklist
      </Button>

      <div className="h-4 w-px bg-border" aria-hidden="true" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onClearSelection}
        className="h-8 w-8"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
