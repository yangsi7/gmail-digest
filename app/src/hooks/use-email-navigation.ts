'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseEmailNavigationReturn {
  focusedIndex: number
  setFocusedIndex: (index: number) => void
  moveUp: () => void
  moveDown: () => void
  moveTo: (index: number) => void
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  toggleExpanded: (id: string) => void
}

export function useEmailNavigation(totalItems: number): UseEmailNavigationReturn {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Track total items to clamp index
  const totalItemsRef = useRef(totalItems)

  // Update ref in effect, not during render
  useEffect(() => {
    totalItemsRef.current = totalItems
  }, [totalItems])

  // Compute clamped focused index - auto-adjusts when totalItems changes
  const clampedFocusedIndex = totalItems > 0
    ? Math.min(focusedIndex, totalItems - 1)
    : 0

  const moveUp = useCallback(() => {
    setFocusedIndex(prev => Math.max(0, prev - 1))
  }, [])

  const moveDown = useCallback(() => {
    setFocusedIndex(prev => Math.min(totalItemsRef.current - 1, prev + 1))
  }, [])

  const moveTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(totalItemsRef.current - 1, index))
    setFocusedIndex(clamped)
  }, [])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  return {
    focusedIndex: clampedFocusedIndex,
    setFocusedIndex,
    moveUp,
    moveDown,
    moveTo,
    expandedId,
    setExpandedId,
    toggleExpanded
  }
}
