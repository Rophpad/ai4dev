"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

function SettingsContent() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pollVotes: true,
    pollComments: false,
    pollExpiry: true,
    weeklyDigest: true,
    marketingEmails: false,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public", // public, private, friends
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,
    showOnlineStatus: true,
  });

  // Display Settings
  const [display, setDisplay] = useState({
    language: "en",
    timezone: "America/New_York",
    pollsPerPage: "10",
  });

  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }));
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  const handleDisplayChange = (key: string, value: string) => {
    setDisplay((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const handleSaveSettings = async (section: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage(`${section} settings updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage("Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("New passwords don't match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Simulate password update
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccessMessage("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setErrorMessage("Please type DELETE to confirm account deletion.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Simulate account deletion
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Sign out and redirect
      await signOut();
      window.location.href = "/";
    } catch {
      setErrorMessage("Failed to delete account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
            <Settings className="h-8 w-8" />
            <span>Settings</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your account preferences and security settings
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
        {errorMessage && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="text-red-800">{errorMessage}</div>
          </Alert>
        )}

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger
              value="notifications"
              className="flex items-center space-x-1"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex items-center space-x-1"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger
              value="display"
              className="flex items-center space-x-1"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center space-x-1"
            >
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationChange(
                          "emailNotifications",
                          checked as boolean,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Poll Votes</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone votes on your polls
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.pollVotes}
                      onCheckedChange={(checked) =>
                        handleNotificationChange(
                          "pollVotes",
                          checked as boolean,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Poll Comments</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone comments on your polls
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.pollComments}
                      onCheckedChange={(checked) =>
                        handleNotificationChange(
                          "pollComments",
                          checked as boolean,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Poll Expiry</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when your polls are about to expire
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.pollExpiry}
                      onCheckedChange={(checked) =>
                        handleNotificationChange(
                          "pollExpiry",
                          checked as boolean,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of your poll activity
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) =>
                        handleNotificationChange(
                          "weeklyDigest",
                          checked as boolean,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new features and tips
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) =>
                        handleNotificationChange(
                          "marketingEmails",
                          checked as boolean,
                        )
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSettings("Notification")}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Notification Settings</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Who can see your profile and polls
                    </p>
                    <RadioGroup
                      value={privacy.profileVisibility}
                      onValueChange={(value) =>
                        handlePrivacyChange("profileVisibility", value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public">
                          Public - Anyone can see your profile
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private">
                          Private - Only you can see your profile
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your email on your public profile
                      </p>
                    </div>
                    <Checkbox
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) =>
                        handlePrivacyChange("showEmail", checked as boolean)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Location</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your location on your public profile
                      </p>
                    </div>
                    <Checkbox
                      checked={privacy.showLocation}
                      onCheckedChange={(checked) =>
                        handlePrivacyChange("showLocation", checked as boolean)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Let other users send you direct messages
                      </p>
                    </div>
                    <Checkbox
                      checked={privacy.allowDirectMessages}
                      onCheckedChange={(checked) =>
                        handlePrivacyChange(
                          "allowDirectMessages",
                          checked as boolean,
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Online Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Let others see when you&apos;re online
                      </p>
                    </div>
                    <Checkbox
                      checked={privacy.showOnlineStatus}
                      onCheckedChange={(checked) =>
                        handlePrivacyChange(
                          "showOnlineStatus",
                          checked as boolean,
                        )
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSettings("Privacy")}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Privacy Settings</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Display Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose your preferred color scheme
                    </p>
                    <RadioGroup
                      value={theme}
                      onValueChange={setTheme}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Sun className="h-4 w-4" />
                        <Label htmlFor="light">Light</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Moon className="h-4 w-4" />
                        <Label htmlFor="dark">Dark</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Monitor className="h-4 w-4" />
                        <Label htmlFor="system">System</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      value={display.language}
                      onChange={(e) =>
                        handleDisplayChange("language", e.target.value)
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-background"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={display.timezone}
                      onChange={(e) =>
                        handleDisplayChange("timezone", e.target.value)
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-background"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="pollsPerPage">Polls per Page</Label>
                    <select
                      id="pollsPerPage"
                      value={display.pollsPerPage}
                      onChange={(e) =>
                        handleDisplayChange("pollsPerPage", e.target.value)
                      }
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-background"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSettings("Display")}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Display Settings</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "currentPassword",
                            e.target.value,
                          )
                        }
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword", e.target.value)
                        }
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "confirmPassword",
                            e.target.value,
                          )
                        }
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  <span>Update Password</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. This
                    will permanently delete your profile, polls, and all
                    associated data.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="deleteConfirm" className="text-red-800">
                          Type &quot;DELETE&quot; to confirm account deletion:
                        </Label>
                        <Input
                          id="deleteConfirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="border-red-300"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={loading || deleteConfirmText !== "DELETE"}
                          className="flex items-center space-x-2"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span>Permanently Delete Account</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText("");
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
