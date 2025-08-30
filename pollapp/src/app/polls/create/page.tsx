import { CreatePollForm } from "@/components/polls/create-poll-form";

export default function CreatePollPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <CreatePollForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Create Poll | PollApp",
  description: "Create a new poll and gather opinions from your audience",
};
