"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { RegisterData } from "@/types";

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { signUp, loading } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (formData.username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const result = await signUp(formData);
      setError(null);
      if (result.needsConfirmation) {
        
        setShowConfirmation(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("pendingConfirmationEmail", formData.email);
          sessionStorage.setItem(
            "pendingConfirmationData",
            JSON.stringify(formData),
          );
        }
        router.push("/auth/confirm");
      } else {
        
        // User is automatically logged in
        router.push("/auth/login");
      }
    } catch (err: any) {
      // Handle specific error cases
      const errorMessage = err.message || "";
      setError(errorMessage);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResendLoading(true);
      setError(null);

      // Re-trigger signup to resend confirmation email
      await signUp(formData);

      // Show success message briefly
      setError("Confirmation email sent! Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to resend email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Sign up to start creating and participating in polls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showConfirmation ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
              <p className="text-muted-foreground mb-4">
                We&apos;ve sent a confirmation link to{" "}
                <span className="font-medium text-foreground">
                  {formData.email}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Click the link in the email to verify your account and complete
                your registration.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Can&apos;t find the email?</strong> Check your spam
                  folder or wait a few minutes for it to arrive.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleResendEmail}
                variant="default"
                className="w-full"
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Confirmation Email"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmation(false);
                  setError(null);
                }}
                variant="outline"
                className="w-full"
              >
                Back to Form
              </Button>
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  I&apos;ll verify later - Go to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {error.includes("already exists") && (
                    <>
                      {" "}
                      <Link
                        href="/auth/login"
                        className="font-medium underline hover:no-underline"
                      >
                        Sign in here
                      </Link>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={loading}
                  minLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
