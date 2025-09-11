"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import type { Comment } from "@/types";

interface CommentListProps {
  pollId: string;
  newComment: Comment | null;
}

function CommentCard({ comment }: { comment: Comment }) {
  const displayName = comment.profiles.display_name || comment.profiles.username || 'Anonymous';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
        {comment.profiles.avatar_url ? (
          <Image
            src={comment.profiles.avatar_url}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
            width={32}
            height={32}
          />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-sm">{displayName}</p>
          {comment.profiles.username && (
            <Badge variant="outline" className="text-xs">
              @{comment.profiles.username}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>
        <p className="text-sm mt-1">{comment.comment_text}</p>
      </div>
    </div>
  );
}

function CommentListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentList({ pollId, newComment }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true);
        const response = await fetch(`/api/polls/${pollId}/comments`);
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        const data = await response.json();
        setComments(data.comments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [pollId]);

  useEffect(() => {
    if (newComment) {
      setComments((prevComments) => [newComment, ...prevComments]);
    }
  }, [newComment]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Comments</span>
          {!loading && (
            <Badge variant="secondary">{comments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <CommentListSkeleton />
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
