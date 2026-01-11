import { describe, it, expect } from 'vitest'
import { groupEmailsByPriority, getFlatEmailList, ProcessedEmail } from '../use-emails'

// Mock email data for testing
const createMockEmail = (overrides: Partial<ProcessedEmail> = {}): ProcessedEmail => ({
  id: crypto.randomUUID(),
  gmail_id: `gmail_${crypto.randomUUID()}`,
  subject: 'Test Subject',
  sender_email: 'test@example.com',
  sender: 'Test Sender',
  snippet: 'Test snippet...',
  priority: 'medium',
  category: 'other',
  status: 'active',
  digest_date: '2026-01-09',
  received_at: new Date().toISOString(),
  needs_response: false,
  thread_id: null,
  processed_at: null,
  ...overrides,
})

describe('groupEmailsByPriority', () => {
  it('should group emails by priority', () => {
    const emails: ProcessedEmail[] = [
      createMockEmail({ priority: 'critical' }),
      createMockEmail({ priority: 'high' }),
      createMockEmail({ priority: 'medium' }),
      createMockEmail({ priority: 'low' }),
      createMockEmail({ priority: 'high' }),
    ]

    const grouped = groupEmailsByPriority(emails)

    expect(grouped.critical).toHaveLength(1)
    expect(grouped.high).toHaveLength(2)
    expect(grouped.medium).toHaveLength(1)
    expect(grouped.low).toHaveLength(1)
  })

  it('should handle empty email list', () => {
    const grouped = groupEmailsByPriority([])

    expect(grouped).toEqual({})
  })

  it('should handle null priority as low', () => {
    const emails: ProcessedEmail[] = [
      createMockEmail({ priority: null as unknown as string }),
    ]

    const grouped = groupEmailsByPriority(emails)

    expect(grouped.low).toHaveLength(1)
  })

  it('should preserve email data in groups', () => {
    const email = createMockEmail({
      priority: 'critical',
      subject: 'Important Email',
      sender_email: 'boss@company.com',
    })

    const grouped = groupEmailsByPriority([email])

    expect(grouped.critical[0].subject).toBe('Important Email')
    expect(grouped.critical[0].sender_email).toBe('boss@company.com')
  })
})

describe('getFlatEmailList', () => {
  it('should return emails in priority order: critical, high, medium, low', () => {
    const emails: ProcessedEmail[] = [
      createMockEmail({ priority: 'low', subject: 'Low Priority' }),
      createMockEmail({ priority: 'critical', subject: 'Critical Priority' }),
      createMockEmail({ priority: 'medium', subject: 'Medium Priority' }),
      createMockEmail({ priority: 'high', subject: 'High Priority' }),
    ]

    const flat = getFlatEmailList(emails)

    expect(flat[0].subject).toBe('Critical Priority')
    expect(flat[1].subject).toBe('High Priority')
    expect(flat[2].subject).toBe('Medium Priority')
    expect(flat[3].subject).toBe('Low Priority')
  })

  it('should handle empty email list', () => {
    const flat = getFlatEmailList([])

    expect(flat).toEqual([])
  })

  it('should handle emails with same priority', () => {
    const emails: ProcessedEmail[] = [
      createMockEmail({ priority: 'high', subject: 'First High' }),
      createMockEmail({ priority: 'high', subject: 'Second High' }),
      createMockEmail({ priority: 'high', subject: 'Third High' }),
    ]

    const flat = getFlatEmailList(emails)

    expect(flat).toHaveLength(3)
    expect(flat.every(e => e.priority === 'high')).toBe(true)
  })

  it('should handle missing priority levels', () => {
    const emails: ProcessedEmail[] = [
      createMockEmail({ priority: 'critical' }),
      createMockEmail({ priority: 'low' }),
    ]

    const flat = getFlatEmailList(emails)

    expect(flat).toHaveLength(2)
    expect(flat[0].priority).toBe('critical')
    expect(flat[1].priority).toBe('low')
  })
})
