import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDraftGeneration } from '../use-draft-generation'

// Mock useCompletion from AI SDK
const mockComplete = vi.fn()
const mockStop = vi.fn()

vi.mock('@ai-sdk/react', () => ({
  useCompletion: vi.fn(({ onFinish, onError }) => {
    // Store callbacks for testing
    ;(global as Record<string, unknown>).__completionCallbacks = { onFinish, onError }

    return {
      completion: (global as Record<string, unknown>).__mockCompletion as string || '',
      isLoading: (global as Record<string, unknown>).__mockIsLoading as boolean || false,
      complete: mockComplete,
      stop: mockStop,
    }
  }),
}))

// Mock saveDraft action
vi.mock('@/lib/actions', () => ({
  saveDraft: vi.fn().mockResolvedValue(undefined),
}))

import { saveDraft } from '@/lib/actions'

const defaultParams = {
  emailId: 'email-123',
  senderName: 'John Doe',
  senderEmail: 'john@example.com',
  subject: 'Test Subject',
  snippet: 'This is a test email snippet',
  category: 'personal',
  priority: 'medium',
  userName: 'Current User',
}

describe('useDraftGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global as Record<string, unknown>).__mockCompletion = ''
    ;(global as Record<string, unknown>).__mockIsLoading = false
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      expect(result.current.completion).toBe('')
      expect(result.current.editedContent).toBe('')
      expect(result.current.isGenerating).toBe(false)
      expect(result.current.isSaving).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.currentTone).toBe('professional')
    })
  })

  describe('generate', () => {
    it('should call complete with default tone', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.generate()
      })

      expect(mockComplete).toHaveBeenCalledWith('', {
        body: { tone: 'professional' },
      })
    })

    it('should call complete with specified tone', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.generate('friendly')
      })

      expect(mockComplete).toHaveBeenCalledWith('', {
        body: { tone: 'friendly' },
      })
    })

    it('should clear error when generating', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      // Simulate an error state
      const callbacks = (global as Record<string, unknown>).__completionCallbacks as {
        onError?: (err: Error) => void
      }
      act(() => {
        callbacks?.onError?.(new Error('Test error'))
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.generate()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('regenerate', () => {
    it('should clear edited content and call generate', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.setEditedContent('Some content')
      })

      act(() => {
        result.current.regenerate()
      })

      expect(result.current.editedContent).toBe('')
      expect(mockComplete).toHaveBeenCalled()
    })
  })

  describe('stopGeneration', () => {
    it('should call stop function', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.stopGeneration()
      })

      expect(mockStop).toHaveBeenCalled()
    })
  })

  describe('setTone', () => {
    it('should update current tone', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.setTone('concise')
      })

      expect(result.current.currentTone).toBe('concise')
    })
  })

  describe('setEditedContent', () => {
    it('should update edited content', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.setEditedContent('New content')
      })

      expect(result.current.editedContent).toBe('New content')
    })
  })

  describe('clearDraft', () => {
    it('should clear edited content and error', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.setEditedContent('Some content')
      })

      act(() => {
        result.current.clearDraft()
      })

      expect(result.current.editedContent).toBe('')
      expect(result.current.error).toBeNull()
    })
  })

  describe('saveDraftContent', () => {
    it('should save draft with edited content', async () => {
      const onSaveSuccess = vi.fn()
      const { result } = renderHook(() =>
        useDraftGeneration({ ...defaultParams, onSaveSuccess })
      )

      act(() => {
        result.current.setEditedContent('Draft content to save')
      })

      await act(async () => {
        await result.current.saveDraftContent()
      })

      expect(saveDraft).toHaveBeenCalledWith('email-123', 'Draft content to save')
      expect(onSaveSuccess).toHaveBeenCalled()
    })

    it('should set error for empty content', async () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      await act(async () => {
        await result.current.saveDraftContent()
      })

      expect(result.current.error).toBe('Cannot save empty draft')
      expect(saveDraft).not.toHaveBeenCalled()
    })

    it('should set error for whitespace-only content', async () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.setEditedContent('   ')
      })

      await act(async () => {
        await result.current.saveDraftContent()
      })

      expect(result.current.error).toBe('Cannot save empty draft')
    })

    it('should handle save errors', async () => {
      vi.mocked(saveDraft).mockRejectedValueOnce(new Error('Save failed'))

      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.setEditedContent('Draft content')
      })

      await act(async () => {
        await result.current.saveDraftContent()
      })

      expect(result.current.error).toBe('Save failed')
    })

    it('should set isSaving during save operation', async () => {
      let resolveSave: (value: { success: boolean; id: string }) => void
      vi.mocked(saveDraft).mockImplementationOnce(
        () => new Promise((resolve) => { resolveSave = resolve })
      )

      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      act(() => {
        result.current.setEditedContent('Draft content')
      })

      // Start save but don't await yet
      let savePromise: Promise<void>
      act(() => {
        savePromise = result.current.saveDraftContent()
      })

      // isSaving should be true during save
      expect(result.current.isSaving).toBe(true)

      // Complete the save
      await act(async () => {
        resolveSave!({ success: true, id: 'test-id' })
        await savePromise
      })

      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('onFinish callback', () => {
    it('should update editedContent when generation completes', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      const callbacks = (global as Record<string, unknown>).__completionCallbacks as {
        onFinish?: (prompt: string, completion: string) => void
      }

      act(() => {
        callbacks?.onFinish?.('', 'Generated response')
      })

      expect(result.current.editedContent).toBe('Generated response')
    })
  })

  describe('onError callback', () => {
    it('should set error when generation fails', () => {
      const { result } = renderHook(() => useDraftGeneration(defaultParams))

      const callbacks = (global as Record<string, unknown>).__completionCallbacks as {
        onError?: (err: Error) => void
      }

      act(() => {
        callbacks?.onError?.(new Error('Generation failed'))
      })

      expect(result.current.error).toBe('Generation failed')
    })
  })
})
