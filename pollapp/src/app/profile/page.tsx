"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    checkUsernameAvailability,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    website: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    message: string;
    available: boolean;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form data when profile loads
  useState(() => {
    if (profile && !isEditing) {
      setFormData({
        username: profile.username || "",
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        website: profile.website || "",
        location: profile.location || "",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }

    // Check username availability
    if (field === "username" && value !== profile?.username) {
      if (value.trim()) {
        checkUsernameAvailability(value).then(setUsernameStatus);
      } else {
        setUsernameStatus(null);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: profile?.username || "",
      display_name: profile?.display_name || "",
      bio: profile?.bio || "",
      website: profile?.website || "",
      location: profile?.location || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsernameStatus(null);
    setSuccessMessage(null);
    setFormData({
      username: profile?.username || "",
      display_name: profile?.display_name || "",
      bio: profile?.bio || "",
      website: profile?.website || "",
      location: profile?.location || "",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate username if changed
      if (formData.username !== profile?.username && formData.username) {
        const availability = await checkUsernameAvailability(formData.username);
        if (!availability.available) {
          setUsernameStatus(availability);
          return;
        }
      }

      await updateProfile({
        username: formData.username || undefined,
        display_name: formData.display_name || undefined,
        bio: formData.bio || undefined,
        website: formData.website || undefined,
        location: formData.location || undefined,
      });

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setUsernameStatus(null);
    } catch (err: any) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    try {
      setAvatarUploading(true);
      await uploadAvatar(file);
      setSuccessMessage("Avatar updated successfully!");
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.username) return profile.username;
    return user?.email?.split("@")[0] || "User";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Picture Card Skeleton */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Profile Picture</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-block">
                  {/* Avatar skeleton */}
                  <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
                </div>

                {/* Change Photo Button Skeleton */}
                <Skeleton className="h-9 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </CardContent>
            </Card>

            {/* Profile Information Card Skeleton */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <Skeleton className="h-9 w-24" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Email Field Skeleton */}
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>

                  {/* Username Field Skeleton */}
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  {/* Display Name Field Skeleton */}
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>

                  {/* Bio Field Skeleton */}
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-8 mb-1" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Website Field Skeleton */}
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-14 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>

                  {/* Location Field Skeleton */}
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-14 mb-1" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>

                  {/* Member Since Field Skeleton */}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <div className="text-green-800">{successMessage}</div>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="text-red-800">{error}</div>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Picture */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Profile Picture</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 overflow-hidden">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      priority
                    />
                  ) : (
                    getDisplayName().charAt(0).toUpperCase()
                  )}
                </div>
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={avatarUploading}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={avatarUploading}
                  asChild
                >
                  <span>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </span>
                </Button>
              </label>

              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                // View Mode
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Username</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile?.username || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">
                        Display Name
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {profile?.display_name || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Label className="text-sm font-medium">Bio</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile?.bio || "Tell us about yourself..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Website</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile?.website ? (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          "Not set"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile?.location || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">
                        Member Since
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(profile?.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      placeholder="Choose a username"
                    />
                    {usernameStatus && (
                      <p
                        className={`text-xs mt-1 ${
                          usernameStatus.available
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {usernameStatus.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) =>
                        handleInputChange("display_name", e.target.value)
                      }
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://your-website.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving || usernameStatus?.available === false}
                      className="flex items-center space-x-2"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{saving ? "Saving..." : "Save Changes"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
