"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Vote,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Info,
  Loader2,
  RotateCcw,
} from "lucide-react";
import type { Poll } from "@/types";
import Link from "next/link";

// Import demo vote utilities for console debugging
import "@/lib/demo-vote-utils";

interface VoteSimulatorProps {
  poll: Poll;
  onLogin: () => void;
  onRegister: () => void;
}

interface DemoVoteData {
  totalDemoVotes: number;
  optionVotes: Record<string, number>;
  userHasVoted: boolean;
  userVotes: string[];
}

// LocalStorage keys
const getDemoVoteKey = (pollId: string) => `demo_votes_${pollId}`;
const getUserDemoVoteKey = (pollId: string) => `user_demo_vote_${pollId}`;

// Demo vote management functions
const getDemoVotes = (pollId: string): DemoVoteData => {
  if (typeof window === 'undefined') {
    return { totalDemoVotes: 0, optionVotes: {}, userHasVoted: false, userVotes: [] };
  }

  try {
    const demoData = localStorage.getItem(getDemoVoteKey(pollId));
    const userData = localStorage.getItem(getUserDemoVoteKey(pollId));
    
    const parsedDemoData = demoData ? JSON.parse(demoData) : { totalDemoVotes: 0, optionVotes: {} };
    const parsedUserData = userData ? JSON.parse(userData) : { userHasVoted: false, userVotes: [] };
    
    return {
      totalDemoVotes: parsedDemoData.totalDemoVotes || 0,
      optionVotes: parsedDemoData.optionVotes || {},
      userHasVoted: parsedUserData.userHasVoted || false,
      userVotes: parsedUserData.userVotes || [],
    };
  } catch (error) {
    console.warn('Error reading demo votes from localStorage:', error);
    return { totalDemoVotes: 0, optionVotes: {}, userHasVoted: false, userVotes: [] };
  }
};

const saveDemoVote = (pollId: string, selectedOptions: string[]) => {
  if (typeof window === 'undefined') return;

  try {
    const currentData = getDemoVotes(pollId);
    
    // If user has already voted, remove their previous votes
    if (currentData.userHasVoted) {
      currentData.userVotes.forEach(optionId => {
        currentData.optionVotes[optionId] = (currentData.optionVotes[optionId] || 1) - 1;
        if (currentData.optionVotes[optionId] <= 0) {
          delete currentData.optionVotes[optionId];
        }
      });
      currentData.totalDemoVotes = Math.max(0, currentData.totalDemoVotes - 1);
    }

    // Add new votes
    selectedOptions.forEach(optionId => {
      currentData.optionVotes[optionId] = (currentData.optionVotes[optionId] || 0) + 1;
    });
    
    if (!currentData.userHasVoted) {
      currentData.totalDemoVotes += 1;
    }

    // Save demo data
    localStorage.setItem(getDemoVoteKey(pollId), JSON.stringify({
      totalDemoVotes: currentData.totalDemoVotes,
      optionVotes: currentData.optionVotes,
    }));

    // Save user data
    localStorage.setItem(getUserDemoVoteKey(pollId), JSON.stringify({
      userHasVoted: true,
      userVotes: selectedOptions,
    }));
  } catch (error) {
    console.warn('Error saving demo vote to localStorage:', error);
  }
};

const clearUserDemoVote = (pollId: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    const currentData = getDemoVotes(pollId);
    
    if (currentData.userHasVoted) {
      // Remove user's votes from totals
      currentData.userVotes.forEach(optionId => {
        currentData.optionVotes[optionId] = (currentData.optionVotes[optionId] || 1) - 1;
        if (currentData.optionVotes[optionId] <= 0) {
          delete currentData.optionVotes[optionId];
        }
      });
      currentData.totalDemoVotes = Math.max(0, currentData.totalDemoVotes - 1);

      // Update demo data
      localStorage.setItem(getDemoVoteKey(pollId), JSON.stringify({
        totalDemoVotes: currentData.totalDemoVotes,
        optionVotes: currentData.optionVotes,
      }));

      // Clear user data
      localStorage.removeItem(getUserDemoVoteKey(pollId));
    }
  } catch (error) {
    console.warn('Error clearing demo vote from localStorage:', error);
  }
};

interface VoteSimulatorProps {
  poll: Poll;
  onLogin: () => void;
  onRegister: () => void;
}

export function VoteSimulator({ poll, onLogin, onRegister }: VoteSimulatorProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showSimulation, setShowSimulation] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [demoVoteData, setDemoVoteData] = useState<DemoVoteData>({ 
    totalDemoVotes: 0, 
    optionVotes: {}, 
    userHasVoted: false, 
    userVotes: [] 
  });

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const canVote = poll.isActive && !isExpired;

  // Load demo vote data on component mount
  useEffect(() => {
    const loadDemoData = () => {
      const data = getDemoVotes(poll.id);
      setDemoVoteData(data);
      setSelectedOptions(data.userVotes);
      if (data.userHasVoted) {
        setShowSimulation(true);
      }
    };

    loadDemoData();
  }, [poll.id]);

  const handleOptionSelect = (optionId: string) => {
    if (!canVote) return;

    if (poll.allowMultipleVotes) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSimulateVote = async () => {
    if (selectedOptions.length === 0) return;

    setIsSimulating(true);
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save the demo vote
    saveDemoVote(poll.id, selectedOptions);
    
    // Update local state
    const updatedData = getDemoVotes(poll.id);
    setDemoVoteData(updatedData);
    
    setIsSimulating(false);
    setShowSimulation(true);
  };

  const handleResetVote = () => {
    clearUserDemoVote(poll.id);
    const updatedData = getDemoVotes(poll.id);
    setDemoVoteData(updatedData);
    setSelectedOptions([]);
    setShowSimulation(false);
  };

  const getSimulatedPercentage = (optionId: string, realVotes: number) => {
    const demoVotes = demoVoteData.optionVotes[optionId] || 0;
    const totalVotes = poll.totalVotes + demoVoteData.totalDemoVotes;
    
    if (totalVotes === 0) return 0;
    
    const combinedVotes = realVotes + demoVotes;
    return Math.round((combinedVotes / totalVotes) * 100);
  };

  if (!canVote) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>
          {isExpired ? "This poll has expired." : "This poll is not currently active."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full border-dashed border-2 border-muted-foreground/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Vote className="w-5 h-5" />
            <span>Vote Preview</span>
            <Badge variant="outline">Demo Mode</Badge>
            {demoVoteData.totalDemoVotes > 0 && (
              <Badge variant="secondary" className="text-xs">
                {demoVoteData.totalDemoVotes} demo votes
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {demoVoteData.userHasVoted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetVote}
                title="Reset your demo vote"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            {showSimulation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSimulation(false)}
              >
                {showSimulation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSimulation ? "Hide Preview" : "Show Preview"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Information alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You're not logged in. This is a demo that combines real votes with community demo votes.
            <strong> Your vote won't be saved permanently</strong> until you create an account or log in.
            {demoVoteData.totalDemoVotes > 0 && (
              <span className="block mt-1 text-xs">
                📊 Showing {poll.totalVotes} real votes + {demoVoteData.totalDemoVotes} demo votes from visitors
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Voting interface */}
        {!showSimulation ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {poll.allowMultipleVotes ? (
                // Multiple choice voting
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Select one or more options (Preview):
                  </Label>
                  {poll.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`sim-${option.id}`}
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => handleOptionSelect(option.id)}
                        disabled={isSimulating}
                      />
                      <Label
                        htmlFor={`sim-${option.id}`}
                        className="flex-1 cursor-pointer py-2 px-3 rounded-md border bg-card hover:bg-accent transition-colors"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                // Single choice voting
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Select one option (Preview):
                  </Label>
                  <RadioGroup
                    value={selectedOptions[0] || ""}
                    onValueChange={(value) => handleOptionSelect(value)}
                  >
                    {poll.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3"
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={`sim-${option.id}`}
                          disabled={isSimulating}
                        />
                        <Label
                          htmlFor={`sim-${option.id}`}
                          className="flex-1 cursor-pointer py-2 px-3 rounded-md border bg-card hover:bg-accent transition-colors"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>

            <Button
              onClick={handleSimulateVote}
              disabled={selectedOptions.length === 0 || isSimulating || demoVoteData.userHasVoted}
              className="w-full sm:w-auto"
              variant="outline"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Demo Vote...
                </>
              ) : demoVoteData.userHasVoted ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Demo Vote Submitted
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Add Demo Vote
                </>
              )}
            </Button>
          </div>
        ) : (
          // Simulated results view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Combined Results (Real + Demo)
              </Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {poll.totalVotes} real + {demoVoteData.totalDemoVotes} demo
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {[...poll.options]
                .sort((a, b) => {
                  const aDemoVotes = demoVoteData.optionVotes[a.id] || 0;
                  const bDemoVotes = demoVoteData.optionVotes[b.id] || 0;
                  const aCombined = a.votes + aDemoVotes;
                  const bCombined = b.votes + bDemoVotes;
                  return bCombined - aCombined;
                })
                .map((option) => {
                  const demoVotes = demoVoteData.optionVotes[option.id] || 0;
                  const combinedVotes = option.votes + demoVotes;
                  const percentage = getSimulatedPercentage(option.id, option.votes);
                  const isYourVote = demoVoteData.userVotes.includes(option.id);

                  return (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border ${
                        isYourVote
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{option.text}</span>
                          {isYourVote && (
                            <Badge variant="default" className="text-xs">
                              Your demo vote
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-semibold">
                          {percentage}% ({combinedVotes})
                          {demoVotes > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({option.votes} + {demoVotes} demo)
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Authentication call-to-action */}
        <div className="space-y-4 pt-4 border-t">
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              <strong>Ready to make your vote count?</strong> Create an account or log in to save your vote permanently.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/register" className="flex-1">
              <Button className="w-full" onClick={onRegister}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account & Vote
              </Button>
            </Link>
            
            <Link href="/auth/login" className="flex-1">
              <Button variant="outline" className="w-full" onClick={onLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Log In & Vote
              </Button>
            </Link>
          </div>

          {showSimulation && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                💡 This shows combined real votes + community demo votes. Demo votes help others see trends but aren't counted in final results.
              </p>
              {demoVoteData.userHasVoted && (
                <p className="text-xs text-muted-foreground text-center">
                  🔄 Click the reset button above to change your demo vote.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
