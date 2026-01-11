'use client'

import { useState } from 'react'
import { Sparkles, Square, RefreshCw, Save, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useDraftGeneration } from '@/hooks/use-draft-generation'
import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/ai/prompts'

interface DraftGeneratorProps {
  emailId: string
  senderName: string
  senderEmail: string
  subject: string
  snippet: string
  category: string
  priority: string
  userName?: string
  onSaveSuccess?: () => void
  className?: string
}

const toneLabels: Record<Tone, { label: string; description: string }> = {
  professional: {
    label: 'Professional',
    description: 'Business-appropriate tone',
  },
  friendly: {
    label: 'Friendly',
    description: 'Warm but professional',
  },
  concise: {
    label: 'Concise',
    description: 'Brief and to the point',
  },
}

export function DraftGenerator({
  emailId,
  senderName,
  senderEmail,
  subject,
  snippet,
  category,
  priority,
  userName,
  onSaveSuccess,
  className,
}: DraftGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    completion,
    editedContent,
    setEditedContent,
    isGenerating,
    isSaving,
    error,
    generate,
    regenerate,
    stopGeneration,
    saveDraftContent,
    currentTone,
    setTone,
  } = useDraftGeneration({
    emailId,
    senderName,
    senderEmail,
    subject,
    snippet,
    category,
    priority,
    userName,
    onSaveSuccess,
  })

  // Display streaming content while generating, edited content otherwise
  const displayContent = isGenerating ? completion : editedContent

  const handleToneChange = (tone: Tone) => {
    setTone(tone)
    if (displayContent) {
      // If we already have content, regenerate with new tone
      regenerate(tone)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Draft Generator
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-3">
        {/* Tone Selector & Generate Controls */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[120px]">
                {toneLabels[currentTone].label}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(toneLabels) as Tone[]).map((tone) => (
                <DropdownMenuItem
                  key={tone}
                  onClick={() => handleToneChange(tone)}
                  className={cn(
                    'flex flex-col items-start',
                    currentTone === tone && 'bg-accent'
                  )}
                >
                  <span className="font-medium">{toneLabels[tone].label}</span>
                  <span className="text-xs text-muted-foreground">
                    {toneLabels[tone].description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isGenerating ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={stopGeneration}
            >
              <Square className="mr-2 h-3 w-3" />
              Stop
            </Button>
          ) : displayContent ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => regenerate()}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Regenerate
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => generate()}
            >
              <Sparkles className="mr-2 h-3 w-3" />
              Generate
            </Button>
          )}
        </div>

        {/* Draft Content Area */}
        <Textarea
          value={displayContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder={
            isGenerating
              ? 'Generating draft...'
              : 'Click "Generate" to create an AI draft response...'
          }
          className={cn(
            'min-h-[150px] resize-y',
            isGenerating && 'animate-pulse'
          )}
          disabled={isGenerating}
          aria-busy={isGenerating}
          aria-label="Draft response content"
        />

        {/* Error Display */}
        {error && (
          <p className="text-sm text-destructive" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        {/* Save Button */}
        {displayContent && !isGenerating && (
          <div className="flex justify-end">
            <Button
              onClick={saveDraftContent}
              disabled={isSaving || !editedContent.trim()}
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3 w-3" />
                  Save Draft
                </>
              )}
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
