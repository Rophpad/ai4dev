"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import type { LoginCredentials, RegisterData } from "@/types";
import { CANCELLED } from "node:dns/promises";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async ({ email, password }: LoginCredentials) => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);

      // Provide more specific error messages
      let errorMessage = error.message;

      if (error.message?.toLowerCase().includes("invalid login credentials")) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.toLowerCase().includes("email not confirmed")) {
        errorMessage =
          "Please check your email and confirm your account before signing in.";
      } else if (error.message?.toLowerCase().includes("too many requests")) {
        errorMessage =
          "Too many login attempts. Please wait a few minutes before trying again.";
      } else if (error.message?.toLowerCase().includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      throw new Error(errorMessage);
    }
  };

  const signUp = async ({ email, password, username }: RegisterData) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setLoading(false);

      // Provide more specific error messages
      let errorMessage = error.message;

      if (error.message?.toLowerCase().includes("user already registered")) {
        errorMessage = `An account with this email already exists. Please sign in instead.`;
      } else if (error.message?.toLowerCase().includes("email")) {
        if (error.message?.toLowerCase().includes("invalid")) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message?.toLowerCase().includes("already")) {
          errorMessage = `An account with this email already exists. Please sign in instead.`;
        }
      } else if (error.message?.toLowerCase().includes("password")) {
        if (
          error.message?.toLowerCase().includes("weak") ||
          error.message?.toLowerCase().includes("short")
        ) {
          errorMessage =
            "Password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.";
        } else {
          errorMessage =
            "Password requirements not met. Please check your password.";
        }
      }

      throw new Error(errorMessage);
    }

    setLoading(false);

    // Return whether user needs to confirm their email
    // If user is created but email_confirmed_at is null, they need confirmation
    return {
      needsConfirmation: !data.user?.user_metadata?.email_verified,
    };
  };

  const signOut = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for protecting routes that require authentication
export function useRequireAuth() {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}

// Hook for guest-only routes (login, register)
export function useGuestOnly() {
  const { user, loading } = useAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
