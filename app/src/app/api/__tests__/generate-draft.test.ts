import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../generate-draft/route'

// Mock streamText from AI SDK
const mockToTextStreamResponse = vi.fn(() => new Response('Generated draft'))

vi.mock('ai', () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: mockToTextStreamResponse,
  })),
}))

// Mock the AI model and prompts
vi.mock('@/lib/ai/anthropic', () => ({
  DRAFT_MODEL: { id: 'mock-model' },
}))

vi.mock('@/lib/ai/prompts', () => ({
  SYSTEM_PROMPT: 'Mock system prompt',
  buildDraftPrompt: vi.fn(() => 'Mock built prompt'),
}))

describe('POST /api/generate-draft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('should return 400 for missing required fields', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Validation failed')
      expect(body.details).toBeDefined()
    })

    it('should return 400 for invalid email format', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: 'invalid-email',
          subject: 'Test Subject',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Validation failed')
      expect(body.details.some((d: { field: string }) => d.field === 'senderEmail')).toBe(true)
    })

    it('should return 400 for empty subject', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: 'test@example.com',
          subject: '',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Validation failed')
    })

    it('should return 400 for invalid category', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: 'test@example.com',
          subject: 'Test Subject',
          category: 'invalid-category',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Validation failed')
    })

    it('should return 400 for invalid priority', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: 'test@example.com',
          subject: 'Test Subject',
          priority: 'invalid-priority',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Validation failed')
    })

    it('should return 400 for invalid tone', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: 'test@example.com',
          subject: 'Test Subject',
          tone: 'invalid-tone',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Validation failed')
    })

    it('should return 400 for invalid JSON', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('Invalid JSON in request body')
    })
  })

  describe('successful generation', () => {
    it('should generate draft with valid minimal input', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: 'test@example.com',
          subject: 'Test Subject',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockToTextStreamResponse).toHaveBeenCalled()
    })

    it('should generate draft with all optional fields', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: 'John Doe',
          senderEmail: 'john@example.com',
          subject: 'Test Subject',
          snippet: 'Email snippet content',
          category: 'personal',
          priority: 'high',
          userName: 'Current User',
          tone: 'friendly',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept all valid categories', async () => {
      const categories = ['rav', 'billing', 'personal', 'action_required', 'other']

      for (const category of categories) {
        const request = new Request('http://localhost/api/generate-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderEmail: 'test@example.com',
            subject: 'Test Subject',
            category,
          }),
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
      }
    })

    it('should accept all valid priorities', async () => {
      const priorities = ['critical', 'high', 'medium', 'low']

      for (const priority of priorities) {
        const request = new Request('http://localhost/api/generate-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderEmail: 'test@example.com',
            subject: 'Test Subject',
            priority,
          }),
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
      }
    })

    it('should accept all valid tones', async () => {
      const tones = ['professional', 'friendly', 'concise']

      for (const tone of tones) {
        const request = new Request('http://localhost/api/generate-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderEmail: 'test@example.com',
            subject: 'Test Subject',
            tone,
          }),
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
      }
    })
  })

  describe('field length validation', () => {
    it('should accept senderName up to 200 characters', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: 'a'.repeat(200),
          senderEmail: 'test@example.com',
          subject: 'Test Subject',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should reject senderName over 200 characters', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: 'a'.repeat(201),
          senderEmail: 'test@example.com',
          subject: 'Test Subject',
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should accept subject up to 500 characters', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: 'test@example.com',
          subject: 'a'.repeat(500),
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should reject subject over 500 characters', async () => {
      const request = new Request('http://localhost/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: 'test@example.com',
          subject: 'a'.repeat(501),
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})
