import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { GuestOnly } from "@/components/auth/protected-route";
import type { Metadata } from "next";

export default function ResetPasswordPage() {
  return (
    <GuestOnly>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          <ResetPasswordForm />
        </div>
      </div>
    </GuestOnly>
  );
}

export const metadata: Metadata = {
  title: "Reset Password | PollApp",
  description: "Reset your PollApp account password",
};
