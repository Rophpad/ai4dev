import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pollId = resolvedParams.id;

    const supabase = await createClient();

    // Get demo vote counts using the database function
    const { data, error } = await supabase
      .rpc('get_demo_vote_counts', { poll_uuid: pollId });

    if (error) {
      console.error("Error fetching demo votes:", error);
      return Response.json({ error: "Failed to fetch demo votes" }, { status: 500 });
    }

    return Response.json(data || { 
      poll_id: pollId, 
      total_demo_votes: 0, 
      option_demo_votes: {} 
    });

  } catch (error) {
    console.error("Error in GET /api/polls/[id]/demo-votes:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pollId = resolvedParams.id;
    const body = await request.json();
    
    const { optionIds, sessionId, userAgent } = body;

    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return Response.json({ error: "Option IDs are required" }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return Response.json({ error: "Session ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // First check if poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("id, status, vote_type, expires_at")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      return Response.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.status !== 'active') {
      return Response.json({ error: "Poll is not active" }, { status: 400 });
    }

    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return Response.json({ error: "Poll has expired" }, { status: 400 });
    }

    // For single vote polls, remove existing demo votes for this session
    if (poll.vote_type === 'single') {
      await supabase
        .from("demo_votes")
        .delete()
        .eq("poll_id", pollId)
        .eq("session_id", sessionId);
    }

    // Get IP address from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwarded?.split(',')[0] || realIp || null;

    // Insert new demo votes
    const demoVotesToInsert = optionIds.map((optionId: string) => ({
      poll_id: pollId,
      option_id: optionId,
      session_id: sessionId,
      user_agent: userAgent || null,
      ip_address: ipAddress,
    }));

    const { error: insertError } = await supabase
      .from("demo_votes")
      .insert(demoVotesToInsert);

    if (insertError) {
      console.error("Error inserting demo votes:", insertError);
      
      // Check if it's a duplicate key error (user already voted)
      if (insertError.code === '23505') {
        return Response.json({ 
          error: "You have already submitted a demo vote for this poll" 
        }, { status: 409 });
      }
      
      return Response.json({ error: "Failed to submit demo vote" }, { status: 500 });
    }

    // Return updated demo vote counts
    const { data: updatedCounts } = await supabase
      .rpc('get_demo_vote_counts', { poll_uuid: pollId });

    return Response.json({ 
      success: true, 
      demoVotes: updatedCounts || { 
        poll_id: pollId, 
        total_demo_votes: 0, 
        option_demo_votes: {} 
      }
    });

  } catch (error) {
    console.error("Error in POST /api/polls/[id]/demo-votes:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pollId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json({ error: "Session ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Delete demo votes for this session and poll
    const { error } = await supabase
      .from("demo_votes")
      .delete()
      .eq("poll_id", pollId)
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error deleting demo votes:", error);
      return Response.json({ error: "Failed to delete demo votes" }, { status: 500 });
    }

    // Return updated demo vote counts
    const { data: updatedCounts } = await supabase
      .rpc('get_demo_vote_counts', { poll_uuid: pollId });

    return Response.json({ 
      success: true, 
      demoVotes: updatedCounts || { 
        poll_id: pollId, 
        total_demo_votes: 0, 
        option_demo_votes: {} 
      }
    });

  } catch (error) {
    console.error("Error in DELETE /api/polls/[id]/demo-votes:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
