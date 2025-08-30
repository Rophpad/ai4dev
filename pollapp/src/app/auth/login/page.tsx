import { LoginForm } from "@/components/auth/login-form";
import { GuestOnly } from "@/components/auth/protected-route";
import type { Metadata } from "next";

export default function LoginPage() {
  return (
    <GuestOnly>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </GuestOnly>
  );
}

export const metadata: Metadata = {
  title: "Sign In | PollApp",
  description: "Sign in to your PollApp account",
};
