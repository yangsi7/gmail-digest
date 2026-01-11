import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEmailNavigation } from '../use-email-navigation'

describe('useEmailNavigation', () => {
  describe('initialization', () => {
    it('should initialize with focusedIndex at 0', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      expect(result.current.focusedIndex).toBe(0)
    })

    it('should initialize with no expanded item', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      expect(result.current.expandedId).toBeNull()
    })

    it('should handle empty list (totalItems = 0)', () => {
      const { result } = renderHook(() => useEmailNavigation(0))

      expect(result.current.focusedIndex).toBe(0)
    })
  })

  describe('moveDown', () => {
    it('should increment focusedIndex', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.moveDown()
      })

      expect(result.current.focusedIndex).toBe(1)
    })

    it('should not exceed totalItems - 1', () => {
      const { result } = renderHook(() => useEmailNavigation(3))

      act(() => {
        result.current.moveDown()
        result.current.moveDown()
        result.current.moveDown()
        result.current.moveDown()
      })

      expect(result.current.focusedIndex).toBe(2) // max is 2 for 3 items
    })
  })

  describe('moveUp', () => {
    it('should decrement focusedIndex', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.moveDown()
        result.current.moveDown()
        result.current.moveUp()
      })

      expect(result.current.focusedIndex).toBe(1)
    })

    it('should not go below 0', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.moveUp()
        result.current.moveUp()
      })

      expect(result.current.focusedIndex).toBe(0)
    })
  })

  describe('moveTo', () => {
    it('should move to specific index', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.moveTo(5)
      })

      expect(result.current.focusedIndex).toBe(5)
    })

    it('should clamp to valid range (lower bound)', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.moveTo(-5)
      })

      expect(result.current.focusedIndex).toBe(0)
    })

    it('should clamp to valid range (upper bound)', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.moveTo(100)
      })

      expect(result.current.focusedIndex).toBe(9) // max is 9 for 10 items
    })
  })

  describe('setFocusedIndex', () => {
    it('should set focused index directly', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.setFocusedIndex(7)
      })

      expect(result.current.focusedIndex).toBe(7)
    })
  })

  describe('expandedId', () => {
    it('should toggle expanded state', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.toggleExpanded('email-1')
      })

      expect(result.current.expandedId).toBe('email-1')

      act(() => {
        result.current.toggleExpanded('email-1')
      })

      expect(result.current.expandedId).toBeNull()
    })

    it('should switch to different expanded item', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.toggleExpanded('email-1')
      })

      act(() => {
        result.current.toggleExpanded('email-2')
      })

      expect(result.current.expandedId).toBe('email-2')
    })

    it('should set expanded id directly', () => {
      const { result } = renderHook(() => useEmailNavigation(10))

      act(() => {
        result.current.setExpandedId('email-5')
      })

      expect(result.current.expandedId).toBe('email-5')
    })
  })

  describe('totalItems changes', () => {
    it('should clamp focusedIndex when totalItems decreases', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => useEmailNavigation(totalItems),
        { initialProps: { totalItems: 10 } }
      )

      act(() => {
        result.current.moveTo(8)
      })

      expect(result.current.focusedIndex).toBe(8)

      // Reduce total items - focusedIndex should clamp
      rerender({ totalItems: 5 })

      expect(result.current.focusedIndex).toBe(4) // clamped to max valid index
    })

    it('should keep focusedIndex when totalItems increases', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => useEmailNavigation(totalItems),
        { initialProps: { totalItems: 5 } }
      )

      act(() => {
        result.current.moveTo(3)
      })

      rerender({ totalItems: 10 })

      expect(result.current.focusedIndex).toBe(3) // unchanged
    })
  })
})
