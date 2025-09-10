import { useState, useEffect, useCallback } from "react";
import { generateBrowserFingerprint } from "@/lib/anonymous-voting";

interface DemoVoteData {
  poll_id: string;
  total_demo_votes: number;
  option_demo_votes: Record<string, number>;
}

interface DemoVoteStatus {
  hasVoted: boolean;
  userVotes: string[];
}

export function useDemoVotes(pollId: string) {
  const [demoVotes, setDemoVotes] = useState<DemoVoteData>({
    poll_id: pollId,
    total_demo_votes: 0,
    option_demo_votes: {},
  });
  const [userDemoStatus, setUserDemoStatus] = useState<DemoVoteStatus>({
    hasVoted: false,
    userVotes: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = generateBrowserFingerprint();

  // Load demo votes from database
  const loadDemoVotes = useCallback(async () => {
    if (!pollId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/polls/${pollId}/demo-votes`);
      if (!response.ok) {
        throw new Error('Failed to fetch demo votes');
      }

      const data = await response.json();
      setDemoVotes(data);

      // Check user's demo vote status from localStorage
      const userVoteKey = `user_demo_vote_${pollId}`;
      const userVote = localStorage.getItem(userVoteKey);
      
      if (userVote) {
        try {
          const userData = JSON.parse(userVote);
          setUserDemoStatus({
            hasVoted: userData.hasVoted || false,
            userVotes: userData.userVotes || [],
          });
        } catch (parseError) {
          console.warn('Error parsing user demo vote data:', parseError);
          localStorage.removeItem(userVoteKey);
        }
      }

    } catch (err) {
      console.error('Error loading demo votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load demo votes');
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  // Submit demo vote
  const submitDemoVote = useCallback(async (optionIds: string[]) => {
    if (!pollId || optionIds.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/polls/${pollId}/demo-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionIds,
          sessionId,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit demo vote');
      }

      const result = await response.json();
      
      // Update state
      setDemoVotes(result.demoVotes);
      setUserDemoStatus({
        hasVoted: true,
        userVotes: optionIds,
      });

      // Store in localStorage for immediate feedback
      const userVoteKey = `user_demo_vote_${pollId}`;
      localStorage.setItem(userVoteKey, JSON.stringify({
        hasVoted: true,
        userVotes: optionIds,
        sessionId,
        timestamp: Date.now(),
      }));

      return result;

    } catch (err) {
      console.error('Error submitting demo vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit demo vote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pollId, sessionId]);

  // Clear demo vote
  const clearDemoVote = useCallback(async () => {
    if (!pollId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/polls/${pollId}/demo-votes?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear demo vote');
      }

      const result = await response.json();
      
      // Update state
      setDemoVotes(result.demoVotes);
      setUserDemoStatus({
        hasVoted: false,
        userVotes: [],
      });

      // Clear from localStorage
      const userVoteKey = `user_demo_vote_${pollId}`;
      localStorage.removeItem(userVoteKey);

      return result;

    } catch (err) {
      console.error('Error clearing demo vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear demo vote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pollId, sessionId]);

  // Load demo votes on mount
  useEffect(() => {
    loadDemoVotes();
  }, [loadDemoVotes]);

  return {
    demoVotes,
    userDemoStatus,
    loading,
    error,
    submitDemoVote,
    clearDemoVote,
    refreshDemoVotes: loadDemoVotes,
  };
}
