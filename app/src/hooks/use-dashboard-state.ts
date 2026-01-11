'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { dismissEmails, undoDismiss, blacklistSender } from '@/lib/actions'
import { toast } from 'sonner'
import type { ProcessedEmail } from './use-emails'

interface UseDashboardActionsProps {
  flatEmails: ProcessedEmail[]
  selectedIds: Set<string>
  selectedCount: number
  clearSelection: () => void
  refetch: () => Promise<void>
  optimisticDismiss: (ids: string[]) => void
}

interface DialogState {
  blacklistOpen: boolean
  commandPaletteOpen: boolean
  shortcutsOpen: boolean
  pendingBlacklistEmail: string | null
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * Hook for managing dashboard date navigation with URL state persistence
 * Separated from actions to avoid circular dependencies
 */
export function useDateNavigation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get date from URL or default to today
  const urlDate = searchParams.get('date')
  const initialDate = urlDate && isValidDate(urlDate) ? urlDate : getTodayDate()
  const [selectedDate, setSelectedDate] = useState<string>(initialDate)

  // Sync URL → state on hydration (fixes SSR mismatch)
  useEffect(() => {
    const urlDate = searchParams.get('date')
    if (urlDate && isValidDate(urlDate) && urlDate !== selectedDate) {
      setSelectedDate(urlDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount to sync after hydration

  // Sync state → URL when date changes
  useEffect(() => {
    const currentUrlDate = searchParams.get('date')
    const today = getTodayDate()

    // Only update URL if date differs and it's not today (keep URL clean for today)
    if (selectedDate !== today) {
      if (currentUrlDate !== selectedDate) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('date', selectedDate)
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      }
    } else if (currentUrlDate) {
      // Remove date param if it's today
      const params = new URLSearchParams(searchParams.toString())
      params.delete('date')
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [selectedDate, searchParams, router, pathname])

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate(current => {
      const date = new Date(current)
      date.setDate(date.getDate() + (direction === 'next' ? 1 : -1))
      return date.toISOString().split('T')[0]
    })
  }, [])

  const goToToday = useCallback(() => {
    setSelectedDate(getTodayDate())
  }, [])

  const isToday = useMemo(() =>
    selectedDate === getTodayDate(),
    [selectedDate]
  )

  return {
    selectedDate,
    navigateDate,
    goToToday,
    isToday
  }
}

/**
 * Hook for managing dashboard actions and dialog states
 */
export function useDashboardActions({
  flatEmails,
  selectedIds,
  selectedCount,
  clearSelection,
  refetch,
  optimisticDismiss
}: UseDashboardActionsProps) {
  // Selected email for detail view
  const [selectedEmail, setSelectedEmail] = useState<ProcessedEmail | null>(null)

  // Dialog states consolidated
  const [dialogState, setDialogState] = useState<DialogState>({
    blacklistOpen: false,
    commandPaletteOpen: false,
    shortcutsOpen: false,
    pendingBlacklistEmail: null
  })

  // Dialog controls
  const openBlacklistDialog = useCallback((email: string) => {
    setDialogState(prev => ({
      ...prev,
      blacklistOpen: true,
      pendingBlacklistEmail: email
    }))
  }, [])

  const closeBlacklistDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      blacklistOpen: false,
      pendingBlacklistEmail: null
    }))
  }, [])

  const setCommandPaletteOpen = useCallback((open: boolean) => {
    setDialogState(prev => ({ ...prev, commandPaletteOpen: open }))
  }, [])

  const setShortcutsOpen = useCallback((open: boolean) => {
    setDialogState(prev => ({ ...prev, shortcutsOpen: open }))
  }, [])

  // Email actions
  const handleEmailClick = useCallback((email: ProcessedEmail) => {
    setSelectedEmail(email)
  }, [])

  const handleDismiss = useCallback(async () => {
    const ids = selectedCount > 0
      ? Array.from(selectedIds)
      : selectedEmail
        ? [selectedEmail.id]
        : []

    if (ids.length === 0) return

    // Optimistic update
    optimisticDismiss(ids)
    clearSelection()
    setSelectedEmail(null)

    try {
      await dismissEmails(ids)
      toast.success(`${ids.length} email${ids.length > 1 ? 's' : ''} dismissed`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await undoDismiss(ids)
            refetch()
          }
        }
      })
    } catch {
      toast.error('Failed to dismiss emails')
      refetch() // Restore state
    }
  }, [selectedIds, selectedCount, selectedEmail, optimisticDismiss, clearSelection, refetch])

  const handleBlacklist = useCallback(() => {
    const email = selectedCount === 1
      ? flatEmails.find(e => selectedIds.has(e.id))
      : selectedEmail

    if (!email?.sender_email) {
      toast.error('Select an email to blacklist')
      return
    }

    openBlacklistDialog(email.sender_email)
  }, [selectedIds, selectedCount, selectedEmail, flatEmails, openBlacklistDialog])

  const confirmBlacklist = useCallback(async () => {
    const pendingEmail = dialogState.pendingBlacklistEmail
    if (!pendingEmail) return

    try {
      await blacklistSender(pendingEmail)
      toast.success(`Blacklisted: ${pendingEmail.split('@')[1]}`)
      closeBlacklistDialog()
    } catch {
      toast.error('Failed to blacklist sender')
    }
  }, [dialogState.pendingBlacklistEmail, closeBlacklistDialog])

  const handleReply = useCallback(() => {
    if (!selectedEmail) {
      toast.info('Select an email to reply')
      return
    }
    const gmailUrl = `https://mail.google.com/mail/u/0/?compose=new&to=${selectedEmail.sender_email}&su=Re: ${encodeURIComponent(selectedEmail.subject || '')}`
    window.open(gmailUrl, '_blank')
  }, [selectedEmail])

  const handleEscape = useCallback(() => {
    if (selectedEmail) {
      setSelectedEmail(null)
    } else if (selectedCount > 0) {
      clearSelection()
    }
  }, [selectedEmail, selectedCount, clearSelection])

  return {
    // Email state
    selectedEmail,
    setSelectedEmail,
    handleEmailClick,

    // Dialog state
    blacklistDialogOpen: dialogState.blacklistOpen,
    pendingBlacklistEmail: dialogState.pendingBlacklistEmail,
    closeBlacklistDialog,
    commandPaletteOpen: dialogState.commandPaletteOpen,
    setCommandPaletteOpen,
    shortcutsDialogOpen: dialogState.shortcutsOpen,
    setShortcutsOpen,

    // Actions
    handleDismiss,
    handleBlacklist,
    confirmBlacklist,
    handleReply,
    handleEscape
  }
}
