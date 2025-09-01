"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Poll, PollFilters, CreatePollData } from "@/types";

interface SupabasePoll {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  status: "draft" | "active" | "expired" | "closed";
  vote_type: "single" | "multiple";
  is_anonymous: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  poll_options: SupabasePollOption[];
}

interface SupabasePollOption {
  id: string;
  option_text: string;
  votes_count: number;
  option_order: number;
}

function transformSupabasePoll(supabasePoll: SupabasePoll): Poll {
  const totalVotes = supabasePoll.poll_options.reduce(
    (sum, option) => sum + option.votes_count,
    0,
  );

  return {
    id: supabasePoll.id,
    title: supabasePoll.title,
    description: supabasePoll.description || undefined,
    options: supabasePoll.poll_options
      .sort((a, b) => a.option_order - b.option_order)
      .map((option) => ({
        id: option.id,
        text: option.option_text,
        votes: option.votes_count,
      })),
    createdBy: supabasePoll.created_by,
    createdAt: new Date(supabasePoll.created_at),
    updatedAt: new Date(supabasePoll.updated_at),
    expiresAt: supabasePoll.expires_at
      ? new Date(supabasePoll.expires_at)
      : undefined,
    isActive: supabasePoll.status === "active",
    totalVotes,
    allowMultipleVotes: supabasePoll.vote_type === "multiple",
    isAnonymous: supabasePoll.is_anonymous,
  };
}

export function usePolls(filters?: PollFilters) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();

        let query = supabase.from("polls").select(`
            id,
            title,
            description,
            created_by,
            status,
            vote_type,
            is_anonymous,
            expires_at,
            created_at,
            updated_at,
            poll_options (
              id,
              option_text,
              votes_count,
              option_order
            )
          `);

        // Apply status filter
        if (filters?.status && filters.status !== "all") {
          if (filters.status === "active") {
            query = query.eq("status", "active");
          } else if (filters.status === "expired") {
            query = query.or(
              "status.eq.expired,expires_at.lt." + new Date().toISOString(),
            );
          }
        }

        // Apply created by filter
        if (filters?.createdBy) {
          query = query.eq("created_by", filters.createdBy);
        }

        // Apply sorting
        if (filters?.sortBy) {
          const sortOrder = filters.sortOrder || "desc";
          switch (filters.sortBy) {
            case "createdAt":
              query = query.order("created_at", {
                ascending: sortOrder === "asc",
              });
              break;
            case "title":
              query = query.order("title", { ascending: sortOrder === "asc" });
              break;
            default:
              query = query.order("created_at", { ascending: false });
          }
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw supabaseError;
        }

        const transformedPolls = (data as SupabasePoll[]).map(
          transformSupabasePoll,
        );
        setPolls(transformedPolls);
      } catch (err: any) {
        console.error("Error fetching polls:", err);
        setError(err.message || "Failed to fetch polls");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [filters]);

  const refetch = () => {
    // Trigger a refetch by updating the filters dependency
    setLoading(true);
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

        const supabase = createClient();

        const { data, error: supabaseError } = await supabase
          .from("polls")
          .select(
            `
            id,
            title,
            description,
            created_by,
            status,
            vote_type,
            is_anonymous,
            expires_at,
            created_at,
            updated_at,
            poll_options (
              id,
              option_text,
              votes_count,
              option_order
            )
          `,
          )
          .eq("id", id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        if (!data) {
          throw new Error("Poll not found");
        }

        const transformedPoll = transformSupabasePoll(data as SupabasePoll);
        setPoll(transformedPoll);
      } catch (err: any) {
        console.error("Error fetching poll:", err);
        setError(err.message || "Failed to fetch poll");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPoll();
    }
  }, [id]);

  const vote = async (optionIds: string[]) => {
    if (!poll) throw new Error("No poll loaded");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Authentication required to vote");
      }

      // Insert votes for each selected option
      const votesToInsert = optionIds.map((optionId) => ({
        poll_id: poll.id,
        option_id: optionId,
        user_id: user.id,
      }));

      const { error: voteError } = await supabase
        .from("votes")
        .insert(votesToInsert);

      if (voteError) {
        throw voteError;
      }

      // Refetch the poll to get updated vote counts
      const { data, error: fetchError } = await supabase
        .from("polls")
        .select(
          `
          id,
          title,
          description,
          created_by,
          status,
          vote_type,
          is_anonymous,
          expires_at,
          created_at,
          updated_at,
          poll_options (
            id,
            option_text,
            votes_count,
            option_order
          )
        `,
        )
        .eq("id", poll.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const updatedPoll = transformSupabasePoll(data as SupabasePoll);
      setPoll(updatedPoll);
    } catch (err: any) {
      console.error("Error submitting vote:", err);
      throw new Error(err.message || "Failed to submit vote");
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
        createdBy: "current-user", // TODO: Get from auth context
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: data.expiresAt,
        isActive: true,
        totalVotes: 0,
        allowMultipleVotes: data.allowMultipleVotes || false,
        isAnonymous: data.isAnonymous || false,
      };

      console.log("Poll created:", newPoll);
      return newPoll;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create poll";
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

        const supabase = createClient();
        let targetUserId = userId;

        // If no userId provided, get current user
        if (!targetUserId) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            throw new Error("Authentication required");
          }
          targetUserId = user.id;
        }

        const { data, error: supabaseError } = await supabase
          .from("polls")
          .select(
            `
            id,
            title,
            description,
            created_by,
            status,
            vote_type,
            is_anonymous,
            expires_at,
            created_at,
            updated_at,
            poll_options (
              id,
              option_text,
              votes_count,
              option_order
            )
          `,
          )
          .eq("created_by", targetUserId)
          .order("created_at", { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        const transformedPolls = (data as SupabasePoll[]).map(
          transformSupabasePoll,
        );
        setPolls(transformedPolls);
      } catch (err: any) {
        console.error("Error fetching user polls:", err);
        setError(err.message || "Failed to fetch user polls");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPolls();
  }, [userId]);

  const deletePoll = async (pollId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase.from("polls").delete().eq("id", pollId);

      if (error) {
        throw error;
      }

      setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
    } catch (err: any) {
      console.error("Error deleting poll:", err);
      throw new Error(err.message || "Failed to delete poll");
    }
  };

  const updatePoll = async (pollId: string, updates: Partial<Poll>) => {
    try {
      const supabase = createClient();

      // Transform updates to match database schema
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description !== undefined)
        dbUpdates.description = updates.description;
      if (updates.isActive !== undefined) {
        dbUpdates.status = updates.isActive ? "active" : "draft";
      }
      if (updates.allowMultipleVotes !== undefined) {
        dbUpdates.vote_type = updates.allowMultipleVotes
          ? "multiple"
          : "single";
      }
      if (updates.isAnonymous !== undefined)
        dbUpdates.is_anonymous = updates.isAnonymous;
      if (updates.expiresAt !== undefined) {
        dbUpdates.expires_at = updates.expiresAt
          ? updates.expiresAt.toISOString()
          : null;
      }

      const { error } = await supabase
        .from("polls")
        .update(dbUpdates)
        .eq("id", pollId);

      if (error) {
        throw error;
      }

      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === pollId
            ? { ...poll, ...updates, updatedAt: new Date() }
            : poll,
        ),
      );
    } catch (err: any) {
      console.error("Error updating poll:", err);
      throw new Error(err.message || "Failed to update poll");
    }
  };

  return { polls, loading, error, deletePoll, updatePoll };
}
