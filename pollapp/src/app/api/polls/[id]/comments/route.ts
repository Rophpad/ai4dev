import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        id,
        comment_text,
        created_at,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq("poll_id", pollId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
    }

    return Response.json({ comments });

  } catch (error) {
    console.error("Error in GET /api/polls/[id]/comments:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id;
    const { comment_text } = await request.json();

    if (!comment_text) {
      return Response.json({ error: "Comment text is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data: newComment, error } = await supabase
      .from("comments")
      .insert({
        poll_id: pollId,
        user_id: user.id,
        comment_text: comment_text,
      })
      .select(`
        id,
        comment_text,
        created_at,
        profiles (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return Response.json({ error: "Failed to create comment" }, { status: 500 });
    }

    return Response.json({ comment: newComment }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/polls/[id]/comments:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
