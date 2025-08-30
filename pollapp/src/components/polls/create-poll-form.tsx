"use client";

import { useState } from "react";
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
import { Loader2, Plus, X, Calendar, Settings } from "lucide-react";
import { useCreatePoll } from "@/hooks/use-create-poll";
import type { CreatePollData } from "@/types";

export function CreatePollForm() {
  const [formData, setFormData] = useState<CreatePollData>({
    title: "",
    description: "",
    options: ["", ""],
    allowMultipleVotes: false,
    isAnonymous: false,
  });
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { createPoll, validatePollData, loading } = useCreatePoll();
  const router = useRouter();

  const handleInputChange = (field: keyof CreatePollData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    handleInputChange("options", newOptions);
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      handleInputChange("options", [...formData.options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      handleInputChange("options", newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const validation = validatePollData({
      ...formData,
      expiresAt: expiryDate ? new Date(expiryDate) : undefined,
    });

    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    try {
      const pollData: CreatePollData = {
        ...formData,
        options: formData.options.filter((option) => option.trim() !== ""),
        expiresAt: expiryDate ? new Date(expiryDate) : undefined,
      };

      const createdPoll = await createPoll(pollData);

      // Redirect to the newly created poll
      router.push(`/polls/${createdPoll.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create poll. Please try again.");
    }
  };

  const handleSaveDraft = async () => {
    // TODO: Implement save as draft functionality
    console.log("Save as draft functionality coming soon");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Poll</CardTitle>
          <CardDescription>
            Create engaging polls and gather opinions from your audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
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
                  disabled={loading}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/200 characters
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
                  disabled={loading}
                  maxLength={1000}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/1000 characters
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
                  disabled={loading || formData.options.length >= 10}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </Button>
              </div>

              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        disabled={loading}
                        maxLength={200}
                      />
                    </div>
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={loading}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                You can add up to 10 options. At least 2 options are required.
              </p>
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
                  disabled={loading}
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
                    disabled={loading}
                  />
                  <Label htmlFor="allowMultiple" className="text-sm">
                    Allow multiple votes per user
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAnonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) =>
                      handleInputChange("isAnonymous", checked)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="isAnonymous" className="text-sm">
                    Anonymous voting (don&apos;t show who voted)
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Poll...
                    </>
                  ) : (
                    "Create Poll"
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
