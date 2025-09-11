"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Comment } from "@/types";

interface CommentFormProps {
  pollId: string;
  onCommentAdded: (comment: Comment) => void;
}

export function CommentForm({ pollId, onCommentAdded }: CommentFormProps) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/polls/${pollId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: commentText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post comment");
      }

      const data = await response.json();
      onCommentAdded(data.comment);
      setCommentText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertDescription>
          You must be logged in to post a comment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write a comment..."
        disabled={isSubmitting}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={isSubmitting || !commentText.trim()}>
        {isSubmitting ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
}
