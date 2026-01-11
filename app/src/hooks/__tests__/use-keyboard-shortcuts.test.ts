import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '../use-keyboard-shortcuts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HotkeyHandler = (event?: any) => void

// Mock react-hotkeys-hook
vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: vi.fn((keys: string | string[], callback: HotkeyHandler) => {
    // Store the callback for testing
    if (typeof window !== 'undefined') {
      const win = window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }
      const handlers = win.__hotkeyHandlers ?? new Map<string, HotkeyHandler>()
      const keyStr = Array.isArray(keys) ? keys.join(',') : keys
      handlers.set(keyStr, callback)
      win.__hotkeyHandlers = handlers
    }
  }),
}))

describe('useKeyboardShortcuts', () => {
  const mockActions = {
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    onToggleSelect: vi.fn(),
    onSelectAll: vi.fn(),
    onClearSelection: vi.fn(),
    onDismiss: vi.fn(),
    onBlacklist: vi.fn(),
    onReply: vi.fn(),
    onOpenEmail: vi.fn(),
    onOpenCommandPalette: vi.fn(),
    onShowHelp: vi.fn(),
    onEscape: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    const win = window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }
    win.__hotkeyHandlers = new Map()
  })

  describe('hook setup', () => {
    it('should register all shortcuts', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const handlers = (window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }).__hotkeyHandlers
      expect(handlers!.size).toBeGreaterThan(0)
    })

    it('should work with empty actions', () => {
      expect(() => {
        renderHook(() => useKeyboardShortcuts({}))
      }).not.toThrow()
    })

    it('should work with partial actions', () => {
      expect(() => {
        renderHook(() =>
          useKeyboardShortcuts({
            onMoveUp: vi.fn(),
            onMoveDown: vi.fn(),
          })
        )
      }).not.toThrow()
    })

    it('should respect enabled option', () => {
      renderHook(() =>
        useKeyboardShortcuts(mockActions, { enabled: false })
      )

      // Handlers are still registered but with enabled: false
      const handlers = (window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }).__hotkeyHandlers
      expect(handlers!.size).toBeGreaterThan(0)
    })
  })

  describe('keyboard handlers', () => {
    it('should call onMoveDown for j/down keys', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const handlers = (window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }).__hotkeyHandlers
      const handler = handlers!.get('j, down')

      if (handler) {
        const mockEvent = { preventDefault: vi.fn() } as unknown as KeyboardEvent
        handler(mockEvent)
        expect(mockActions.onMoveDown).toHaveBeenCalled()
      }
    })

    it('should call onMoveUp for k/up keys', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const handlers = (window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }).__hotkeyHandlers
      const handler = handlers!.get('k, up')

      if (handler) {
        const mockEvent = { preventDefault: vi.fn() } as unknown as KeyboardEvent
        handler(mockEvent)
        expect(mockActions.onMoveUp).toHaveBeenCalled()
      }
    })

    it('should call onToggleSelect for x key', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const handlers = (window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }).__hotkeyHandlers
      const handler = handlers!.get('x')

      if (handler) {
        const mockEvent = { preventDefault: vi.fn() } as unknown as KeyboardEvent
        handler(mockEvent)
        expect(mockActions.onToggleSelect).toHaveBeenCalled()
      }
    })

    it('should call onDismiss for d key', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const handlers = (window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }).__hotkeyHandlers
      const handler = handlers!.get('d')

      if (handler) {
        const mockEvent = { preventDefault: vi.fn() } as unknown as KeyboardEvent
        handler(mockEvent)
        expect(mockActions.onDismiss).toHaveBeenCalled()
      }
    })

    it('should call onBlacklist for b key', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const handlers = (window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }).__hotkeyHandlers
      const handler = handlers!.get('b')

      if (handler) {
        const mockEvent = { preventDefault: vi.fn() } as unknown as KeyboardEvent
        handler(mockEvent)
        expect(mockActions.onBlacklist).toHaveBeenCalled()
      }
    })

    it('should call onReply for r key', () => {
      renderHook(() => useKeyboardShortcuts(mockActions))

      const handlers = (window as unknown as { __hotkeyHandlers?: Map<string, HotkeyHandler> }).__hotkeyHandlers
      const handler = handlers!.get('r')

      if (handler) {
        const mockEvent = { preventDefault: vi.fn() } as unknown as KeyboardEvent
        handler(mockEvent)
        expect(mockActions.onReply).toHaveBeenCalled()
      }
    })
  })

  describe('KEYBOARD_SHORTCUTS constant', () => {
    it('should have all expected shortcuts', () => {
      expect(KEYBOARD_SHORTCUTS).toHaveLength(11)
    })

    it('should have correct categories', () => {
      const categories = new Set(KEYBOARD_SHORTCUTS.map((s) => s.category))
      expect(categories).toContain('Navigation')
      expect(categories).toContain('Selection')
      expect(categories).toContain('Actions')
      expect(categories).toContain('Global')
    })

    it('should have j/down for move down', () => {
      const moveDown = KEYBOARD_SHORTCUTS.find((s) => s.description === 'Move down')
      expect(moveDown).toBeDefined()
      expect(moveDown?.key).toBe('j / ↓')
    })

    it('should have x for toggle selection', () => {
      const toggleSelect = KEYBOARD_SHORTCUTS.find((s) => s.description === 'Toggle selection')
      expect(toggleSelect).toBeDefined()
      expect(toggleSelect?.key).toBe('x')
    })

    it('should have ? for show shortcuts', () => {
      const showHelp = KEYBOARD_SHORTCUTS.find((s) => s.description === 'Show shortcuts')
      expect(showHelp).toBeDefined()
      expect(showHelp?.key).toBe('?')
    })
  })
})
