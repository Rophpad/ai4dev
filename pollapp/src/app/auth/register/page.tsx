import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Sign Up | PollApp",
  description: "Create your PollApp account",
};
