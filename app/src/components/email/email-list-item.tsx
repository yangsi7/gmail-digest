'use client'

import { memo } from 'react'
import { Tables } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getCategoryConfig } from '@/lib/email-config'

type ProcessedEmail = Tables<'processed_emails'>

interface EmailListItemProps {
  email: ProcessedEmail
  index: number
  isSelected: boolean
  isFocused: boolean
  onSelect: (id: string, index: number) => void
  onFocus: (index: number) => void
  onClick: (email: ProcessedEmail) => void
  onShiftClick: (index: number) => void
}

export const EmailListItem = memo(function EmailListItem({
  email,
  index,
  isSelected,
  isFocused,
  onSelect,
  onFocus,
  onClick,
  onShiftClick
}: EmailListItemProps) {
  const catConfig = getCategoryConfig(email.category)
  const CatIcon = catConfig.icon

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault()
      onShiftClick(index)
    } else {
      onClick(email)
    }
  }

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(email.id, index)
  }

  const ariaLabel = [
    email.subject || '(No subject)',
    `from ${email.sender}`,
    catConfig.label,
    email.needs_response ? 'needs reply' : null,
    isSelected ? 'selected' : null
  ].filter(Boolean).join(', ')

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-label={ariaLabel}
      data-focused={isFocused}
      tabIndex={isFocused ? 0 : -1}
      onClick={handleClick}
      onFocus={() => onFocus(index)}
      className={cn(
        'group flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-border/50',
        'hover:bg-accent/50',
        isSelected && 'bg-accent/70',
        isFocused && 'ring-2 ring-ring ring-inset bg-accent/30'
      )}
    >
      <div
        className="pt-0.5"
        onClick={handleCheckboxChange}
      >
        <Checkbox
          checked={isSelected}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <CatIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Badge variant="outline" className="text-xs shrink-0">
            {catConfig.label}
          </Badge>
          {email.needs_response && (
            <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/50 shrink-0">
              Needs Reply
            </Badge>
          )}
        </div>
        <h3 className="font-medium truncate text-sm">
          {email.subject || '(No subject)'}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {email.sender} &lt;{email.sender_email}&gt;
        </p>
        {email.snippet && (
          <p className="text-xs text-muted-foreground/70 truncate">
            {email.snippet}
          </p>
        )}
      </div>
    </div>
  )
})
