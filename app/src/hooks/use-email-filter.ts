'use client'

import { useState, useMemo } from 'react'
import { ProcessedEmail } from './use-emails'
import { FilterState } from '@/components/dashboard/filter-chips'

interface UseEmailFilterReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: FilterState
  setFilters: (filters: FilterState) => void
  filteredEmails: ProcessedEmail[]
  emailCounts: {
    priorities: Record<string, number>
    categories: Record<string, number>
    needsResponse: number
  }
}

export function useEmailFilter(emails: ProcessedEmail[]): UseEmailFilterReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    priority: null,
    category: null,
    needsResponse: null
  })

  // Calculate counts for filter chips
  const emailCounts = useMemo(() => {
    const priorities: Record<string, number> = {}
    const categories: Record<string, number> = {}
    let needsResponse = 0

    emails.forEach(email => {
      // Priority counts
      const priority = email.priority || 'low'
      priorities[priority] = (priorities[priority] || 0) + 1

      // Category counts
      const category = email.category || 'other'
      categories[category] = (categories[category] || 0) + 1

      // Needs response count
      if (email.needs_response) {
        needsResponse++
      }
    })

    return { priorities, categories, needsResponse }
  }, [emails])

  // Filter emails based on search and filters
  const filteredEmails = useMemo(() => {
    let result = emails

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(email =>
        email.subject?.toLowerCase().includes(query) ||
        email.sender?.toLowerCase().includes(query) ||
        email.sender_email?.toLowerCase().includes(query) ||
        email.snippet?.toLowerCase().includes(query)
      )
    }

    // Priority filter
    if (filters.priority) {
      result = result.filter(email => email.priority === filters.priority)
    }

    // Category filter
    if (filters.category) {
      result = result.filter(email => email.category === filters.category)
    }

    // Needs response filter
    if (filters.needsResponse) {
      result = result.filter(email => email.needs_response === true)
    }

    return result
  }, [emails, searchQuery, filters])

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredEmails,
    emailCounts
  }
}
