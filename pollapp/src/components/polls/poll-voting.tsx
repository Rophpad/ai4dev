"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  CheckCircle2,
  Vote,
  Eye,
  Share,
  Calendar,
  User,
  Loader2
} from "lucide-react";
import type { Poll } from "@/types";

interface PollVotingProps {
  poll: Poll;
  hasVoted?: boolean;
  userVotes?: string[];
  onVote?: (optionIds: string[]) => Promise<void>;
  showResults?: boolean;
}

export function PollVoting({
  poll,
  hasVoted = false,
  userVotes = [],
  onVote,
  showResults = false
}: PollVotingProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(userVotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const canVote = poll.isActive && !isExpired && !hasVoted;
  const timeRemaining = poll.expiresAt
    ? Math.ceil((new Date(poll.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleOptionSelect = (optionId: string) => {
    if (!canVote) return;

    if (poll.allowMultipleVotes) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
    setError(null);
  };

  const handleSubmitVote = async () => {
    if (selectedOptions.length === 0) {
      setError("Please select at least one option");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (onVote) {
        await onVote(selectedOptions);
      }
    } catch (err) {
      setError("Failed to submit vote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const winningOption = sortedOptions[0];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl mb-2">{poll.title}</CardTitle>
            {poll.description && (
              <p className="text-muted-foreground mb-4">{poll.description}</p>
            )}

            {/* Poll metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{poll.totalVotes} votes</span>
              </div>

              <div className="flex items-center space-x-1">
                <Vote className="w-4 h-4" />
                <span>{poll.options.length} options</span>
              </div>

              {poll.expiresAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {isExpired ? (
                      "Expired"
                    ) : timeRemaining !== null ? (
                      `${timeRemaining} days left`
                    ) : (
                      "No expiry"
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Created {new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-col items-end space-y-2 ml-4">
            <Badge variant={poll.isActive && !isExpired ? "default" : "secondary"}>
              {isExpired ? "Expired" : poll.isActive ? "Active" : "Draft"}
            </Badge>
            {poll.isAnonymous && (
              <Badge variant="outline" className="text-xs">
                Anonymous
              </Badge>
            )}
            {poll.allowMultipleVotes && (
              <Badge variant="outline" className="text-xs">
                Multiple Choice
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasVoted && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              You have already voted in this poll. Thank you for participating!
            </AlertDescription>
          </Alert>
        )}

        {isExpired && !hasVoted && (
          <Alert variant="destructive">
            <AlertDescription>
              This poll has expired and is no longer accepting votes.
            </AlertDescription>
          </Alert>
        )}

        {/* Voting interface or results */}
        {canVote && !showResults ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {poll.allowMultipleVotes ? (
                // Multiple choice voting
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Select one or more options:
                  </Label>
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={option.id}
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => handleOptionSelect(option.id)}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer py-2 px-3 rounded-md border bg-card hover:bg-accent transition-colors"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                // Single choice voting
                <RadioGroup
                  value={selectedOptions[0] || ""}
                  onValueChange={(value) => handleOptionSelect(value)}
                >
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer py-2 px-3 rounded-md border bg-card hover:bg-accent transition-colors"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            <Button
              onClick={handleSubmitVote}
              disabled={selectedOptions.length === 0 || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Vote...
                </>
              ) : (
                <>
                  <Vote className="mr-2 h-4 w-4" />
                  Submit Vote
                </>
              )}
            </Button>
          </div>
        ) : (
          // Results view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Results</Label>
              {poll.totalVotes > 0 && (
                <span className="text-sm text-muted-foreground">
                  {poll.totalVotes} total votes
                </span>
              )}
            </div>

            {poll.totalVotes === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Vote className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No votes yet. Be the first to vote!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOptions.map((option, index) => {
                  const percentage = getPercentage(option.votes);
                  const isWinner = option.id === winningOption?.id && poll.totalVotes > 0;
                  const isUserVote = userVotes.includes(option.id);

                  return (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border ${
                        isWinner ? "border-primary bg-primary/5" : "border-border"
                      } ${isUserVote ? "ring-2 ring-primary/20" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{option.text}</span>
                          {isWinner && poll.totalVotes > 0 && (
                            <Badge variant="default" className="text-xs">
                              Leading
                            </Badge>
                          )}
                          {isUserVote && (
                            <Badge variant="outline" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              Your vote
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-semibold">
                          {percentage}% ({option.votes})
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share Poll
          </Button>

          {(hasVoted || showResults) && (
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              {showResults ? "Hide Results" : "View Results"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
