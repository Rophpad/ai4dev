import { PollCard } from "@/components/polls/poll-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus } from "lucide-react";
import Link from "next/link";
import type { Poll } from "@/types";

// Sample data - replace with actual API calls
const samplePolls: Poll[] = [
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
    id: "2",
    title: "Best time for team meetings?",
    description: "Let's find a time that works for everyone on the team.",
    options: [
      { id: "2a", text: "9:00 AM - 10:00 AM", votes: 23 },
      { id: "2b", text: "2:00 PM - 3:00 PM", votes: 31 },
      { id: "2c", text: "3:00 PM - 4:00 PM", votes: 18 },
      { id: "2d", text: "4:00 PM - 5:00 PM", votes: 8 },
    ],
    createdBy: "user2",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    expiresAt: new Date("2024-01-25"),
    isActive: true,
    totalVotes: 80,
    allowMultipleVotes: true,
    isAnonymous: true,
  },
  {
    id: "3",
    title: "Which feature should we prioritize next?",
    description: "Your input helps us decide what to work on next for our product roadmap.",
    options: [
      { id: "3a", text: "Dark mode", votes: 67 },
      { id: "3b", text: "Mobile app", votes: 89 },
      { id: "3c", text: "API integration", votes: 45 },
      { id: "3d", text: "Advanced analytics", votes: 34 },
    ],
    createdBy: "user3",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    expiresAt: new Date("2024-02-10"),
    isActive: true,
    totalVotes: 235,
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
    id: "5",
    title: "Weekend workshop topics",
    description: "Which topics would you be most interested in for our upcoming weekend workshops?",
    options: [
      { id: "5a", text: "Web Development", votes: 0 },
      { id: "5b", text: "Data Science", votes: 0 },
      { id: "5c", text: "Design Thinking", votes: 0 },
      { id: "5d", text: "Digital Marketing", votes: 0 },
    ],
    createdBy: "user2",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    expiresAt: new Date("2024-01-01"),
    isActive: false,
    totalVotes: 0,
    allowMultipleVotes: true,
    isAnonymous: false,
  },
];

export default function PollsPage() {
  const activePolls = samplePolls.filter(poll => poll.isActive && (!poll.expiresAt || new Date(poll.expiresAt) > new Date()));
  const expiredPolls = samplePolls.filter(poll => poll.expiresAt && new Date(poll.expiresAt) <= new Date());
  const draftPolls = samplePolls.filter(poll => !poll.isActive);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Polls</h1>
            <p className="text-muted-foreground">
              Discover and participate in polls from the community
            </p>
          </div>
          <Link href="/polls/create">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Poll</span>
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search polls..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Polls</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Badge variant="default">{activePolls.length} Active</Badge>
            <Badge variant="secondary">{expiredPolls.length} Expired</Badge>
            <Badge variant="outline">{draftPolls.length} Draft</Badge>
          </div>
        </div>

        {/* Active Polls */}
        {activePolls.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              Active Polls
              <Badge className="ml-3">{activePolls.length}</Badge>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {activePolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  showResults={false}
                  compact={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Results */}
        {expiredPolls.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              Recent Results
              <Badge variant="secondary" className="ml-3">{expiredPolls.length}</Badge>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {expiredPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  showResults={true}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Draft Polls */}
        {draftPolls.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              Draft Polls
              <Badge variant="outline" className="ml-3">{draftPolls.length}</Badge>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {draftPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  showResults={false}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {samplePolls.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to create a poll and start gathering opinions!
            </p>
            <Link href="/polls/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Poll
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: "All Polls | PollApp",
  description: "Browse and participate in community polls",
};
