'use client'

import { useState, useMemo } from 'react'
import { Tables } from '@/lib/types'
import { EmailListItem } from './email-list-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_CONFIG, PRIORITY_ORDER, Priority } from '@/lib/email-config'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { updatePriority } from '@/lib/actions'
import { toast } from 'sonner'

type ProcessedEmail = Tables<'processed_emails'>

interface EmailListProps {
  emails: ProcessedEmail[]
  selectedIds: Set<string>
  focusedIndex: number
  onSelect: (id: string, index: number) => void
  onFocus: (index: number) => void
  onEmailClick: (email: ProcessedEmail) => void
  onShiftClick: (index: number) => void
  onPriorityChange?: () => void
}

// Draggable email item wrapper
function DraggableEmailItem({
  email,
  index,
  isSelected,
  isFocused,
  onSelect,
  onFocus,
  onClick,
  onShiftClick,
}: {
  email: ProcessedEmail
  index: number
  isSelected: boolean
  isFocused: boolean
  onSelect: (id: string, index: number) => void
  onFocus: (index: number) => void
  onClick: (email: ProcessedEmail) => void
  onShiftClick: (index: number) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: email.id,
    data: { email, index },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(isDragging && 'opacity-50')}
    >
      <EmailListItem
        email={email}
        index={index}
        isSelected={isSelected}
        isFocused={isFocused}
        onSelect={onSelect}
        onFocus={onFocus}
        onClick={onClick}
        onShiftClick={onShiftClick}
      />
    </div>
  )
}

// Droppable priority group
function DroppablePriorityGroup({
  priority,
  children,
  isOver,
}: {
  priority: string
  children: React.ReactNode
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: `priority-${priority}`,
    data: { priority },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-colors duration-200',
        isOver && 'bg-accent/50 ring-2 ring-primary ring-inset'
      )}
    >
      {children}
    </div>
  )
}

export function EmailList({
  emails,
  selectedIds,
  focusedIndex,
  onSelect,
  onFocus,
  onEmailClick,
  onShiftClick,
  onPriorityChange
}: EmailListProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px drag threshold to prevent accidental drags
      },
    })
  )

  const activeEmail = useMemo(
    () => (activeId ? emails.find((e) => e.id === activeId) : null),
    [activeId, emails]
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id
    if (overId && typeof overId === 'string' && overId.startsWith('priority-')) {
      setOverId(overId)
    } else {
      setOverId(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over) return

    const overId = over.id as string
    if (!overId.startsWith('priority-')) return

    const newPriority = overId.replace('priority-', '') as Priority
    const draggedEmail = active.data.current?.email as ProcessedEmail

    if (!draggedEmail || draggedEmail.priority === newPriority) return

    try {
      await updatePriority([draggedEmail.id], newPriority)
      toast.success(`Moved to ${PRIORITY_CONFIG[newPriority].label}`)
      onPriorityChange?.()
    } catch {
      toast.error('Failed to update priority')
    }
  }

  // Group emails by priority with calculated start indices
  const groupedWithIndices = useMemo(() => {
    const grouped: Record<string, ProcessedEmail[]> = {}
    emails.forEach((email) => {
      const priority = email.priority || 'low'
      if (!grouped[priority]) grouped[priority] = []
      grouped[priority].push(email)
    })

    // Calculate start indices for each priority group
    let runningIndex = 0
    const startIndices: Record<string, number> = {}
    PRIORITY_ORDER.forEach((priority) => {
      startIndices[priority] = runningIndex
      runningIndex += (grouped[priority]?.length || 0)
    })

    return { grouped, startIndices }
  }, [emails])

  const { grouped, startIndices } = groupedWithIndices

  const toggleGroup = (priority: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(priority)) {
        next.delete(priority)
      } else {
        next.add(priority)
      }
      return next
    })
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 opacity-50" />
        <p>No emails to display</p>
        <p className="text-sm mt-1">Run /digest in Claude Code to process emails</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="h-full">
        <div role="listbox" aria-label="Email list">
          {PRIORITY_ORDER.map(priority => {
            const priorityEmails = grouped[priority] || []
            const config = PRIORITY_CONFIG[priority]
            const isCollapsed = collapsedGroups.has(priority)
            const startIndex = startIndices[priority]
            const isDropTarget = overId === `priority-${priority}`

            // Track indices for this group
            const emailsWithIndex = priorityEmails.map((email, i) => ({
              email,
              index: startIndex + i
            }))

            return (
              <DroppablePriorityGroup
                key={priority}
                priority={priority}
                isOver={isDropTarget}
              >
                <Collapsible
                  open={!isCollapsed}
                  onOpenChange={() => toggleGroup(priority)}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent/50 transition-colors border-b">
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isCollapsed && '-rotate-90'
                      )}
                    />
                    <span className={cn('font-semibold text-sm', config.color)}>
                      {config.label}
                    </span>
                    <Badge variant="outline" className={cn('text-xs', config.color)}>
                      {priorityEmails.length}
                    </Badge>
                    {isDropTarget && (
                      <Badge variant="default" className="text-xs ml-auto">
                        Drop here
                      </Badge>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {emailsWithIndex.map(({ email, index }) => (
                      <DraggableEmailItem
                        key={email.id}
                        email={email}
                        index={index}
                        isSelected={selectedIds.has(email.id)}
                        isFocused={focusedIndex === index}
                        onSelect={onSelect}
                        onFocus={onFocus}
                        onClick={onEmailClick}
                        onShiftClick={onShiftClick}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </DroppablePriorityGroup>
            )
          })}
        </div>
      </ScrollArea>

      {/* Drag overlay for visual feedback */}
      <DragOverlay>
        {activeEmail && (
          <div className="bg-background border rounded-md shadow-lg opacity-90">
            <EmailListItem
              email={activeEmail}
              index={0}
              isSelected={false}
              isFocused={false}
              onSelect={() => {}}
              onFocus={() => {}}
              onClick={() => {}}
              onShiftClick={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
