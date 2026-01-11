'use client'

import { useState, useCallback } from 'react'
import { useCompletion } from '@ai-sdk/react'
import { saveDraft } from '@/lib/actions'
import type { Tone } from '@/lib/ai/prompts'

interface UseDraftGenerationParams {
  emailId: string
  senderName: string
  senderEmail: string
  subject: string
  snippet: string
  category: string
  priority: string
  userName?: string
  onSaveSuccess?: () => void
}

interface UseDraftGenerationReturn {
  // Generated content
  completion: string
  editedContent: string
  setEditedContent: (content: string) => void

  // States
  isGenerating: boolean
  isSaving: boolean
  error: string | null

  // Actions
  generate: (tone?: Tone) => void
  regenerate: (tone?: Tone) => void
  stopGeneration: () => void
  saveDraftContent: () => Promise<void>
  clearDraft: () => void

  // Current tone
  currentTone: Tone
  setTone: (tone: Tone) => void
}

export function useDraftGeneration({
  emailId,
  senderName,
  senderEmail,
  subject,
  snippet,
  category,
  priority,
  userName,
  onSaveSuccess,
}: UseDraftGenerationParams): UseDraftGenerationReturn {
  const [editedContent, setEditedContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTone, setTone] = useState<Tone>('professional')

  const { completion, isLoading, complete, stop } = useCompletion({
    api: '/api/generate-draft',
    streamProtocol: 'text', // Use text stream protocol for simple text completion
    body: {
      senderName,
      senderEmail,
      subject,
      snippet,
      category,
      priority,
      userName,
    },
    onFinish: (_prompt, completion) => {
      setEditedContent(completion)
      setError(null)
    },
    onError: (err) => {
      setError(err.message || 'Failed to generate draft')
    },
  })

  const generate = useCallback((tone: Tone = currentTone) => {
    setError(null)
    setTone(tone)
    complete('', { body: { tone } })
  }, [complete, currentTone])

  const regenerate = useCallback((tone: Tone = currentTone) => {
    setEditedContent('')
    generate(tone)
  }, [generate, currentTone])

  const stopGeneration = useCallback(() => {
    stop()
    // Keep whatever was generated so far
    if (completion) {
      setEditedContent(completion)
    }
  }, [stop, completion])

  const saveDraftContent = useCallback(async () => {
    if (!editedContent.trim()) {
      setError('Cannot save empty draft')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await saveDraft(emailId, editedContent.trim())
      onSaveSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }, [emailId, editedContent, onSaveSuccess])

  const clearDraft = useCallback(() => {
    setEditedContent('')
    setError(null)
  }, [])

  return {
    completion,
    editedContent,
    setEditedContent,
    isGenerating: isLoading,
    isSaving,
    error,
    generate,
    regenerate,
    stopGeneration,
    saveDraftContent,
    clearDraft,
    currentTone,
    setTone,
  }
}
