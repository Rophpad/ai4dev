import { RegisterForm } from "@/components/auth/register-form";
import { GuestOnly } from "@/components/auth/protected-route";
import type { Metadata } from "next";

export default function RegisterPage() {
  return (
    <GuestOnly>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </GuestOnly>
  );
}

export const metadata: Metadata = {
  title: "Sign Up | PollApp",
  description: "Create your PollApp account",
};
