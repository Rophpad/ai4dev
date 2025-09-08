import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import type { UpdatePollData } from "@/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pollId = resolvedParams.id;
    const updateData: UpdatePollData = await request.json();

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify user owns the poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("id, created_by, status")
      .eq("id", pollId)
      .single();

    if (pollError) {
      return Response.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.created_by !== user.id) {
      return Response.json({ error: "Unauthorized - you can only edit your own polls" }, { status: 403 });
    }

    // Prepare update data
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.title !== undefined) dbUpdates.title = updateData.title;
    if (updateData.description !== undefined) dbUpdates.description = updateData.description;
    if (updateData.isActive !== undefined) {
      dbUpdates.status = updateData.isActive ? "active" : "draft";
    }
    if (updateData.allowMultipleVotes !== undefined) {
      dbUpdates.vote_type = updateData.allowMultipleVotes ? "multiple" : "single";
    }
    if (updateData.isAnonymous !== undefined) {
      dbUpdates.is_anonymous = updateData.isAnonymous;
    }
    if (updateData.expiresAt !== undefined) {
      dbUpdates.expires_at = updateData.expiresAt ? updateData.expiresAt : null;
    }

    // Update poll
    const { data: updatedPoll, error: updateError } = await supabase
      .from("polls")
      .update(dbUpdates)
      .eq("id", pollId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating poll:", updateError);
      return Response.json({ error: "Failed to update poll" }, { status: 500 });
    }

    // Handle option updates if provided
    if (updateData.options) {
      // Check if poll has votes - if so, only allow adding new options
      const { data: votes } = await supabase
        .from("votes")
        .select("id")
        .eq("poll_id", pollId)
        .limit(1);

      const hasVotes = votes && votes.length > 0;

      if (hasVotes) {
        // Only process new options (those marked with isNew: true)
        const newOptions = updateData.options.filter(option => option.isNew);
        
        if (newOptions.length > 0) {
          // Get the highest option_order to append new options
          const { data: existingOptions } = await supabase
            .from("poll_options")
            .select("option_order")
            .eq("poll_id", pollId)
            .order("option_order", { ascending: false })
            .limit(1);

          const nextOrder = (existingOptions?.[0]?.option_order || 0) + 1;

          const optionsToInsert = newOptions.map((option, index) => ({
            poll_id: pollId,
            option_text: option.text,
            option_order: nextOrder + index,
            votes_count: 0,
          }));

          const { error: optionsError } = await supabase
            .from("poll_options")
            .insert(optionsToInsert);

          if (optionsError) {
            console.error("Error adding new options:", optionsError);
            return Response.json({ error: "Failed to add new options" }, { status: 500 });
          }
        }
      } else {
        // No votes yet - can update all options
        // Delete existing options and recreate
        await supabase.from("poll_options").delete().eq("poll_id", pollId);

        const optionsToInsert = updateData.options
          .filter(option => option.text.trim())
          .map((option, index) => ({
            poll_id: pollId,
            option_text: option.text,
            option_order: index + 1,
            votes_count: 0,
          }));

        if (optionsToInsert.length > 0) {
          const { error: optionsError } = await supabase
            .from("poll_options")
            .insert(optionsToInsert);

          if (optionsError) {
            console.error("Error updating options:", optionsError);
            return Response.json({ error: "Failed to update options" }, { status: 500 });
          }
        }
      }
    }

    return Response.json({
      success: true,
      message: "Poll updated successfully",
      poll: updatedPoll,
    });

  } catch (error) {
    console.error("Error in PUT /api/polls/[id]:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get individual poll
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pollId = resolvedParams.id;

    const supabase = await createClient();

    const { data: poll, error } = await supabase
      .from("polls")
      .select(`
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
      `)
      .eq("id", pollId)
      .single();

    if (error || !poll) {
      return Response.json({ error: "Poll not found" }, { status: 404 });
    }

    return Response.json({ poll });

  } catch (error) {
    console.error("Error in GET /api/polls/[id]:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
