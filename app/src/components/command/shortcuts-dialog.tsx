'use client'

import { memo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { KEYBOARD_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts'

interface ShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ShortcutsDialog = memo(function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  // Group shortcuts by category
  const grouped = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = []
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, typeof KEYBOARD_SHORTCUTS[number][]>)

  const categoryOrder = ['Navigation', 'Selection', 'Actions', 'Global']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {categoryOrder.map(category => {
            const shortcuts = grouped[category]
            if (!shortcuts) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map(shortcut => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Press <kbd className="bg-muted px-1 rounded">Esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  )
})
