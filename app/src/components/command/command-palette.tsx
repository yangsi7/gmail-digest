'use client'

import { memo } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Archive,
  Ban,
  Keyboard,
  Reply,
  RefreshCw,
  ExternalLink,
  CheckSquare,
  XSquare
} from 'lucide-react'

interface CommandAction {
  id: string
  label: string
  shortcut?: string
  icon: React.ReactNode
  onSelect: () => void
  group: 'actions' | 'navigation' | 'help'
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDismiss: () => void
  onBlacklist: () => void
  onReply: () => void
  onSelectAll: () => void
  onClearSelection: () => void
  onRefresh: () => void
  onShowHelp: () => void
  selectedEmail?: { gmail_id: string } | null
}

export const CommandPalette = memo(function CommandPalette({
  open,
  onOpenChange,
  onDismiss,
  onBlacklist,
  onReply,
  onSelectAll,
  onClearSelection,
  onRefresh,
  onShowHelp,
  selectedEmail
}: CommandPaletteProps) {
  const actions: CommandAction[] = [
    {
      id: 'dismiss',
      label: 'Dismiss selected emails',
      shortcut: 'd',
      icon: <Archive className="h-4 w-4" />,
      onSelect: () => {
        onDismiss()
        onOpenChange(false)
      },
      group: 'actions'
    },
    {
      id: 'blacklist',
      label: 'Blacklist sender',
      shortcut: 'b',
      icon: <Ban className="h-4 w-4" />,
      onSelect: () => {
        onBlacklist()
        onOpenChange(false)
      },
      group: 'actions'
    },
    {
      id: 'reply',
      label: 'Reply to email',
      shortcut: 'r',
      icon: <Reply className="h-4 w-4" />,
      onSelect: () => {
        onReply()
        onOpenChange(false)
      },
      group: 'actions'
    },
    {
      id: 'select-all',
      label: 'Select all emails',
      shortcut: '⌘A',
      icon: <CheckSquare className="h-4 w-4" />,
      onSelect: () => {
        onSelectAll()
        onOpenChange(false)
      },
      group: 'actions'
    },
    {
      id: 'clear-selection',
      label: 'Clear selection',
      shortcut: 'Esc',
      icon: <XSquare className="h-4 w-4" />,
      onSelect: () => {
        onClearSelection()
        onOpenChange(false)
      },
      group: 'actions'
    },
    {
      id: 'open-gmail',
      label: 'Open in Gmail',
      icon: <ExternalLink className="h-4 w-4" />,
      onSelect: () => {
        if (selectedEmail) {
          window.open(`https://mail.google.com/mail/u/0/#inbox/${selectedEmail.gmail_id}`, '_blank')
        }
        onOpenChange(false)
      },
      group: 'navigation'
    },
    {
      id: 'refresh',
      label: 'Refresh emails',
      icon: <RefreshCw className="h-4 w-4" />,
      onSelect: () => {
        onRefresh()
        onOpenChange(false)
      },
      group: 'navigation'
    },
    {
      id: 'shortcuts',
      label: 'Show keyboard shortcuts',
      shortcut: '?',
      icon: <Keyboard className="h-4 w-4" />,
      onSelect: () => {
        onShowHelp()
        onOpenChange(false)
      },
      group: 'help'
    },
  ]

  const actionItems = actions.filter(a => a.group === 'actions')
  const navItems = actions.filter(a => a.group === 'navigation')
  const helpItems = actions.filter(a => a.group === 'help')

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          {actionItems.map(action => (
            <CommandItem
              key={action.id}
              onSelect={action.onSelect}
              className="gap-2"
            >
              {action.icon}
              <span>{action.label}</span>
              {action.shortcut && (
                <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                  {action.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {navItems.map(action => (
            <CommandItem
              key={action.id}
              onSelect={action.onSelect}
              className="gap-2"
            >
              {action.icon}
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          {helpItems.map(action => (
            <CommandItem
              key={action.id}
              onSelect={action.onSelect}
              className="gap-2"
            >
              {action.icon}
              <span>{action.label}</span>
              {action.shortcut && (
                <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                  {action.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
})
