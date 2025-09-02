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
const mockSupabase = createClient as jest.MockedFunction<typeof createClient>;

describe('useCreatePoll - Unit Tests', () => {
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

  describe('createPoll function', () => {
    test('should successfully create a poll with valid data', async () => {
      // Arrange
      const validPollData: CreatePollData = {
        title: 'Test Poll',
        description: 'A test poll',
        options: ['Option 1', 'Option 2', 'Option 3'],
        allowMultipleVotes: false,
        isAnonymous: true,
      }

      const mockPollResponse = {
        id: 'poll-123',
        title: 'Test Poll',
        description: 'A test poll',
        created_by: 'user-123',
        status: 'active',
        vote_type: 'single',
        is_anonymous: true,
        expires_at: null,
        created_at: '2025-09-02T10:00:00Z',
        updated_at: '2025-09-02T10:00:00Z',
      }

      mockSupabaseInstance.single.mockResolvedValueOnce({
        data: mockPollResponse,
        error: null,
      })

      mockSupabaseInstance.insert.mockResolvedValueOnce({
        error: null,
      })

      // Act
      const { result } = renderHook(() => useCreatePoll())

      let createdPoll: any
      await act(async () => {
        createdPoll = await result.current.createPoll(validPollData)
      })

      // Assert
      expect(createdPoll).toEqual({
        id: 'poll-123',
        title: 'Test Poll',
        description: 'A test poll',
        status: 'active',
        voteType: 'single',
        isAnonymous: true,
        expiresAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      // Verify poll creation was called correctly
      expect(mockSupabaseInstance.from).toHaveBeenCalledWith('polls')
      expect(mockSupabaseInstance.insert).toHaveBeenCalledWith([
        {
          title: 'Test Poll',
          description: 'A test poll',
          created_by: 'user-123',
          status: 'active',
          vote_type: 'single',
          is_anonymous: true,
          expires_at: null,
        },
      ])

      // Verify options creation was called
      expect(mockSupabaseInstance.from).toHaveBeenCalledWith('poll_options')
      expect(mockSupabaseInstance.insert).toHaveBeenCalledWith([
        { poll_id: 'poll-123', option_text: 'Option 1', option_order: 0, votes_count: 0 },
        { poll_id: 'poll-123', option_text: 'Option 2', option_order: 1, votes_count: 0 },
        { poll_id: 'poll-123', option_text: 'Option 3', option_order: 2, votes_count: 0 },
      ])

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    test('should throw error when user is not authenticated', async () => {
      // Arrange
      const { useAuth } = require('@/hooks/use-auth')
      useAuth.mockReturnValueOnce({ user: null })

      const validPollData: CreatePollData = {
        title: 'Test Poll',
        options: ['Option 1', 'Option 2'],
      }

      // Act & Assert
      const { result } = renderHook(() => useCreatePoll())

      await act(async () => {
        await expect(result.current.createPoll(validPollData)).rejects.toThrow(
          'User must be authenticated to create polls'
        )
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('User must be authenticated to create polls')
    })
  })

  describe('validatePollData function', () => {
    test('should return valid for correct poll data', () => {
      // Arrange
      const validPollData: CreatePollData = {
        title: 'Valid Poll Title',
        description: 'Valid description',
        options: ['Option 1', 'Option 2', 'Option 3'],
        expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
        allowMultipleVotes: true,
        isAnonymous: false,
      }

      // Act
      const { result } = renderHook(() => useCreatePoll())
      const validation = result.current.validatePollData(validPollData)

      // Assert
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should return errors for invalid poll data', () => {
      // Arrange
      const invalidPollData: CreatePollData = {
        title: '', // Empty title
        description: 'A'.repeat(1001), // Too long description
        options: ['Option 1'], // Only one option
        expiresAt: new Date(Date.now() - 86400000), // Past date
      }

      // Act
      const { result } = renderHook(() => useCreatePoll())
      const validation = result.current.validatePollData(invalidPollData)

      // Assert
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Poll title is required')
      expect(validation.errors).toContain('Poll description must be less than 1000 characters')
      expect(validation.errors).toContain('At least 2 poll options are required')
      expect(validation.errors).toContain('Expiry date must be in the future')
    })

    test('should validate option character limits', () => {
      // Arrange
      const pollDataWithLongOptions: CreatePollData = {
        title: 'Valid Title',
        options: [
          'A'.repeat(201), // Too long option
          'Valid Option',
          'Another'.repeat(50), // Another too long option
        ],
      }

      // Act
      const { result } = renderHook(() => useCreatePoll())
      const validation = result.current.validatePollData(pollDataWithLongOptions)

      // Assert
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Option 1 must be less than 200 characters')
      expect(validation.errors).toContain('Option 3 must be less than 200 characters')
    })

    test('should filter out empty options and validate remaining count', () => {
      // Arrange
      const pollDataWithEmptyOptions: CreatePollData = {
        title: 'Valid Title',
        options: ['Valid Option 1', '', '   ', 'Valid Option 2', ''],
      }

      // Act
      const { result } = renderHook(() => useCreatePoll())
      const validation = result.current.validatePollData(pollDataWithEmptyOptions)

      // Assert
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should validate maximum number of options', () => {
      // Arrange
      const pollDataWithTooManyOptions: CreatePollData = {
        title: 'Valid Title',
        options: Array.from({ length: 11 }, (_, i) => `Option ${i + 1}`),
      }

      // Act
      const { result } = renderHook(() => useCreatePoll())
      const validation = result.current.validatePollData(pollDataWithTooManyOptions)

      // Assert
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Maximum 10 poll options allowed')
    })
  })
})
