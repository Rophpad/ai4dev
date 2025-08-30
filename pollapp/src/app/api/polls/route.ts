import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CreatePollData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const pollData: CreatePollData = await request.json();

    // Validate poll data
    const validation = validatePollData(pollData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }

    // Filter valid options
    const validOptions = pollData.options.filter(option => option.trim() !== "");

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

    if (pollError) {
      return NextResponse.json(
        { error: pollError.message },
        { status: 500 }
      );
    }

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
      return NextResponse.json(
        { error: optionsError.message },
        { status: 500 }
      );
    }

    // Return created poll data
    return NextResponse.json({
      success: true,
      data: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        status: poll.status,
        voteType: poll.vote_type,
        isAnonymous: poll.is_anonymous,
        expiresAt: poll.expires_at ? new Date(poll.expires_at) : null,
        createdAt: new Date(poll.created_at),
        updatedAt: new Date(poll.updated_at),
      },
    });
  } catch (error) {
    console.error("Poll creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const status = searchParams.get("status") || "active";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("polls")
      .select(`
        id,
        title,
        description,
        status,
        vote_type,
        is_anonymous,
        expires_at,
        created_at,
        updated_at,
        poll_options (
          id,
          option_text,
          option_order,
          votes_count
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: polls, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform data to match frontend expectations
    const transformedPolls = polls.map(poll => ({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      options: poll.poll_options.map(option => ({
        id: option.id,
        text: option.option_text,
        votes: option.votes_count,
      })),
      createdBy: poll.created_by,
      createdAt: new Date(poll.created_at),
      updatedAt: new Date(poll.updated_at),
      expiresAt: poll.expires_at ? new Date(poll.expires_at) : null,
      isActive: poll.status === "active",
      totalVotes: poll.poll_options.reduce((sum, option) => sum + option.votes_count, 0),
      allowMultipleVotes: poll.vote_type === "multiple",
      isAnonymous: poll.is_anonymous,
    }));

    return NextResponse.json({
      success: true,
      data: transformedPolls,
      pagination: {
        limit,
        offset,
        hasMore: polls.length === limit,
      },
    });
  } catch (error) {
    console.error("Polls fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Validation helper function
function validatePollData(pollData: CreatePollData) {
  const errors: string[] = [];

  if (!pollData.title?.trim()) {
    errors.push("Poll title is required");
  }

  if (pollData.title && pollData.title.length > 200) {
    errors.push("Poll title must be less than 200 characters");
  }

  if (pollData.description && pollData.description.length > 1000) {
    errors.push("Poll description must be less than 1000 characters");
  }

  if (!pollData.options || !Array.isArray(pollData.options)) {
    errors.push("Poll options are required");
  } else {
    const validOptions = pollData.options.filter(option => option?.trim() !== "");

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
  }

  if (pollData.expiresAt && new Date(pollData.expiresAt) <= new Date()) {
    errors.push("Expiry date must be in the future");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
