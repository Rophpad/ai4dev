// User types - extending Supabase User
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User extends SupabaseUser {
  username?: string;
  display_name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
}

// Poll types
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  totalVotes: number;
  allowMultipleVotes?: boolean;
  isAnonymous?: boolean;
}

export interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
  expiresAt?: Date;
  allowMultipleVotes?: boolean;
  isAnonymous?: boolean;
}

export interface UpdatePollData {
  title?: string;
  description?: string;
  options?: Array<{
    id?: string;
    text: string;
    isNew?: boolean;
  }>;
  expiresAt?: Date | null;
  allowMultipleVotes?: boolean;
  isAnonymous?: boolean;
  isActive?: boolean;
}

export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId?: string;
  createdAt: Date;
  ipAddress?: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface PollFormData {
  title: string;
  description: string;
  options: string[];
  expiresAt: string;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
}

// Filter and sorting types
export interface PollFilters {
  status?: "active" | "expired" | "all";
  createdBy?: string;
  sortBy?: "createdAt" | "totalVotes" | "title";
  sortOrder?: "asc" | "desc";
}

// State types
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface PollsState {
  polls: Poll[];
  currentPoll: Poll | null;
  isLoading: boolean;
  error: string | null;
}
