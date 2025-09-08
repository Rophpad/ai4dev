"use client";

import { useState, useEffect } from "react";
import type { PollVoters } from "@/types";

export function usePollVoters(pollId: string, isAnonymous: boolean = false, canView: boolean = true) {
  const [voters, setVoters] = useState<PollVoters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoters = async () => {
      if (isAnonymous || !pollId || !canView) {
        setVoters(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/polls/${pollId}/voters`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch voters');
        }

        const votersData = await response.json();
        setVoters(votersData);
      } catch (err: any) {
        console.error("Error fetching voters:", err);
        setError(err.message || "Failed to fetch voters");
      } finally {
        setLoading(false);
      }
    };

    fetchVoters();
  }, [pollId, isAnonymous, canView]);

  const refetch = () => {
    if (!isAnonymous && pollId && canView) {
      setLoading(true);
      // Trigger a refetch by calling the effect again
      const fetchVoters = async () => {
        try {
          setError(null);
          const response = await fetch(`/api/polls/${pollId}/voters`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch voters');
          }

          const votersData = await response.json();
          setVoters(votersData);
        } catch (err: any) {
          console.error("Error fetching voters:", err);
          setError(err.message || "Failed to fetch voters");
        } finally {
          setLoading(false);
        }
      };
      
      fetchVoters();
    }
  };

  return { voters, loading, error, refetch };
}
