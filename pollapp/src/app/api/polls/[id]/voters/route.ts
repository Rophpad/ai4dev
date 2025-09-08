import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import type { PollVoters } from "@/types";

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
      return Response.json({ error: "Poll not found" }, { status: 404 });
    }

    if (poll.is_anonymous) {
      return Response.json({ error: "Cannot view voters for anonymous polls" }, { status: 403 });
    }

    // Get current user to check permissions
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Only poll creators or voters can see the voters list
    const isOwner = user && user.id === poll.created_by;
    let isVoter = false;

    if (user && !isOwner) {
      const { data: userVote } = await supabase
        .from("votes")
        .select("id")
        .eq("poll_id", pollId)
        .eq("user_id", user.id)
        .limit(1);
      
      isVoter = !!(userVote && userVote.length > 0);
    }

    if (!isOwner && !isVoter) {
      return Response.json({ 
        error: "Only poll creators and voters can view the voters list",
        hasPermission: false 
      }, { status: 403 });
    }

    // Fetch votes with user information
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select(`
        id,
        option_id,
        created_at,
        user_id
      `)
      .eq("poll_id", pollId)
      .order("created_at", { ascending: true });

    if (votesError) {
      console.error("Error fetching votes:", votesError);
      return Response.json({ error: "Failed to fetch voters" }, { status: 500 });
    }

    // Get unique user IDs
    const userIds = [...new Set(votes?.map(vote => vote.user_id).filter(Boolean))];
    
    // Fetch profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a map of profiles for quick lookup
    const profileMap = new Map();
    profiles?.forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Group votes by user
    const voterMap = new Map<string, any>();
    const optionVoters: Record<string, any[]> = {};

    votes?.forEach((vote: any) => {
      const userId = vote.user_id;
      const profile = profileMap.get(userId);
      
      if (!voterMap.has(userId)) {
        voterMap.set(userId, {
          id: userId,
          username: profile?.username,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          votedAt: new Date(vote.created_at),
          selectedOptions: [vote.option_id],
        });
      } else {
        const existingVoter = voterMap.get(userId);
        existingVoter.selectedOptions.push(vote.option_id);
        // Keep the earliest vote time
        if (new Date(vote.created_at) < existingVoter.votedAt) {
          existingVoter.votedAt = new Date(vote.created_at);
        }
      }

      // Group by option
      if (!optionVoters[vote.option_id]) {
        optionVoters[vote.option_id] = [];
      }
      
      const existingInOption = optionVoters[vote.option_id].find(v => v.id === userId);
      if (!existingInOption) {
        optionVoters[vote.option_id].push({
          id: userId,
          username: profile?.username,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          votedAt: new Date(vote.created_at),
        });
      }
    });

    const voters = Array.from(voterMap.values());

    const result: PollVoters = {
      total: voters.length,
      voters: voters.sort((a, b) => a.votedAt.getTime() - b.votedAt.getTime()),
      optionVoters,
    };

    return Response.json(result);

  } catch (error) {
    console.error("Error in GET /api/polls/[id]/voters:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
