"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileData {
  username?: string;
  display_name?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatar_url?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === "PGRST116") {
          await createProfile();
          return;
        }
        throw error;
      }

      setProfile({
        ...data,
        email: user.email || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  // Create initial profile
  const createProfile = async () => {
    if (!user) return;

    try {
      const initialProfile = {
        id: user.id,
        username: user.user_metadata?.username || null,
        display_name: user.user_metadata?.display_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert([initialProfile])
        .select()
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        email: user.email || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
    }
  };

  // Update profile
  const updateProfile = async (updates: UpdateProfileData) => {
    if (!user || !profile) {
      throw new Error("No user or profile loaded");
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        email: user.email || "",
      });

      return data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update profile";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      setLoading(true);
      setError(null);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return publicUrl;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to upload avatar";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete avatar
  const deleteAvatar = async () => {
    if (!user || !profile?.avatar_url) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Extract filename from URL
      const fileName = profile.avatar_url.split("/").pop();
      if (!fileName) throw new Error("Invalid avatar URL");

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([fileName]);

      if (deleteError) throw deleteError;

      // Update profile
      await updateProfile({ avatar_url: null });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete avatar";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username.trim()) {
      return { available: false, message: "Username cannot be empty" };
    }

    if (username.length < 3) {
      return { available: false, message: "Username must be at least 3 characters" };
    }

    if (username.length > 30) {
      return { available: false, message: "Username must be less than 30 characters" };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { available: false, message: "Username can only contain letters, numbers, and underscores" };
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user?.id || "")
        .limit(1);

      if (error) throw error;

      return {
        available: data.length === 0,
        message: data.length === 0 ? "Username is available" : "Username is already taken",
      };
    } catch (err) {
      return { available: false, message: "Failed to check username availability" };
    }
  };

  // Load profile on user change
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    checkUsernameAvailability,
    refetch: fetchProfile,
  };
}
