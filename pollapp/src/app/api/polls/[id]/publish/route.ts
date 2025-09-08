import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pollId = resolvedParams.id;

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
      return Response.json({ error: "Unauthorized - you can only publish your own polls" }, { status: 403 });
    }

    if (poll.status !== "draft") {
      return Response.json({ error: "Only draft polls can be published" }, { status: 400 });
    }

    // Update poll status to active
    const { data: updatedPoll, error: updateError } = await supabase
      .from("polls")
      .update({ 
        status: "active",
        updated_at: new Date().toISOString()
      })
      .eq("id", pollId)
      .select()
      .single();

    if (updateError) {
      console.error("Error publishing poll:", updateError);
      return Response.json({ error: "Failed to publish poll" }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: "Poll published successfully",
      poll: updatedPoll,
    });

  } catch (error) {
    console.error("Error in POST /api/polls/[id]/publish:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
