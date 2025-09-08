"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, X, Calendar, Settings, Save, ArrowLeft } from "lucide-react";
import { usePoll, useUserPolls } from "@/hooks/use-polls";
import type { Poll, UpdatePollData } from "@/types";

interface EditPollFormProps {
  pollId: string;
}

function EditPollFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title and description skeletons */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>

          {/* Options skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              ))}
            </div>
          </div>

          {/* Settings skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          </div>

          {/* Buttons skeleton */}
          <div className="flex items-center justify-between pt-6">
            <Skeleton className="h-10 w-20" />
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EditPollForm({ pollId }: EditPollFormProps) {
  const { poll, loading: pollLoading, error: pollError } = usePoll(pollId);
  const { updatePoll } = useUserPolls();
  const router = useRouter();

  const [formData, setFormData] = useState<UpdatePollData>({
    title: "",
    description: "",
    options: [],
    allowMultipleVotes: false,
    isAnonymous: false,
    isActive: true,
  });
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize form data when poll loads
  useEffect(() => {
    if (poll) {
      setFormData({
        title: poll.title,
        description: poll.description || "",
        options: poll.options.map(option => ({
          id: option.id,
          text: option.text,
          isNew: false,
        })),
        allowMultipleVotes: poll.allowMultipleVotes || false,
        isAnonymous: poll.isAnonymous || false,
        isActive: poll.isActive,
      });
      
      if (poll.expiresAt) {
        setExpiryDate(new Date(poll.expiresAt).toISOString().slice(0, 16));
      }
    }
  }, [poll]);

  const handleInputChange = (field: keyof UpdatePollData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = { ...newOptions[index], text: value };
    handleInputChange("options", newOptions);
  };

  const addOption = () => {
    if ((formData.options?.length || 0) < 10) {
      const newOptions = [...(formData.options || [])];
      newOptions.push({ text: "", isNew: true });
      handleInputChange("options", newOptions);
    }
  };

  const removeOption = (index: number) => {
    if ((formData.options?.length || 0) > 2) {
      const newOptions = formData.options?.filter((_, i) => i !== index) || [];
      handleInputChange("options", newOptions);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title?.trim()) {
      setError("Poll title is required");
      return false;
    }

    if (!formData.options || formData.options.length < 2) {
      setError("At least 2 options are required");
      return false;
    }

    const validOptions = formData.options.filter(option => option.text.trim());
    if (validOptions.length < 2) {
      setError("At least 2 non-empty options are required");
      return false;
    }

    if (formData.title.length > 200) {
      setError("Title must be 200 characters or less");
      return false;
    }

    if (formData.description && formData.description.length > 1000) {
      setError("Description must be 1000 characters or less");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !poll) return;

    try {
      setSaving(true);

      const updates: UpdatePollData = {
        title: formData.title!,
        description: formData.description || undefined,
        allowMultipleVotes: formData.allowMultipleVotes,
        isAnonymous: formData.isAnonymous,
        isActive: formData.isActive,
        expiresAt: expiryDate ? new Date(expiryDate) : null,
        options: formData.options,
      };

      const response = await fetch(`/api/polls/${poll.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update poll');
      }

      router.push(`/polls/${poll.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update poll. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (pollLoading) {
    return <EditPollFormSkeleton />;
  }

  if (pollError || !poll) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Poll Not Found</h3>
            <p className="text-muted-foreground mb-6">
              {pollError || "The poll you're trying to edit doesn't exist or you don't have permission to edit it."}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if poll has votes (should restrict editing)
  const hasVotes = poll.totalVotes > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Poll</CardTitle>
          <CardDescription>
            Update your poll details and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {hasVotes && (
              <Alert>
                <AlertDescription>
                  ⚠️ This poll has received votes. Some changes may affect existing results.
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Poll Title *</Label>
                <Input
                  id="title"
                  placeholder="What would you like to ask?"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={saving}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title?.length || 0}/200 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional context or details..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={saving}
                  maxLength={1000}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description?.length || 0}/1000 characters
                </p>
              </div>
            </div>

            {/* Poll Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Poll Options *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={saving || (formData.options?.length || 0) >= 10 || hasVotes}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </Button>
              </div>

              <div className="space-y-3">
                {formData.options?.map((option, index) => (
                  <div key={option.id || index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        disabled={saving || (!option.isNew && hasVotes)}
                        maxLength={200}
                      />
                    </div>
                    {(formData.options?.length || 0) > 2 && (!hasVotes || option.isNew) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={saving}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {hasVotes && (
                <p className="text-xs text-muted-foreground">
                  💡 You can only add new options to polls with existing votes. Existing options cannot be modified.
                </p>
              )}
              
              {!hasVotes && (
                <p className="text-xs text-muted-foreground">
                  You can add up to 10 options. At least 2 options are required.
                </p>
              )}
            </div>

            {/* Poll Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Poll Settings</span>
              </Label>

              <div className="space-y-2">
                <Label
                  htmlFor="expiryDate"
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Expiry Date (Optional)</span>
                </Label>
                <Input
                  id="expiryDate"
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={saving}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for polls that never expire
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowMultiple"
                    checked={formData.allowMultipleVotes}
                    onCheckedChange={(checked) =>
                      handleInputChange("allowMultipleVotes", checked)
                    }
                    disabled={saving || hasVotes}
                  />
                  <Label htmlFor="allowMultiple" className="text-sm">
                    Allow multiple votes per user
                    {hasVotes && <span className="text-muted-foreground"> (cannot be changed after votes)</span>}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAnonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) =>
                      handleInputChange("isAnonymous", checked)
                    }
                    disabled={saving || hasVotes}
                  />
                  <Label htmlFor="isAnonymous" className="text-sm">
                    Anonymous voting (don&apos;t show who voted)
                    {hasVotes && <span className="text-muted-foreground"> (cannot be changed after votes)</span>}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                    disabled={saving}
                  />
                  <Label htmlFor="isActive" className="text-sm">
                    Active (accepting votes)
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>

              <div className="flex items-center space-x-3">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
