"use client";

import { useState, useEffect } from "react";
import type { Poll, PollFilters, CreatePollData } from "@/types";

// Sample data - replace with actual API calls
const samplePolls: Poll[] = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Help us understand the community's preferences for programming languages in 2024.",
    options: [
      { id: "1a", text: "JavaScript", votes: 45 },
      { id: "1b", text: "Python", votes: 38 },
      { id: "1c", text: "TypeScript", votes: 32 },
      { id: "1d", text: "Go", votes: 15 },
      { id: "1e", text: "Rust", votes: 12 },
    ],
    createdBy: "user1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    expiresAt: new Date("2024-02-15"),
    isActive: true,
    totalVotes: 142,
    allowMultipleVotes: false,
    isAnonymous: false,
  },
  {
    id: "2",
    title: "Best time for team meetings?",
    description: "Let's find a time that works for everyone on the team.",
    options: [
      { id: "2a", text: "9:00 AM - 10:00 AM", votes: 23 },
      { id: "2b", text: "2:00 PM - 3:00 PM", votes: 31 },
      { id: "2c", text: "3:00 PM - 4:00 PM", votes: 18 },
      { id: "2d", text: "4:00 PM - 5:00 PM", votes: 8 },
    ],
    createdBy: "user2",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    expiresAt: new Date("2024-01-25"),
    isActive: true,
    totalVotes: 80,
    allowMultipleVotes: true,
    isAnonymous: true,
  },
];

export function usePolls(filters?: PollFilters) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));

        let filteredPolls = [...samplePolls];

        // Apply filters
        if (filters?.status) {
          if (filters.status === 'active') {
            filteredPolls = filteredPolls.filter(poll =>
              poll.isActive && (!poll.expiresAt || new Date(poll.expiresAt) > new Date())
            );
          } else if (filters.status === 'expired') {
            filteredPolls = filteredPolls.filter(poll =>
              poll.expiresAt && new Date(poll.expiresAt) <= new Date()
            );
          }
        }

        if (filters?.createdBy) {
          filteredPolls = filteredPolls.filter(poll => poll.createdBy === filters.createdBy);
        }

        // Apply sorting
        if (filters?.sortBy) {
          filteredPolls.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (filters.sortBy) {
              case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
              case 'totalVotes':
                aValue = a.totalVotes;
                bValue = b.totalVotes;
                break;
              case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
              default:
                return 0;
            }

            if (filters.sortOrder === 'desc') {
              return bValue > aValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
          });
        }

        setPolls(filteredPolls);
      } catch (err) {
        setError('Failed to fetch polls');
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [filters]);

  const refetch = () => {
    // Trigger a refetch by updating the dependency
  };

  return { polls, loading, error, refetch };
}

export function usePoll(id: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 300));

        const foundPoll = samplePolls.find(p => p.id === id);
        if (!foundPoll) {
          throw new Error('Poll not found');
        }

        setPoll(foundPoll);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch poll');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPoll();
    }
  }, [id]);

  const vote = async (optionIds: string[]) => {
    if (!poll) throw new Error('No poll loaded');

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state optimistically
      const updatedOptions = poll.options.map(option => ({
        ...option,
        votes: optionIds.includes(option.id) ? option.votes + 1 : option.votes,
      }));

      const updatedPoll: Poll = {
        ...poll,
        options: updatedOptions,
        totalVotes: poll.totalVotes + optionIds.length,
      };

      setPoll(updatedPoll);

      console.log('Vote submitted:', optionIds);
    } catch (err) {
      throw new Error('Failed to submit vote');
    }
  };

  return { poll, loading, error, vote };
}

export function useCreatePoll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPoll = async (data: CreatePollData): Promise<Poll> => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock poll object
      const newPoll: Poll = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        options: data.options.map((text, index) => ({
          id: `${Date.now()}_${index}`,
          text,
          votes: 0,
        })),
        createdBy: 'current-user', // TODO: Get from auth context
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: data.expiresAt,
        isActive: true,
        totalVotes: 0,
        allowMultipleVotes: data.allowMultipleVotes || false,
        isAnonymous: data.isAnonymous || false,
      };

      console.log('Poll created:', newPoll);
      return newPoll;
    } catch (err) {
      const errorMessage = 'Failed to create poll';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createPoll, loading, error };
}

export function useUserPolls(userId?: string) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPolls = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Filter polls by current user (or provided userId)
        const targetUserId = userId || 'user1'; // TODO: Get from auth context
        const userPolls = samplePolls.filter(poll => poll.createdBy === targetUserId);

        setPolls(userPolls);
      } catch (err) {
        setError('Failed to fetch user polls');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPolls();
  }, [userId]);

  const deletePoll = async (pollId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
      console.log('Poll deleted:', pollId);
    } catch (err) {
      throw new Error('Failed to delete poll');
    }
  };

  const updatePoll = async (pollId: string, updates: Partial<Poll>) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setPolls(prevPolls =>
        prevPolls.map(poll =>
          poll.id === pollId
            ? { ...poll, ...updates, updatedAt: new Date() }
            : poll
        )
      );
      console.log('Poll updated:', pollId, updates);
    } catch (err) {
      throw new Error('Failed to update poll');
    }
  };

  return { polls, loading, error, deletePoll, updatePoll };
}
