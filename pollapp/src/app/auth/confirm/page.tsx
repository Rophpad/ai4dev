"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmailConfirmation } from "@/components/email-confirmation";
import { useAuth } from "@/hooks/use-auth";
import type { RegisterData } from "@/types";

export default function ConfirmEmailPage() {
  const [email, setEmail] = useState<string>("");
  const [formData, setFormData] = useState<RegisterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { signUp, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Get email and form data from sessionStorage
    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("pendingConfirmationEmail");
      const storedFormData = sessionStorage.getItem("pendingConfirmationData");

      if (storedEmail) {
        setEmail(storedEmail);
      }

      if (storedFormData) {
        try {
          const parsedFormData = JSON.parse(storedFormData);
          setFormData(parsedFormData);
        } catch (err) {
          console.error("Failed to parse stored form data:", err);
        }
      }

      // If no email found, redirect back to registration
      if (!storedEmail) {
        console.log(
          "No pending confirmation email found, redirecting to register",
        );
        router.push("/auth/register");
      }
    }
  }, [router]);

  const handleResendEmail = async () => {
    if (!formData) {
      setError("Registration data not found. Please try registering again.");
      return;
    }

    try {
      setError(null);

      // Re-trigger signup to resend confirmation email
      await signUp(formData);

      // Show success message
      setError("Confirmation email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Resend email error:", err);
      setError(err.message || "Failed to resend email. Please try again.");
      throw err; // Re-throw to let EmailConfirmationPage handle loading state
    }
  };

  const handleBackToForm = () => {
    // Clear stored data and navigate back to registration
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pendingConfirmationEmail");
      sessionStorage.removeItem("pendingConfirmationData");
    }
    router.push("/auth/register");
  };

  // Show loading if email hasn't been loaded yet
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmailConfirmation
          email={email}
          onResendEmail={handleResendEmail}
          onBackToForm={handleBackToForm}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
