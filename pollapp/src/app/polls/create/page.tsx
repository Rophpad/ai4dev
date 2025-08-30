import { CreatePollForm } from "@/components/polls/create-poll-form";
import { RequireAuth } from "@/components/auth/protected-route";
import type { Metadata } from "next";

export default function CreatePollPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto">
          <CreatePollForm />
        </div>
      </div>
    </RequireAuth>
  );
}

export const metadata: Metadata = {
  title: "Create Poll | PollApp",
  description: "Create a new poll and gather opinions from your audience",
};
