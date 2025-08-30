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
  XCircle
} from "lucide-react";
import type { Poll } from "@/types";

interface PollCardProps {
  poll: Poll;
  showResults?: boolean;
  compact?: boolean;
}

export function PollCard({ poll, showResults = false, compact = false }: PollCardProps) {
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const timeRemaining = poll.expiresAt
    ? Math.ceil((new Date(poll.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getWinningOption = () => {
    if (!showResults || poll.options.length === 0) return null;
    return poll.options.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );
  };

  const winningOption = getWinningOption();

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-lg ${compact ? 'p-4' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${compact ? 'text-lg' : 'text-xl'} line-clamp-2`}>
              {poll.title}
            </CardTitle>
            {poll.description && !compact && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {poll.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <Badge variant={poll.isActive && !isExpired ? "default" : "secondary"}>
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

      <CardContent className={compact ? 'pt-0' : ''}>
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
                {isExpired ? (
                  "Expired"
                ) : timeRemaining !== null ? (
                  `${timeRemaining}d left`
                ) : (
                  "No expiry"
                )}
              </span>
            </div>
          )}
        </div>

        {/* Results Preview */}
        {showResults && poll.totalVotes > 0 && (
          <div className="space-y-2 mb-4">
            {compact ? (
              // Compact view - show only winning option
              winningOption && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate">{winningOption.text}</span>
                    <span className="text-muted-foreground">
                      {poll.totalVotes > 0 ? Math.round((winningOption.votes / poll.totalVotes) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={poll.totalVotes > 0 ? (winningOption.votes / poll.totalVotes) * 100 : 0}
                    className="h-2"
                  />
                </div>
              )
            ) : (
              // Full view - show top 3 options
              poll.options
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 3)
                .map((option) => (
                  <div key={option.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{option.text}</span>
                      <span className="text-muted-foreground">
                        {poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                ))
            )}
            {!compact && poll.options.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{poll.options.length - 3} more options
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href={`/polls/${poll.id}`}>
              <Button variant="outline" size={compact ? "sm" : "default"}>
                <Eye className="w-4 h-4 mr-2" />
                {showResults ? "View Details" : "Vote Now"}
              </Button>
            </Link>
            {showResults && (
              <Button variant="ghost" size={compact ? "sm" : "default"}>
                Share
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Created {new Date(poll.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
