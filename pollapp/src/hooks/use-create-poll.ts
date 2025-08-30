"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { CreatePollData } from "@/types";

export function useCreatePoll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const createPoll = async (pollData: CreatePollData) => {
    if (!user) {
      throw new Error("User must be authenticated to create polls");
    }

    try {
      setLoading(true);
      setError(null);

      // Validate poll data
      if (!pollData.title.trim()) {
        throw new Error("Poll title is required");
      }

      const validOptions = pollData.options.filter(option => option.trim() !== "");
      if (validOptions.length < 2) {
        throw new Error("At least 2 poll options are required");
      }

      if (validOptions.length > 10) {
        throw new Error("Maximum 10 poll options allowed");
      }

      if (pollData.expiresAt && new Date(pollData.expiresAt) <= new Date()) {
        throw new Error("Expiry date must be in the future");
      }

      // Create poll in database
      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert([
          {
            title: pollData.title.trim(),
            description: pollData.description?.trim() || null,
            created_by: user.id,
            status: "active",
            vote_type: pollData.allowMultipleVotes ? "multiple" : "single",
            is_anonymous: pollData.isAnonymous || false,
            expires_at: pollData.expiresAt ? pollData.expiresAt.toISOString() : null,
          },
        ])
        .select()
        .single();

      if (pollError) throw new Error(pollError.message);

      // Create poll options
      const optionsData = validOptions.map((option, index) => ({
        poll_id: poll.id,
        option_text: option.trim(),
        option_order: index,
        votes_count: 0,
      }));

      const { error: optionsError } = await supabase
        .from("poll_options")
        .insert(optionsData);

      if (optionsError) {
        // Cleanup: delete the poll if options creation fails
        await supabase.from("polls").delete().eq("id", poll.id);
        throw new Error(optionsError.message);
      }

      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        voteType: poll.vote_type,
        isAnonymous: poll.is_anonymous,
        expiresAt: poll.expires_at ? new Date(poll.expires_at) : null,
        createdAt: new Date(poll.created_at),
        updatedAt: new Date(poll.updated_at),
      };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create poll";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validatePollData = (pollData: CreatePollData) => {
    const errors: string[] = [];

    if (!pollData.title.trim()) {
      errors.push("Poll title is required");
    }

    if (pollData.title.length > 200) {
      errors.push("Poll title must be less than 200 characters");
    }

    if (pollData.description && pollData.description.length > 1000) {
      errors.push("Poll description must be less than 1000 characters");
    }

    const validOptions = pollData.options.filter(option => option.trim() !== "");
    if (validOptions.length < 2) {
      errors.push("At least 2 poll options are required");
    }

    if (validOptions.length > 10) {
      errors.push("Maximum 10 poll options allowed");
    }

    validOptions.forEach((option, index) => {
      if (option.length > 200) {
        errors.push(`Option ${index + 1} must be less than 200 characters`);
      }
    });

    if (pollData.expiresAt && new Date(pollData.expiresAt) <= new Date()) {
      errors.push("Expiry date must be in the future");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    createPoll,
    validatePollData,
    loading,
    error,
  };
}
