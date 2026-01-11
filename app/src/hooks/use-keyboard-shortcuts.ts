'use client'

import { useHotkeys } from 'react-hotkeys-hook'

interface KeyboardActions {
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleSelect: () => void
  onSelectAll: () => void
  onClearSelection: () => void
  onDismiss: () => void
  onBlacklist: () => void
  onReply: () => void
  onOpenEmail: () => void
  onOpenCommandPalette: () => void
  onShowHelp: () => void
  onEscape: () => void
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean
  scope?: string
}

export function useKeyboardShortcuts(
  actions: Partial<KeyboardActions>,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, scope = 'inbox' } = options

  // Navigation
  useHotkeys('j, down', (e) => {
    e.preventDefault()
    actions.onMoveDown?.()
  }, { enabled, scopes: [scope] }, [actions.onMoveDown])

  useHotkeys('k, up', (e) => {
    e.preventDefault()
    actions.onMoveUp?.()
  }, { enabled, scopes: [scope] }, [actions.onMoveUp])

  // Selection
  useHotkeys('x', (e) => {
    e.preventDefault()
    actions.onToggleSelect?.()
  }, { enabled, scopes: [scope] }, [actions.onToggleSelect])

  useHotkeys('mod+a', (e) => {
    e.preventDefault()
    actions.onSelectAll?.()
  }, { enabled, scopes: [scope] }, [actions.onSelectAll])

  // Actions
  useHotkeys('d', (e) => {
    e.preventDefault()
    actions.onDismiss?.()
  }, { enabled, scopes: [scope] }, [actions.onDismiss])

  useHotkeys('b', (e) => {
    e.preventDefault()
    actions.onBlacklist?.()
  }, { enabled, scopes: [scope] }, [actions.onBlacklist])

  useHotkeys('r', (e) => {
    e.preventDefault()
    actions.onReply?.()
  }, { enabled, scopes: [scope] }, [actions.onReply])

  useHotkeys('enter, o', (e) => {
    e.preventDefault()
    actions.onOpenEmail?.()
  }, { enabled, scopes: [scope] }, [actions.onOpenEmail])

  // Global shortcuts (always enabled)
  useHotkeys('mod+k', (e) => {
    e.preventDefault()
    actions.onOpenCommandPalette?.()
  }, { enabled: true, enableOnFormTags: true }, [actions.onOpenCommandPalette])

  useHotkeys('shift+/', (e) => {
    e.preventDefault()
    actions.onShowHelp?.()
  }, { enabled: true }, [actions.onShowHelp])

  useHotkeys('escape', (e) => {
    e.preventDefault()
    actions.onEscape?.()
  }, { enabled: true }, [actions.onEscape])
}

// Shortcut definitions for help dialog
export const KEYBOARD_SHORTCUTS = [
  { key: 'j / ↓', description: 'Move down', category: 'Navigation' },
  { key: 'k / ↑', description: 'Move up', category: 'Navigation' },
  { key: 'Enter / o', description: 'Open email', category: 'Navigation' },
  { key: 'Escape', description: 'Close / Clear selection', category: 'Navigation' },
  { key: 'x', description: 'Toggle selection', category: 'Selection' },
  { key: '⌘ + A', description: 'Select all', category: 'Selection' },
  { key: 'd', description: 'Dismiss selected', category: 'Actions' },
  { key: 'b', description: 'Blacklist sender', category: 'Actions' },
  { key: 'r', description: 'Reply / Generate draft', category: 'Actions' },
  { key: '⌘ + K', description: 'Open command palette', category: 'Global' },
  { key: '?', description: 'Show shortcuts', category: 'Global' },
] as const
