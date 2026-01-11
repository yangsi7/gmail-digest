'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateNavigationProps {
  selectedDate: string
  onNavigate: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
  isToday: boolean
}

export function DateNavigation({
  selectedDate,
  onNavigate,
  onGoToToday,
  isToday
}: DateNavigationProps) {
  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onNavigate('prev')}
        aria-label="Previous day"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <p className="text-sm text-muted-foreground min-w-[200px] text-center">
        {formattedDate}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onNavigate('next')}
        disabled={isToday}
        aria-label="Next day"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {!isToday && (
        <Button
          variant="outline"
          size="sm"
          className="ml-2 text-xs"
          onClick={onGoToToday}
        >
          Today
        </Button>
      )}
    </div>
  )
}
