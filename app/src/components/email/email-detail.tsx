'use client'

import { Tables } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Archive, Ban, Mail, Reply, ExternalLink } from 'lucide-react'
import { DraftGenerator } from './draft-generator'
import { getPriorityConfig, getCategoryConfig } from '@/lib/email-config'

type ProcessedEmail = Tables<'processed_emails'>
type DraftResponse = Tables<'draft_responses'>

interface EmailDetailProps {
  email: ProcessedEmail | null
  draft?: DraftResponse | null
  onDismiss: () => void
  onBlacklist: () => void
  onReply: () => void
  onOpenInGmail?: () => void
  onDraftSaved?: () => void
  userName?: string
}

export function EmailDetail({
  email,
  draft,
  onDismiss,
  onBlacklist,
  onReply,
  // onOpenInGmail - unused, component uses direct gmailUrl
  onDraftSaved,
  userName
}: EmailDetailProps) {
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
        <Mail className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg">Select an email to view</p>
        <p className="text-sm mt-2">Use j/k to navigate, Enter to select</p>
      </div>
    )
  }

  const catConfig = getCategoryConfig(email.category)
  const priorityConf = getPriorityConfig(email.priority)
  const CatIcon = catConfig.icon

  const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${email.gmail_id}`

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {email.subject || '(No subject)'}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span className="font-medium">{email.sender}</span>
              <span>&lt;{email.sender_email}&gt;</span>
            </div>
          </div>
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={priorityConf.color}>
            {priorityConf.label}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CatIcon className="h-3 w-3" />
            {catConfig.label}
          </Badge>
          {email.needs_response && (
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              Needs Reply
            </Badge>
          )}
          {email.received_at && (
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(email.received_at).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={onReply}
          className="gap-1.5"
        >
          <Reply className="h-4 w-4" />
          Reply
          <kbd className="ml-1 text-xs bg-muted px-1 rounded">r</kbd>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDismiss}
          className="gap-1.5"
        >
          <Archive className="h-4 w-4" />
          Dismiss
          <kbd className="ml-1 text-xs bg-muted px-1 rounded">d</kbd>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBlacklist}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Ban className="h-4 w-4" />
          Blacklist
          <kbd className="ml-1 text-xs bg-muted px-1 rounded">b</kbd>
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Email snippet/preview */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {email.snippet || 'No preview available'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-4">
              Full email content available in Gmail
            </p>
          </div>

          {/* AI Draft Generator - show for emails needing response */}
          {email.needs_response && (
            <>
              <Separator />
              <DraftGenerator
                emailId={email.gmail_id}
                senderName={email.sender || 'Unknown'}
                senderEmail={email.sender_email || ''}
                subject={email.subject || '(No subject)'}
                snippet={email.snippet || ''}
                category={email.category || 'other'}
                priority={email.priority || 'medium'}
                userName={userName}
                onSaveSuccess={onDraftSaved}
              />
            </>
          )}

          {/* Draft section */}
          {draft && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Reply className="h-4 w-4" />
                  Draft Response
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                    Pending
                  </Badge>
                </h3>
                {draft.draft_subject && (
                  <p className="text-sm font-medium">
                    Subject: {draft.draft_subject}
                  </p>
                )}
                <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/50 p-3 rounded-lg border">
                  {draft.draft_content}
                </pre>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
