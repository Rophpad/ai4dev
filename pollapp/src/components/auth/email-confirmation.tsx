"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Mail,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface EmailConfirmationPageProps {
  email: string;
  onResendEmail: () => Promise<void>;
  onBackToForm: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export function EmailConfirmation({
  email,
  onResendEmail,
  onBackToForm,
  loading = false,
  error = null,
  className = "",
}: EmailConfirmationPageProps) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<Date | null>(null);

  const handleResendEmail = async () => {
    try {
      setResendLoading(true);
      await onResendEmail();
      setResendCount((prev) => prev + 1);
      setLastResendTime(new Date());
    } catch {
      // Error handling is managed by parent component
    } finally {
      setResendLoading(false);
    }
  };

  const getResendButtonText = () => {
    if (resendLoading) return "Resending...";
    if (resendCount === 0) return "Resend Confirmation Email";
    return `Resend Again (${resendCount})`;
  };

  const formatLastResendTime = () => {
    if (!lastResendTime) return null;
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastResendTime.getTime()) / 60000,
    );

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    return `${diffMinutes} minutes ago`;
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
        <CardDescription className="text-base">
          We&apos;ve sent you a confirmation link
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Message */}
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">
            We&apos;ve sent a confirmation link to:
          </p>
          <div className="bg-muted rounded-lg p-3">
            <p className="font-medium text-foreground break-all">{email}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to verify your account and complete your
            registration.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                What to do next:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <li>Check your email inbox</li>
                <li>Look for an email from our service</li>
                <li>Click the confirmation link</li>
                <li>Return here to sign in</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Can&apos;t find the email?</strong>
          </p>
          <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
            <li>• Check your spam/junk folder</li>
            <li>• Wait a few minutes for delivery</li>
            <li>• Make sure the email address is correct</li>
            <li>• Try resending the confirmation email</li>
          </ul>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert
            variant={
              error.includes("sent!") ||
              error.includes("Confirmation email sent")
                ? "default"
                : "destructive"
            }
          >
            <AlertDescription className="flex items-start space-x-2">
              {error.includes("sent!") ||
              error.includes("Confirmation email sent") ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : null}
              <span>{error}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Last resend info */}
        {lastResendTime && (
          <div className="text-center text-sm text-muted-foreground">
            Last email sent {formatLastResendTime()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            variant="default"
            className="w-full"
            disabled={resendLoading || loading}
          >
            {resendLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {getResendButtonText()}
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onBackToForm}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Form
            </Button>

            <Link href="/auth/login">
              <Button variant="ghost" className="w-full" disabled={loading}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="border-t pt-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Still having trouble?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link
                href="/support"
                className="text-primary hover:underline inline-flex items-center"
              >
                Contact Support
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/help/email-verification"
                className="text-primary hover:underline inline-flex items-center"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>

        {/* Email Provider Quick Links */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground text-center mb-2">
            Quick access to popular email providers:
          </p>
          <div className="flex justify-center space-x-3 text-xs">
            <a
              href="https://gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Gmail
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://outlook.live.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Outlook
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://mail.yahoo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Yahoo
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
