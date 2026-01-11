import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from '../use-selection'

interface TestItem {
  id: string
  name: string
}

const createItems = (count: number): TestItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }))

describe('useSelection', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useSelection<TestItem>())

    expect(result.current.selectedIds.size).toBe(0)
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.lastSelectedIndex).toBeNull()
  })

  describe('toggle', () => {
    it('should add item to selection when toggling unselected item', () => {
      const { result } = renderHook(() => useSelection<TestItem>())

      act(() => {
        result.current.toggle('item-1', 1)
      })

      expect(result.current.selectedIds.has('item-1')).toBe(true)
      expect(result.current.selectedCount).toBe(1)
      expect(result.current.lastSelectedIndex).toBe(1)
    })

    it('should remove item from selection when toggling selected item', () => {
      const { result } = renderHook(() => useSelection<TestItem>())

      act(() => {
        result.current.toggle('item-1', 1)
      })
      act(() => {
        result.current.toggle('item-1', 1)
      })

      expect(result.current.selectedIds.has('item-1')).toBe(false)
      expect(result.current.selectedCount).toBe(0)
    })

    it('should support multiple selections', () => {
      const { result } = renderHook(() => useSelection<TestItem>())

      act(() => {
        result.current.toggle('item-1', 1)
        result.current.toggle('item-2', 2)
        result.current.toggle('item-3', 3)
      })

      expect(result.current.selectedCount).toBe(3)
      expect(result.current.isSelected('item-1')).toBe(true)
      expect(result.current.isSelected('item-2')).toBe(true)
      expect(result.current.isSelected('item-3')).toBe(true)
    })
  })

  describe('rangeSelect', () => {
    it('should select single item when no previous selection', () => {
      const { result } = renderHook(() => useSelection<TestItem>())
      const items = createItems(5)

      act(() => {
        result.current.rangeSelect(2, items)
      })

      expect(result.current.selectedCount).toBe(1)
      expect(result.current.isSelected('item-2')).toBe(true)
    })

    it('should select range from last selected to target index', () => {
      const { result } = renderHook(() => useSelection<TestItem>())
      const items = createItems(5)

      // First, select an item to establish lastSelectedIndex
      act(() => {
        result.current.toggle('item-1', 1)
      })

      // Then range select to index 3
      act(() => {
        result.current.rangeSelect(3, items)
      })

      expect(result.current.isSelected('item-1')).toBe(true)
      expect(result.current.isSelected('item-2')).toBe(true)
      expect(result.current.isSelected('item-3')).toBe(true)
      expect(result.current.selectedCount).toBe(3)
    })

    it('should work with reverse range (selecting upward)', () => {
      const { result } = renderHook(() => useSelection<TestItem>())
      const items = createItems(5)

      // First, select item at index 3
      act(() => {
        result.current.toggle('item-3', 3)
      })

      // Range select to index 1 (going upward)
      act(() => {
        result.current.rangeSelect(1, items)
      })

      expect(result.current.isSelected('item-1')).toBe(true)
      expect(result.current.isSelected('item-2')).toBe(true)
      expect(result.current.isSelected('item-3')).toBe(true)
    })
  })

  describe('selectAll', () => {
    it('should select all items', () => {
      const { result } = renderHook(() => useSelection<TestItem>())
      const items = createItems(5)

      act(() => {
        result.current.selectAll(items)
      })

      expect(result.current.selectedCount).toBe(5)
      items.forEach((item) => {
        expect(result.current.isSelected(item.id)).toBe(true)
      })
    })
  })

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      const { result } = renderHook(() => useSelection<TestItem>())

      act(() => {
        result.current.toggle('item-1', 1)
        result.current.toggle('item-2', 2)
      })

      expect(result.current.selectedCount).toBe(2)

      act(() => {
        result.current.clearSelection()
      })

      expect(result.current.selectedCount).toBe(0)
      expect(result.current.lastSelectedIndex).toBeNull()
    })
  })

  describe('selectOnly', () => {
    it('should select only one item, clearing others', () => {
      const { result } = renderHook(() => useSelection<TestItem>())

      act(() => {
        result.current.toggle('item-1', 1)
        result.current.toggle('item-2', 2)
      })

      act(() => {
        result.current.selectOnly('item-3', 3)
      })

      expect(result.current.selectedCount).toBe(1)
      expect(result.current.isSelected('item-3')).toBe(true)
      expect(result.current.isSelected('item-1')).toBe(false)
      expect(result.current.isSelected('item-2')).toBe(false)
    })
  })

  describe('isSelected', () => {
    it('should return true for selected items', () => {
      const { result } = renderHook(() => useSelection<TestItem>())

      act(() => {
        result.current.toggle('item-1', 1)
      })

      expect(result.current.isSelected('item-1')).toBe(true)
      expect(result.current.isSelected('item-2')).toBe(false)
    })
  })
})
