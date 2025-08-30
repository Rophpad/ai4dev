"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from "react";
import type { AuthUser, LoginCredentials, RegisterData, AuthResponse } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication - replace with actual implementation
const mockUsers: Array<AuthUser & { password: string }> = [
  {
    id: "1",
    email: "john@example.com",
    username: "john_doe",
    password: "password123",
  },
  {
    id: "2",
    email: "jane@example.com",
    username: "jane_smith",
    password: "password456",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        // TODO: Replace with actual session check
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("auth_user");

        if (token && userData) {
          // Verify token is still valid
          await new Promise(resolve => setTimeout(resolve, 500));

          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid session
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication
      const foundUser = mockUsers.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      const authUser: AuthUser = {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
      };

      const mockToken = `mock_token_${foundUser.id}_${Date.now()}`;

      // Store auth data
      localStorage.setItem("auth_token", mockToken);
      localStorage.setItem("auth_user", JSON.stringify(authUser));

      setUser(authUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user already exists
      const existingUser = mockUsers.find(
        u => u.email === data.email || u.username === data.username
      );

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new Error("An account with this email already exists");
        }
        if (existingUser.username === data.username) {
          throw new Error("This username is already taken");
        }
      }

      // Create new user
      const newUser: AuthUser & { password: string } = {
        id: Date.now().toString(),
        email: data.email,
        username: data.username,
        password: data.password,
      };

      mockUsers.push(newUser);

      const authUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      };

      const mockToken = `mock_token_${newUser.id}_${Date.now()}`;

      // Store auth data
      localStorage.setItem("auth_token", mockToken);
      localStorage.setItem("auth_user", JSON.stringify(authUser));

      setUser(authUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with actual API call to invalidate token
      await new Promise(resolve => setTimeout(resolve, 300));

      // Clear auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout even if API call fails
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No token to refresh");
      }

      // TODO: Replace with actual token refresh API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newToken = `refreshed_${token}_${Date.now()}`;
      localStorage.setItem("auth_token", newToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
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

// Hook for protecting routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      // TODO: Redirect to login page
      // For now, just log a warning
      console.warn("Authentication required for this route");
    }
  }, [user, isLoading]);

  return { user, isLoading, isAuthenticated: !!user };
}

// Hook for guest-only routes (login, register)
export function useGuestOnly() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // TODO: Redirect to dashboard
      // For now, just log a message
      console.log("User is already authenticated, should redirect");
    }
  }, [user, isLoading]);

  return { user, isLoading, isAuthenticated: !!user };
}

// Utility function to get auth headers for API requests
export function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
}

// Utility function to handle auth errors
export function handleAuthError(error: any) {
  if (error.status === 401 || error.status === 403) {
    // Token expired or invalid
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    // TODO: Redirect to login
    window.location.href = "/auth/login";
  }
}
