"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}

// Convenience wrapper for auth-required pages
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAuth={true}>{children}</ProtectedRoute>;
}

// Convenience wrapper for guest-only pages (login, register)
export function GuestOnly({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
      {children}
    </ProtectedRoute>
  );
}
