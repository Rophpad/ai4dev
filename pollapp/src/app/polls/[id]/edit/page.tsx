import { EditPollForm } from "@/components/polls/edit-poll-form";
import { RequireAuth } from "@/components/auth/protected-route";
import type { Metadata } from "next";

interface EditPollPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const resolvedParams = await params;
  
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto">
          <EditPollForm pollId={resolvedParams.id} />
        </div>
      </div>
    </RequireAuth>
  );
}

export const metadata: Metadata = {
  title: "Edit Poll | PollApp",
  description: "Edit your poll details and settings",
};
