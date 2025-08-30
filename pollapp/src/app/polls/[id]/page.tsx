import { PollVoting } from "@/components/polls/poll-voting";
import { notFound } from "next/navigation";
import type { Poll } from "@/types";
import type { Metadata } from "next";

// Sample data - replace with actual API calls
const samplePolls: Record<string, Poll> = {
  "1": {
    id: "1",
    title: "What's your favorite programming language?",
    description:
      "Help us understand the community's preferences for programming languages in 2024. This poll will help us decide which languages to focus on for our upcoming tutorials and courses.",
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
  "2": {
    id: "2",
    title: "Best time for team meetings?",
    description:
      "Let's find a time that works for everyone on the team. Please select all time slots that work for you.",
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
  "3": {
    id: "3",
    title: "Which feature should we prioritize next?",
    description:
      "Your input helps us decide what to work on next for our product roadmap. Each vote represents what our users want most.",
    options: [
      { id: "3a", text: "Dark mode support", votes: 67 },
      { id: "3b", text: "Mobile app", votes: 89 },
      { id: "3c", text: "API integration", votes: 45 },
      { id: "3d", text: "Advanced analytics dashboard", votes: 34 },
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
  "4": {
    id: "4",
    title: "Office lunch preferences",
    description:
      "What type of food should we order for the office lunch this Friday? The winning option will be our lunch for the week!",
    options: [
      { id: "4a", text: "Pizza (Italian classics)", votes: 15 },
      { id: "4b", text: "Asian cuisine (Thai/Chinese)", votes: 22 },
      { id: "4c", text: "Sandwiches & wraps", votes: 8 },
      { id: "4d", text: "Mexican food (tacos/burritos)", votes: 19 },
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
};

// Simulate user voting state - replace with actual user session/auth
const getUserVoteStatus = (pollId: string) => {
  // This would typically come from your auth system and database
  const mockUserVotes: Record<string, string[]> = {
    "1": [], // User hasn't voted
    "2": ["2b"], // User voted for 2:00 PM - 3:00 PM
    "3": ["3b"], // User voted for Mobile app
    "4": [], // User hasn't voted
  };

  return {
    hasVoted: mockUserVotes[pollId]?.length > 0,
    userVotes: mockUserVotes[pollId] || [],
  };
};

interface PollPageProps {
  params: {
    id: string;
  };
  searchParams: {
    results?: string;
  };
}

export default async function PollPage({
  params,
  searchParams,
}: PollPageProps) {
  const poll = samplePolls[params.id];

  if (!poll) {
    notFound();
  }

  const { hasVoted, userVotes } = getUserVoteStatus(params.id);
  const showResults = searchParams.results === "true" || hasVoted;

  const handleVote = async (optionIds: string[]) => {
    "use server";

    // TODO: Implement actual voting logic
    // - Validate user is authenticated
    // - Check if user has already voted (if single vote poll)
    // - Update vote counts in database
    // - Record user's vote

    console.log(`User voted for poll ${params.id} with options:`, optionIds);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, you would:
    // 1. Call your API endpoint
    // 2. Update the database
    // 3. Revalidate the page data
    // 4. Handle any errors
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <a href="/polls" className="hover:text-foreground transition-colors">
            All Polls
          </a>
          <span>/</span>
          <span className="text-foreground">{poll.title}</span>
        </nav>

        {/* Poll Component */}
        <PollVoting
          poll={poll}
          hasVoted={hasVoted}
          userVotes={userVotes}
          onVote={handleVote}
          showResults={showResults}
        />

        {/* Related Polls Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Other Active Polls</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.values(samplePolls)
              .filter((p) => p.id !== poll.id && p.isActive)
              .slice(0, 4)
              .map((relatedPoll) => (
                <div
                  key={relatedPoll.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <h3 className="font-medium mb-2 line-clamp-2">
                    <a
                      href={`/polls/${relatedPoll.id}`}
                      className="hover:text-primary"
                    >
                      {relatedPoll.title}
                    </a>
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

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const poll = samplePolls[params.id];

  if (!poll) {
    return {
      title: "Poll Not Found | PollApp",
    };
  }

  return {
    title: `${poll.title} | PollApp`,
    description: poll.description || `Vote on: ${poll.title}`,
  };
}

// Generate static params for known polls (optional, for better performance)
export async function generateStaticParams() {
  // In a real app, you'd fetch this from your API/database
  return Object.keys(samplePolls).map((id) => ({
    id,
  }));
}
