"use client";

import { PollVoting } from "@/components/polls/poll-voting";
import { notFound } from "next/navigation";
import Link from "next/link";
import { usePoll, usePolls } from "@/hooks/use-polls";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

// Get user vote status from database
const getUserVoteStatus = async (pollId: string, userId?: string) => {
  if (!userId) {
    return { hasVoted: false, userVotes: [] };
  }

  const supabase = createClient();
  const { data: votes } = await supabase
    .from("votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("user_id", userId);

  const userVotes = votes?.map((vote) => vote.option_id) || [];

  return {
    hasVoted: userVotes.length > 0,
    userVotes,
  };
};

// Loading Skeleton
function PollPageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Skeleton className="h-4 w-16" />
          <span>/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Poll Voting Skeleton */}
        <div className="border rounded-lg p-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-32 mt-6" />
        </div>

        {/* Related Polls Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-5 w-5/6 mb-3" />
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PollPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    results?: string;
  }>;
}

function PollPageContent({ params, searchParams }: PollPageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const { poll, loading, error, vote } = usePoll(resolvedParams.id);
  const { polls: relatedPolls } = usePolls({ status: "active" });
  const [userVoteStatus, setUserVoteStatus] = useState({
    hasVoted: false,
    userVotes: [] as string[],
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    fetchCurrentUser();
  }, []);

  // Fetch user vote status
  useEffect(() => {
    const fetchUserVoteStatus = async () => {
      if (currentUser && poll) {
        const status = await getUserVoteStatus(poll.id, currentUser.id);
        setUserVoteStatus(status);
      }
    };

    if (poll && currentUser) {
      fetchUserVoteStatus();
    }
  }, [poll, currentUser]);

  // Update document title
  useEffect(() => {
    if (poll) {
      document.title = `${poll.title} | PollApp`;
    }
  }, [poll]);

  const handleVote = async (optionIds: string[]) => {
    try {
      await vote(optionIds);

      // Update user vote status
      setUserVoteStatus({
        hasVoted: true,
        userVotes: optionIds,
      });
    } catch (err) {
      console.error("Failed to vote:", err);
      alert("Failed to submit vote. Please try again.");
    }
  };

  if (loading) {
    return <PollPageLoadingSkeleton />;
  }

  if (error || !poll) {
    notFound();
  }

  const showResults =
    resolvedSearchParams.results === "true" || userVoteStatus.hasVoted;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb and Actions */}
        <div className="flex items-center justify-between mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              href="/polls"
              className="hover:text-foreground transition-colors"
            >
              All Polls
            </Link>
            <span>/</span>
            <span className="text-foreground">{poll.title}</span>
          </nav>
          
          {/* Edit button for poll owner */}
          {currentUser && currentUser.id === poll.createdBy && (
            <div className="flex items-center space-x-2">
              {!poll.isActive && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/polls/${poll.id}/publish`, {
                        method: 'POST',
                      });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (err) {
                      console.error('Failed to publish poll:', err);
                    }
                  }}
                >
                  Publish Poll
                </Button>
              )}
              <Link href={`/polls/${poll.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Poll
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Poll Component */}
        <PollVoting
          poll={poll}
          hasVoted={userVoteStatus.hasVoted}
          userVotes={userVoteStatus.userVotes}
          onVote={handleVote}
          showResults={showResults}
        />

        {/* Related Polls Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Other Active Polls</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedPolls
              .filter((p) => p.id !== poll.id && p.isActive)
              .slice(0, 4)
              .map((relatedPoll) => (
                <div
                  key={relatedPoll.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <h3 className="font-medium mb-2 line-clamp-2">
                    <Link
                      href={`/polls/${relatedPoll.id}`}
                      className="hover:text-primary"
                    >
                      {relatedPoll.title}
                    </Link>
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{relatedPoll.totalVotes} votes</span>
                    <span>{relatedPoll.options.length} options</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PollPage({ params, searchParams }: PollPageProps) {
  return <PollPageContent params={params} searchParams={searchParams} />;
}
