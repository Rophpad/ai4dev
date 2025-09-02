import { renderHook, act } from '@testing-library/react'
import { useCreatePoll } from '@/hooks/use-create-poll'
import { createClient } from '@/lib/supabase/client'
import type { CreatePollData } from '@/types'

// Mock the useAuth hook
const mockUser = { id: 'user-123', email: 'test@example.com' }
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client')
const mockSupabase = createClient as jest.MockedFunction<typeof createClient>

describe('useCreatePoll - Integration Test', () => {
  let mockSupabaseInstance: any

  beforeEach(() => {
    mockSupabaseInstance = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn(),
    }
    mockSupabase.mockReturnValue(mockSupabaseInstance)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete poll creation flow', () => {
    test('should handle full poll creation workflow with validation, database operations, and error handling', async () => {
      // Arrange
      const pollData: CreatePollData = {
        title: '  What is your favorite programming language?  ', // With whitespace
        description: '  Please select your preferred programming language  ',
        options: [
          'JavaScript',
          '  Python  ', // With whitespace
          '', // Empty option to be filtered
          'TypeScript',
          'Go',
          '   ', // Whitespace-only option to be filtered
        ],
        allowMultipleVotes: true,
        isAnonymous: false,
        expiresAt: new Date('2025-12-31T23:59:59Z'),
      }

      const mockPollResponse = {
        id: 'poll-integration-test',
        title: 'What is your favorite programming language?',
        description: 'Please select your preferred programming language',
        created_by: 'user-123',
        status: 'active',
        vote_type: 'multiple',
        is_anonymous: false,
        expires_at: '2025-12-31T23:59:59Z',
        created_at: '2025-09-02T10:00:00Z',
        updated_at: '2025-09-02T10:00:00Z',
      }

      // Mock successful poll creation
      mockSupabaseInstance.single.mockResolvedValueOnce({
        data: mockPollResponse,
        error: null,
      })

      // Mock successful options creation
      mockSupabaseInstance.insert.mockResolvedValueOnce({
        error: null,
      })

      // Act
      const { result } = renderHook(() => useCreatePoll())

      // Check initial state
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)

      let createdPoll: any
      await act(async () => {
        createdPoll = await result.current.createPoll(pollData)
      })

      // Assert
      // 1. Verify the returned poll object structure and data transformation
      expect(createdPoll).toEqual({
        id: 'poll-integration-test',
        title: 'What is your favorite programming language?',
        description: 'Please select your preferred programming language',
        status: 'active',
        voteType: 'multiple',
        isAnonymous: false,
        expiresAt: new Date('2025-12-31T23:59:59Z'),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      // 2. Verify database operations were called correctly
      expect(mockSupabaseInstance.from).toHaveBeenCalledTimes(2)
      expect(mockSupabaseInstance.from).toHaveBeenNthCalledWith(1, 'polls')
      expect(mockSupabaseInstance.from).toHaveBeenNthCalledWith(2, 'poll_options')

      // 3. Verify poll data was properly cleaned and formatted
      expect(mockSupabaseInstance.insert).toHaveBeenNthCalledWith(1, [
        {
          title: 'What is your favorite programming language?', // Trimmed
          description: 'Please select your preferred programming language', // Trimmed
          created_by: 'user-123',
          status: 'active',
          vote_type: 'multiple',
          is_anonymous: false,
          expires_at: '2025-12-31T23:59:59.000Z',
        },
      ])

      // 4. Verify options were filtered, trimmed, and properly structured
      expect(mockSupabaseInstance.insert).toHaveBeenNthCalledWith(2, [
        {
          poll_id: 'poll-integration-test',
          option_text: 'JavaScript',
          option_order: 0,
          votes_count: 0,
        },
        {
          poll_id: 'poll-integration-test',
          option_text: 'Python', // Trimmed
          option_order: 1,
          votes_count: 0,
        },
        {
          poll_id: 'poll-integration-test',
          option_text: 'TypeScript',
          option_order: 2,
          votes_count: 0,
        },
        {
          poll_id: 'poll-integration-test',
          option_text: 'Go',
          option_order: 3,
          votes_count: 0,
        },
      ])

      // 5. Verify hook state after successful operation
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    test('should handle database errors and perform cleanup when options creation fails', async () => {
      // Arrange
      const pollData: CreatePollData = {
        title: 'Test Poll',
        options: ['Option 1', 'Option 2'],
      }

      const mockPollResponse = {
        id: 'poll-to-be-deleted',
        title: 'Test Poll',
        description: null,
        created_by: 'user-123',
        status: 'active',
        vote_type: 'single',
        is_anonymous: false,
        expires_at: null,
        created_at: '2025-09-02T10:00:00Z',
        updated_at: '2025-09-02T10:00:00Z',
      }

      // Mock successful poll creation
      mockSupabaseInstance.single.mockResolvedValueOnce({
        data: mockPollResponse,
        error: null,
      })

      // Mock failed options creation
      mockSupabaseInstance.insert.mockResolvedValueOnce({
        error: { message: 'Options insertion failed' },
      })

      // Mock cleanup deletion
      mockSupabaseInstance.eq.mockResolvedValueOnce({})

      // Act & Assert
      const { result } = renderHook(() => useCreatePoll())

      await act(async () => {
        await expect(result.current.createPoll(pollData)).rejects.toThrow(
          'Options insertion failed'
        )
      })

      // Verify cleanup was attempted
      expect(mockSupabaseInstance.from).toHaveBeenCalledWith('polls')
      expect(mockSupabaseInstance.delete).toHaveBeenCalled()
      expect(mockSupabaseInstance.eq).toHaveBeenCalledWith('id', 'poll-to-be-deleted')

      // Verify error state
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Options insertion failed')
    })

    test('should handle poll creation database errors', async () => {
      // Arrange
      const pollData: CreatePollData = {
        title: 'Test Poll',
        options: ['Option 1', 'Option 2'],
      }

      // Mock failed poll creation
      mockSupabaseInstance.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      })

      // Act & Assert
      const { result } = renderHook(() => useCreatePoll())

      await act(async () => {
        await expect(result.current.createPoll(pollData)).rejects.toThrow(
          'Database connection failed'
        )
      })

      // Verify no options insertion was attempted
      expect(mockSupabaseInstance.from).toHaveBeenCalledTimes(1)
      expect(mockSupabaseInstance.from).toHaveBeenCalledWith('polls')

      // Verify error state
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Database connection failed')
    })

    test('should validate data before making database calls', async () => {
      // Arrange
      const invalidPollData: CreatePollData = {
        title: '', // Invalid: empty title
        options: ['Only one option'], // Invalid: less than 2 options
      }

      // Act & Assert
      const { result } = renderHook(() => useCreatePoll())

      await act(async () => {
        await expect(result.current.createPoll(invalidPollData)).rejects.toThrow(
          'Poll title is required'
        )
      })

      // Verify no database calls were made
      expect(mockSupabaseInstance.from).not.toHaveBeenCalled()
      expect(mockSupabaseInstance.insert).not.toHaveBeenCalled()

      // Verify error state
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Poll title is required')
    })
  })
})
