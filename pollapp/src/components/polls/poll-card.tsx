"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  Eye,
  Vote,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { Poll } from "@/types";
import { PollVotersList } from "./poll-voters-list";

interface PollCardProps {
  poll: Poll;
  showResults?: boolean;
  compact?: boolean;
}

export function PollCard({
  poll,
  showResults = false,
  compact = false,
}: PollCardProps) {
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const timeRemaining = poll.expiresAt
    ? Math.ceil(
        (new Date(poll.expiresAt).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const getWinningOption = () => {
    if (!showResults || poll.options.length === 0) return null;
    return poll.options.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current,
    );
  };

  const winningOption = getWinningOption();

  return (
    <Card
      className={`w-full transition-all duration-200 hover:shadow-lg ${compact ? "h-auto min-h-[280px]" : "h-auto min-h-[320px]"} flex flex-col`}
    >
      <CardHeader className={`${compact ? "pb-3" : "pb-4"} flex-shrink-0`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle
              className={`${compact ? "text-lg" : "text-xl"} line-clamp-2 mb-2`}
            >
              {poll.title}
            </CardTitle>
            {poll.description && !compact && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {poll.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            <Badge
              variant={poll.isActive && !isExpired ? "default" : "secondary"}
            >
              {isExpired ? (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Expired
                </>
              ) : poll.isActive ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
            {poll.isAnonymous && (
              <Badge variant="outline" className="text-xs">
                Anonymous
              </Badge>
            )}
            {poll.allowMultipleVotes && (
              <Badge variant="outline" className="text-xs">
                Multiple Votes
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={`${compact ? "pt-0" : "pt-0"} flex-1 flex flex-col`}
      >
        {/* Poll Stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
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
                {isExpired
                  ? "Expired"
                  : timeRemaining !== null
                    ? `${timeRemaining}d left`
                    : "No expiry"}
              </span>
            </div>
          )}
        </div>

        {/* Results Preview - with better spacing */}
        <div className="flex-1 mb-4">
          {showResults && poll.totalVotes > 0 && (
            <div className="space-y-3">
              {compact
                ? // Compact view - show only winning option
                  winningOption && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">
                          {winningOption.text}
                        </span>
                        <span className="text-muted-foreground">
                          {poll.totalVotes > 0
                            ? Math.round(
                                (winningOption.votes / poll.totalVotes) * 100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          poll.totalVotes > 0
                            ? (winningOption.votes / poll.totalVotes) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  )
                : // Full view - show top 3 options
                  poll.options
                    .sort((a, b) => b.votes - a.votes)
                    .slice(0, 3)
                    .map((option) => (
                      <div key={option.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate">
                            {option.text}
                          </span>
                          <span className="text-muted-foreground">
                            {poll.totalVotes > 0
                              ? Math.round(
                                  (option.votes / poll.totalVotes) * 100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            poll.totalVotes > 0
                              ? (option.votes / poll.totalVotes) * 100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    ))}
              {!compact && poll.options.length > 3 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{poll.options.length - 3} more options
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Link href={`/polls/${poll.id}`}>
              <Button variant="outline" size={compact ? "sm" : "default"}>
                <Eye className="w-4 h-4 mr-2" />
                {showResults ? "View Details" : "Vote Now"}
              </Button>
            </Link>
            {showResults && !poll.isAnonymous && poll.totalVotes > 0 && (
              <PollVotersList 
                poll={poll} 
                trigger={
                  <Button variant="ghost" size={compact ? "sm" : "default"}>
                    <Users className="w-4 h-4 mr-2" />
                    Voters
                  </Button>
                }
              />
            )}
            {showResults && (
              <Button variant="ghost" size={compact ? "sm" : "default"}>
                Share
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground flex-shrink-0 ml-4">
            {new Date(poll.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
