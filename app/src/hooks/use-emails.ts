'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/types'

export type ProcessedEmail = Tables<'processed_emails'>
export type Digest = Tables<'digests'>
export type DraftResponse = Tables<'draft_responses'>

interface UseEmailsReturn {
  emails: ProcessedEmail[]
  digest: Digest | null
  drafts: DraftResponse[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  optimisticDismiss: (ids: string[]) => void
  optimisticRestore: () => void
}

export function useEmails(date?: string): UseEmailsReturn {
  const [emails, setEmails] = useState<ProcessedEmail[]>([])
  const [digest, setDigest] = useState<Digest | null>(null)
  const [drafts, setDrafts] = useState<DraftResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const targetDate = date || new Date().toISOString().split('T')[0]

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [emailsRes, digestRes, draftsRes] = await Promise.all([
        supabase
          .from('processed_emails')
          .select('*')
          .eq('digest_date', targetDate)
          .eq('status', 'active')
          .order('priority', { ascending: true }),
        supabase
          .from('digests')
          .select('*')
          .eq('date', targetDate)
          .maybeSingle(),
        supabase
          .from('draft_responses')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
      ])

      if (emailsRes.error) throw emailsRes.error
      if (draftsRes.error) throw draftsRes.error
      // Digest might not exist yet, that's ok

      setEmails(emailsRes.data || [])
      setDigest(digestRes.data)
      setDrafts(draftsRes.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [targetDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Optimistic updates
  const optimisticDismiss = useCallback((ids: string[]) => {
    setEmails(prev => prev.filter(e => !ids.includes(e.id)))
  }, [])

  const optimisticRestore = useCallback(() => {
    // For undo, we need to refetch to get the emails back
    fetchData()
  }, [fetchData])

  return {
    emails,
    digest,
    drafts,
    loading,
    error,
    refetch: fetchData,
    optimisticDismiss,
    optimisticRestore
  }
}

// Group emails by priority
export function groupEmailsByPriority(emails: ProcessedEmail[]) {
  return emails.reduce((acc, email) => {
    const priority = email.priority || 'low'
    if (!acc[priority]) acc[priority] = []
    acc[priority].push(email)
    return acc
  }, {} as Record<string, ProcessedEmail[]>)
}

// Get flat list of emails in priority order
export function getFlatEmailList(emails: ProcessedEmail[]): ProcessedEmail[] {
  const priorityOrder = ['critical', 'high', 'medium', 'low']
  const grouped = groupEmailsByPriority(emails)

  return priorityOrder.flatMap(priority => grouped[priority] || [])
}
