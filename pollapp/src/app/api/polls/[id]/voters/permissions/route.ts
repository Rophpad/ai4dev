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

    // First, check if the poll exists and is not anonymous
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("id, is_anonymous, created_by")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      return Response.json({ 
        canView: false, 
        reason: "Poll not found" 
      }, { status: 404 });
    }

    if (poll.is_anonymous) {
      return Response.json({ 
        canView: false, 
        reason: "Cannot view voters for anonymous polls" 
      });
    }

    // Get current user to check permissions
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ 
        canView: false, 
        reason: "Authentication required" 
      });
    }

    // Check if user is the poll owner
    const isOwner = user.id === poll.created_by;
    
    if (isOwner) {
      return Response.json({ 
        canView: true, 
        reason: "Poll owner" 
      });
    }

    // Check if user has voted on this poll
    const { data: userVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .limit(1);
    
    const isVoter = !!(userVote && userVote.length > 0);
    
    return Response.json({ 
      canView: isVoter, 
      reason: isVoter ? "Poll voter" : "Only poll creators and voters can view the voters list" 
    });

  } catch (error) {
    console.error("Error in GET /api/polls/[id]/voters/permissions:", error);
    return Response.json({ 
      canView: false, 
      reason: "Internal server error" 
    }, { status: 500 });
  }
}
