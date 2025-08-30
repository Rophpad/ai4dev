import Link from "next/link";
import { PollCard } from "@/components/polls/poll-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Share
} from "lucide-react";
import type { Poll } from "@/types";

// Sample user data - replace with actual user session
const currentUser = {
  id: "user1",
  email: "john@example.com",
  username: "john_doe",
};

// Sample user's polls - replace with actual API calls
const userPolls: Poll[] = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Help us understand the community's preferences for programming languages in 2024.",
    options: [
      { id: "1a", text: "JavaScript", votes: 45 },
      { id: "1b", text: "Python", votes: 38 },
      { id: "1c", text: "TypeScript", votes: 32 },
      { id: "1d", text: "Go", votes: 15 },
      { id: "1e", text: "Rust", votes: 12 },
    ],
    createdBy: "user1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    expiresAt: new Date("2024-02-15"),
    isActive: true,
    totalVotes: 142,
    allowMultipleVotes: false,
    isAnonymous: false,
  },
  {
    id: "4",
    title: "Office lunch preferences",
    description: "What type of food should we order for the office lunch this Friday?",
    options: [
      { id: "4a", text: "Pizza", votes: 15 },
      { id: "4b", text: "Asian cuisine", votes: 22 },
      { id: "4c", text: "Sandwiches", votes: 8 },
      { id: "4d", text: "Mexican food", votes: 19 },
    ],
    createdBy: "user1",
    createdAt: new Date("2024-01-22"),
    updatedAt: new Date("2024-01-22"),
    expiresAt: new Date("2024-01-26"),
    isActive: true,
    totalVotes: 64,
    allowMultipleVotes: false,
    isAnonymous: true,
  },
  {
    id: "draft1",
    title: "Team building activity ideas",
    description: "What activities should we plan for our next team building event?",
    options: [
      { id: "d1a", text: "Bowling", votes: 0 },
      { id: "d1b", text: "Escape room", votes: 0 },
      { id: "d1c", text: "Cooking class", votes: 0 },
      { id: "d1d", text: "Mini golf", votes: 0 },
    ],
    createdBy: "user1",
    createdAt: new Date("2024-01-23"),
    updatedAt: new Date("2024-01-23"),
    isActive: false,
    totalVotes: 0,
    allowMultipleVotes: true,
    isAnonymous: false,
  }
];

export default function DashboardPage() {
  const activePolls = userPolls.filter(poll => poll.isActive);
  const draftPolls = userPolls.filter(poll => !poll.isActive);
  const expiredPolls = userPolls.filter(poll =>
    poll.expiresAt && new Date(poll.expiresAt) <= new Date()
  );

  const totalVotes = userPolls.reduce((sum, poll) => sum + poll.totalVotes, 0);
  const totalPolls = userPolls.length;
  const avgVotesPerPoll = totalPolls > 0 ? Math.round(totalVotes / totalPolls) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {currentUser.username}! Here's an overview of your polls.
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
              <CardTitle className="text-sm font-medium">Avg Votes/Poll</CardTitle>
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
              <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
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
              <Badge variant="default" className="ml-1">{activePolls.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center space-x-2">
              <span>Drafts</span>
              <Badge variant="secondary" className="ml-1">{draftPolls.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <span>Results</span>
              <Badge variant="outline" className="ml-1">{expiredPolls.length}</Badge>
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
                    <PollCard
                      poll={poll}
                      showResults={true}
                      compact={false}
                    />

                    {/* Action buttons overlay */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 hover:opacity-100 transition-opacity">
                      <Link href={`/polls/${poll.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active polls</h3>
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
                    <PollCard
                      poll={poll}
                      showResults={false}
                      compact={false}
                    />

                    {/* Draft-specific actions */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <Button size="sm" variant="default">
                        Publish
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
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
                <h3 className="text-lg font-semibold mb-2">No completed polls yet</h3>
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

export const metadata = {
  title: "Dashboard | PollApp",
  description: "Manage your polls and view analytics",
};
