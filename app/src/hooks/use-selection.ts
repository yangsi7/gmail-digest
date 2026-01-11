'use client'

import { useState, useCallback, useMemo } from 'react'

interface UseSelectionReturn<T extends { id: string }> {
  selectedIds: Set<string>
  lastSelectedIndex: number | null
  isSelected: (id: string) => boolean
  toggle: (id: string, index: number) => void
  rangeSelect: (index: number, items: T[]) => void
  selectAll: (items: T[]) => void
  clearSelection: () => void
  selectOnly: (id: string, index: number) => void
  selectedCount: number
}

export function useSelection<T extends { id: string }>(): UseSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])

  const toggle = useCallback((id: string, index: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    setLastSelectedIndex(index)
  }, [])

  const rangeSelect = useCallback((endIndex: number, items: T[]) => {
    if (lastSelectedIndex === null) {
      // No previous selection, just select this one
      if (items[endIndex]) {
        setSelectedIds(new Set([items[endIndex].id]))
        setLastSelectedIndex(endIndex)
      }
      return
    }

    const start = Math.min(lastSelectedIndex, endIndex)
    const end = Math.max(lastSelectedIndex, endIndex)

    setSelectedIds(prev => {
      const next = new Set(prev)
      for (let i = start; i <= end; i++) {
        if (items[i]) {
          next.add(items[i].id)
        }
      }
      return next
    })
  }, [lastSelectedIndex])

  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(new Set(items.map(item => item.id)))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setLastSelectedIndex(null)
  }, [])

  const selectOnly = useCallback((id: string, index: number) => {
    setSelectedIds(new Set([id]))
    setLastSelectedIndex(index)
  }, [])

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  return {
    selectedIds,
    lastSelectedIndex,
    isSelected,
    toggle,
    rangeSelect,
    selectAll,
    clearSelection,
    selectOnly,
    selectedCount
  }
}
