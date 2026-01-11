'use server'

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function dismissEmails(ids: string[]) {
  const { error } = await supabase
    .from('processed_emails')
    .update({ status: 'dismissed' })
    .in('id', ids)

  if (error) throw new Error(error.message)
  return { success: true, count: ids.length }
}

export async function undoDismiss(ids: string[]) {
  const { error } = await supabase
    .from('processed_emails')
    .update({ status: 'active' })
    .in('id', ids)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function archiveEmails(ids: string[]) {
  const { error } = await supabase
    .from('processed_emails')
    .update({ status: 'archived' })
    .in('id', ids)

  if (error) throw new Error(error.message)
  return { success: true, count: ids.length }
}

export async function blacklistSender(senderEmail: string, reason?: string) {
  // Extract domain or use full email as pattern
  const pattern = senderEmail.includes('@')
    ? senderEmail.split('@')[1] // Domain pattern
    : senderEmail

  const { error } = await supabase
    .from('blacklist')
    .insert({
      email_pattern: pattern,
      reason: reason || `Blacklisted from dashboard`
    })

  if (error) {
    if (error.code === '23505') {
      // Already exists
      return { success: true, message: 'Pattern already blacklisted' }
    }
    throw new Error(error.message)
  }

  return { success: true, pattern }
}

export async function removeFromBlacklist(id: string) {
  const { error } = await supabase
    .from('blacklist')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function saveDraft(
  emailId: string,
  content: string,
  subject?: string
) {
  // Check if draft exists for this email
  const { data: existing } = await supabase
    .from('draft_responses')
    .select('id')
    .eq('gmail_id', emailId)
    .single()

  if (existing) {
    // Update existing draft
    const { error } = await supabase
      .from('draft_responses')
      .update({
        draft_content: content,
        draft_subject: subject,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (error) throw new Error(error.message)
    return { success: true, id: existing.id }
  } else {
    // Create new draft
    const { data, error } = await supabase
      .from('draft_responses')
      .insert({
        gmail_id: emailId,
        draft_content: content,
        draft_subject: subject,
        status: 'pending'
      })
      .select('id')
      .single()

    if (error) throw new Error(error.message)
    return { success: true, id: data.id }
  }
}

export async function updateDraftStatus(
  draftId: string,
  status: 'pending' | 'sent' | 'discarded'
) {
  const { error } = await supabase
    .from('draft_responses')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', draftId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function deleteDraft(draftId: string) {
  const { error } = await supabase
    .from('draft_responses')
    .delete()
    .eq('id', draftId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function getBlacklist() {
  const { data, error } = await supabase
    .from('blacklist')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function updatePriority(
  ids: string[],
  priority: 'critical' | 'high' | 'medium' | 'low'
) {
  const { error } = await supabase
    .from('processed_emails')
    .update({ priority })
    .in('id', ids)

  if (error) throw new Error(error.message)
  return { success: true, count: ids.length, priority }
}
