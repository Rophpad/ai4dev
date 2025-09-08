"use client";

import Link from "next/link";
import { PollCard } from "@/components/polls/poll-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAuth } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { useUserPolls } from "@/hooks/use-polls";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Share,
  Loader2,
} from "lucide-react";
//import type { Poll } from "@/types";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-9 w-48 mb-3" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-12 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Polls Management Skeleton */}
        <Tabs defaultValue="active" className="space-y-6">
          <div className="grid w-full grid-cols-3 lg:w-[400px] border-b">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Active Polls Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { polls: userPolls, loading, error, deletePoll, updatePoll } = useUserPolls();

  const activePolls = userPolls.filter((poll) => poll.isActive);
  const draftPolls = userPolls.filter((poll) => !poll.isActive);
  const expiredPolls = userPolls.filter(
    (poll) => poll.expiresAt && new Date(poll.expiresAt) <= new Date(),
  );

  const totalVotes = userPolls.reduce((sum, poll) => sum + poll.totalVotes, 0);
  const totalPolls = userPolls.length;
  const avgVotesPerPoll =
    totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

  const getDisplayName = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name;
    }
    return user?.email?.split("@")[0] || "User";
  };

  const handleDeletePoll = async (pollId: string) => {
    if (window.confirm("Are you sure you want to delete this poll?")) {
      try {
        await deletePoll(pollId);
      } catch (err) {
        console.error("Failed to delete poll:", err);
        alert("Failed to delete poll. Please try again.");
      }
    }
  };

  const handlePublishPoll = async (pollId: string) => {
    try {
      const response = await fetch(`/api/polls/${pollId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish poll');
      }

      // Simple refresh to update the state
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to publish poll:", err);
      alert(err.message || "Failed to publish poll. Please try again.");
    }
  };

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {getDisplayName()}! Here&apos;s an overview of your
              polls.
            </p>
          </div>
          <Link href="/polls/create">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New Poll</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPolls}</div>
              <p className="text-xs text-muted-foreground">
                {activePolls.length} active, {draftPolls.length} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotes}</div>
              <p className="text-xs text-muted-foreground">
                Across all your polls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Votes/Poll
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgVotesPerPoll}</div>
              <p className="text-xs text-muted-foreground">
                Average engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Polls
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePolls.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently accepting votes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Polls Management */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <span>Active</span>
              <Badge variant="default" className="ml-1">
                {activePolls.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center space-x-2">
              <span>Drafts</span>
              <Badge variant="secondary" className="ml-1">
                {draftPolls.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center space-x-2"
            >
              <span>Results</span>
              <Badge variant="outline" className="ml-1">
                {expiredPolls.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Active Polls */}
          <TabsContent value="active" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Polls</h2>
              <p className="text-sm text-muted-foreground">
                {activePolls.length} polls currently accepting votes
              </p>
            </div>

            {activePolls.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {activePolls.map((poll) => (
                  <div key={poll.id} className="relative">
                    <PollCard poll={poll} showResults={true} compact={false} />

                    {/* Action buttons overlay */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 hover:opacity-100 transition-opacity">
                      <Link href={`/polls/${poll.id}`}>
                        <Button size="sm" variant="outline" title="View Poll">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/polls/${poll.id}/edit`}>
                        <Button size="sm" variant="outline" title="Edit Poll">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" title="Share Poll">
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePoll(poll.id)}
                        title="Delete Poll"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No active polls
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first poll to start gathering opinions
                  </p>
                  <Link href="/polls/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Poll
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Draft Polls */}
          <TabsContent value="drafts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Draft Polls</h2>
              <p className="text-sm text-muted-foreground">
                {draftPolls.length} polls ready to publish
              </p>
            </div>

            {draftPolls.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {draftPolls.map((poll) => (
                  <div key={poll.id} className="relative">
                    <PollCard poll={poll} showResults={false} compact={false} />

                    {/* Draft-specific actions */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handlePublishPoll(poll.id)}
                        title="Publish Poll"
                      >
                        Publish
                      </Button>
                      <Link href={`/polls/${poll.id}/edit`}>
                        <Button size="sm" variant="outline" title="Edit Poll">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePoll(poll.id)}
                        title="Delete Poll"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Edit className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No draft polls</h3>
                  <p className="text-muted-foreground mb-6">
                    Draft polls will appear here before you publish them
                  </p>
                  <Link href="/polls/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Poll
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Results */}
          <TabsContent value="results" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Poll Results</h2>
              <p className="text-sm text-muted-foreground">
                View completed and expired polls
              </p>
            </div>

            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No completed polls yet
                </h3>
                <p className="text-muted-foreground">
                  Expired polls and their results will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
