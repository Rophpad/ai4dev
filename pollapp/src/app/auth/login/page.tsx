import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Sign In | PollApp",
  description: "Sign in to your PollApp account",
};
