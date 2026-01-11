'use client'

import { useMemo, useCallback, Suspense } from 'react'
import { useEmails, getFlatEmailList, ProcessedEmail } from '@/hooks/use-emails'
import { useSelection } from '@/hooks/use-selection'
import { useEmailNavigation } from '@/hooks/use-email-navigation'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useDateNavigation, useDashboardActions } from '@/hooks/use-dashboard-state'
import { ErrorBoundary } from '@/components/error-boundary'
import { SplitView } from '@/components/layout/split-view'
import { EmailList } from '@/components/email/email-list'
import { EmailDetail } from '@/components/email/email-detail'
import { BulkToolbar } from '@/components/email/bulk-toolbar'
import { CommandPalette } from '@/components/command/command-palette'
import { ShortcutsDialog } from '@/components/command/shortcuts-dialog'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { DateNavigation } from '@/components/dashboard/date-navigation'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { SearchBar } from '@/components/dashboard/search-bar'
import { FilterChips } from '@/components/dashboard/filter-chips'
import { useEmailFilter } from '@/hooks/use-email-filter'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Keyboard, Command } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

function DashboardContent() {
  // Date navigation (must come first, provides date for useEmails)
  const dateNav = useDateNavigation()

  // Fetch emails for selected date
  const { emails, digest, drafts, loading, error, refetch, optimisticDismiss } = useEmails(dateNav.selectedDate)
  const flatEmails = useMemo(() => getFlatEmailList(emails), [emails])

  // Search and filter
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredEmails,
    emailCounts
  } = useEmailFilter(flatEmails)

  // Selection state
  const {
    selectedIds,
    toggle,
    rangeSelect,
    selectAll,
    clearSelection,
    selectedCount
  } = useSelection<ProcessedEmail>()

  // Dashboard actions and dialog states
  const actions = useDashboardActions({
    flatEmails: filteredEmails,
    selectedIds,
    selectedCount,
    clearSelection,
    refetch,
    optimisticDismiss
  })

  // Email list navigation
  const {
    focusedIndex,
    moveUp,
    moveDown,
    moveTo
  } = useEmailNavigation(filteredEmails.length)

  // Derived state
  const focusedEmail = filteredEmails[focusedIndex] || null
  const selectedDraft = useMemo(() => {
    if (!actions.selectedEmail) return null
    return drafts.find(d => d.gmail_id === actions.selectedEmail?.gmail_id) || null
  }, [actions.selectedEmail, drafts])

  // Keyboard handlers
  const handleOpenEmail = useCallback(() => {
    if (focusedEmail) {
      actions.setSelectedEmail(focusedEmail)
    }
  }, [focusedEmail, actions])

  const handleToggleSelect = useCallback(() => {
    if (focusedEmail) {
      toggle(focusedEmail.id, focusedIndex)
    }
  }, [focusedEmail, focusedIndex, toggle])

  const handleSelectAll = useCallback(() => {
    selectAll(filteredEmails)
  }, [filteredEmails, selectAll])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onMoveUp: moveUp,
    onMoveDown: moveDown,
    onToggleSelect: handleToggleSelect,
    onSelectAll: handleSelectAll,
    onClearSelection: clearSelection,
    onDismiss: actions.handleDismiss,
    onBlacklist: actions.handleBlacklist,
    onReply: actions.handleReply,
    onOpenEmail: handleOpenEmail,
    onEscape: actions.handleEscape,
    onOpenCommandPalette: () => actions.setCommandPaletteOpen(true),
    onShowHelp: () => actions.setShortcutsOpen(true)
  })

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">Error: {error}</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gmail Digest</h1>
          <DateNavigation
            selectedDate={dateNav.selectedDate}
            onNavigate={dateNav.navigateDate}
            onGoToToday={dateNav.goToToday}
            isToday={dateNav.isToday}
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => actions.setShortcutsOpen(true)}
          >
            <Keyboard className="h-4 w-4" />
            <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">?</kbd>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => actions.setCommandPaletteOpen(true)}
          >
            <Command className="h-4 w-4" />
            <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          </Button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="px-6 py-3 border-b flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search emails..."
          />
        </div>
        <FilterChips
          filters={filters}
          onFilterChange={setFilters}
          emailCounts={emailCounts}
        />
      </div>

      {/* Summary Cards */}
      <SummaryCards
        digest={digest}
        emails={flatEmails}
        draftsCount={drafts.length}
      />

      {/* Split View */}
      <div className="flex-1 px-6 pb-6">
        <ErrorBoundary>
          <SplitView
            left={
              <EmailList
                emails={filteredEmails}
                selectedIds={selectedIds}
                focusedIndex={focusedIndex}
                onSelect={toggle}
                onFocus={moveTo}
                onEmailClick={actions.handleEmailClick}
                onShiftClick={(index) => rangeSelect(index, filteredEmails)}
                onPriorityChange={refetch}
              />
            }
            right={
              <EmailDetail
                email={actions.selectedEmail}
                draft={selectedDraft}
                onDismiss={actions.handleDismiss}
                onBlacklist={actions.handleBlacklist}
                onReply={actions.handleReply}
                onDraftSaved={() => {
                  refetch()
                  toast.success('Draft saved successfully')
                }}
              />
            }
          />
        </ErrorBoundary>
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkToolbar
        selectedCount={selectedCount}
        onDismiss={actions.handleDismiss}
        onBlacklist={actions.handleBlacklist}
        onClearSelection={clearSelection}
      />

      {/* Blacklist Confirmation Dialog */}
      <AlertDialog
        open={actions.blacklistDialogOpen}
        onOpenChange={(open) => !open && actions.closeBlacklistDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blacklist Sender</AlertDialogTitle>
            <AlertDialogDescription>
              This will blacklist emails from{' '}
              <span className="font-mono font-semibold">
                {actions.pendingBlacklistEmail?.split('@')[1]}
              </span>
              . Future emails from this domain will be filtered out of your digest.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={actions.confirmBlacklist}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Blacklist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Bar */}
      <footer className="border-t px-6 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            {filteredEmails.length === flatEmails.length
              ? `${flatEmails.length} emails`
              : `${filteredEmails.length} of ${flatEmails.length} emails`}
          </span>
          {selectedCount > 0 && (
            <span className="text-primary">{selectedCount} selected</span>
          )}
        </div>
        <div>
          Press <kbd className="bg-muted px-1 rounded">?</kbd> for keyboard shortcuts
        </div>
      </footer>

      {/* Command Palette */}
      <CommandPalette
        open={actions.commandPaletteOpen}
        onOpenChange={actions.setCommandPaletteOpen}
        onDismiss={actions.handleDismiss}
        onBlacklist={actions.handleBlacklist}
        onReply={actions.handleReply}
        onSelectAll={handleSelectAll}
        onClearSelection={clearSelection}
        onRefresh={refetch}
        onShowHelp={() => actions.setShortcutsOpen(true)}
        selectedEmail={actions.selectedEmail}
      />

      {/* Shortcuts Dialog */}
      <ShortcutsDialog
        open={actions.shortcutsDialogOpen}
        onOpenChange={actions.setShortcutsOpen}
      />
    </main>
  )
}

// Wrap with Suspense for useSearchParams support
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
