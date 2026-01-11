'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '@/lib/email-config'

export type FilterType = 'priority' | 'category' | 'needs_response'

export interface FilterState {
  priority: string | null
  category: string | null
  needsResponse: boolean | null
}

interface FilterChipsProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  emailCounts?: {
    priorities: Record<string, number>
    categories: Record<string, number>
    needsResponse: number
  }
}

export function FilterChips({ filters, onFilterChange, emailCounts }: FilterChipsProps) {
  const togglePriority = (priority: string) => {
    onFilterChange({
      ...filters,
      priority: filters.priority === priority ? null : priority
    })
  }

  const toggleCategory = (category: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? null : category
    })
  }

  const toggleNeedsResponse = () => {
    onFilterChange({
      ...filters,
      needsResponse: filters.needsResponse === true ? null : true
    })
  }

  const clearAll = () => {
    onFilterChange({ priority: null, category: null, needsResponse: null })
  }

  const hasActiveFilters = filters.priority || filters.category || filters.needsResponse

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Priority Filters */}
      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
        <Badge
          key={key}
          variant={filters.priority === key ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-colors',
            filters.priority === key && config.color
          )}
          onClick={() => togglePriority(key)}
        >
          {config.label}
          {emailCounts?.priorities[key] ? ` (${emailCounts.priorities[key]})` : ''}
        </Badge>
      ))}

      <span className="text-muted-foreground">|</span>

      {/* Category Filters */}
      {Object.entries(CATEGORY_CONFIG).slice(0, 4).map(([key, config]) => {
        const Icon = config.icon
        return (
          <Badge
            key={key}
            variant={filters.category === key ? 'default' : 'outline'}
            className="cursor-pointer transition-colors gap-1"
            onClick={() => toggleCategory(key)}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      })}

      <span className="text-muted-foreground">|</span>

      {/* Needs Response Filter */}
      <Badge
        variant={filters.needsResponse ? 'default' : 'outline'}
        className={cn(
          'cursor-pointer transition-colors',
          filters.needsResponse && 'bg-amber-500 hover:bg-amber-600'
        )}
        onClick={toggleNeedsResponse}
      >
        Needs Reply
        {emailCounts?.needsResponse ? ` (${emailCounts.needsResponse})` : ''}
      </Badge>

      {/* Clear All */}
      {hasActiveFilters && (
        <Badge
          variant="secondary"
          className="cursor-pointer"
          onClick={clearAll}
        >
          Clear All
        </Badge>
      )}
    </div>
  )
}
