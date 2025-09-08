"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    Eye,
    Clock,
    Calendar,
    X,
} from "lucide-react";
import { usePollVoters } from "@/hooks/use-poll-voters";
import { useCanViewVoters } from "@/hooks/use-can-view-voters";
import type { Poll, Voter } from "@/types";
import Image from "next/image";

interface PollVotersListProps {
    poll: Poll;
    trigger?: React.ReactNode;
}

function VoterAvatar({ voter }: { voter: Voter }) {
    const displayName = voter.display_name || voter.username || voter.email?.split('@')[0] || 'Anonymous';
    const initials = displayName.slice(0, 2).toUpperCase();

    return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
            {voter.avatar_url ? (
                <Image
                    src={voter.avatar_url}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                    width={100}
                    height={100}
                />
            ) : (
                initials
            )}
        </div>
    );
}

function VoterCard({ voter, poll }: { voter: Voter; poll: Poll }) {
    const displayName = voter.display_name || voter.username || voter.email?.split('@')[0] || 'Anonymous';
    const selectedOptionTexts = voter.selectedOptions
        .map(optionId => poll.options.find(opt => opt.id === optionId)?.text)
        .filter(Boolean);

    return (
        <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <VoterAvatar voter={voter} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm truncate">{displayName}</p>
                    {voter.username && (
                        <Badge variant="outline" className="text-xs">
                            @{voter.username}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span> {new Date(voter.votedAt).toLocaleDateString()} at {new Date(voter.votedAt).toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span> {new Date(voter.votedAt).toLocaleDateString()} at {new Date(voter.votedAt).toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Voted for:</p>
                    <div className="flex flex-wrap gap-1">
                        {selectedOptionTexts.map((optionText, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {optionText}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function VotersListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                        <div className="flex space-x-1">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PollVotersList({ poll, trigger }: PollVotersListProps) {
    const [showVoters, setShowVoters] = useState(false);
    const { canView, loading: permissionLoading } = useCanViewVoters(
        poll.id, 
        poll.createdBy, 
        poll.isAnonymous
    );
    const { voters, loading, error, refetch } = usePollVoters(poll.id, poll.isAnonymous, canView);

    // Don't show for anonymous polls
    if (poll.isAnonymous) {
        return null;
    }

    // Show loading state while checking permissions
    if (permissionLoading) {
        return (
            <Button variant="outline" size="sm" disabled>
                <Users className="w-4 h-4 mr-2" />
                Loading...
            </Button>
        );
    }

    // Don't show if user doesn't have permission
    if (!canView) {
        return null;
    }

    const defaultTrigger = (
        <Button variant="outline" size="sm" onClick={() => setShowVoters(true)}>
            <Users className="w-4 h-4 mr-2" />
            View Voters ({poll.totalVotes})
        </Button>
    );

    const handleShow = () => {
        setShowVoters(true);
        if (!voters && !loading) {
            refetch();
        }
    };

    if (!showVoters) {
        return (
            <div onClick={handleShow}>
                {trigger || defaultTrigger}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>Poll Voters</span>
                        {voters && (
                            <Badge variant="secondary">
                                {voters.total} {voters.total === 1 ? 'voter' : 'voters'}
                            </Badge>
                        )}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVoters(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden">
                    {loading ? (
                        <VotersListSkeleton />
                    ) : error ? (
                        <div className="text-center py-8">
                            <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">Cannot View Voters</h3>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    ) : !voters || voters.total === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">No Voters Yet</h3>
                            <p className="text-sm text-muted-foreground">
                                No one has voted on this poll yet.
                            </p>
                        </div>
                    ) : (
                        <Tabs defaultValue="all" className="h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="all">
                                    All Voters ({voters.total})
                                </TabsTrigger>
                                <TabsTrigger value="by-option">
                                    By Option
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="flex-1 overflow-hidden">
                                <div className="h-[400px] overflow-y-auto">
                                    <div className="space-y-3 pr-4">
                                        {voters.voters.map((voter) => (
                                            <VoterCard key={voter.id} voter={voter} poll={poll} />
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="by-option" className="flex-1 overflow-hidden">
                                <div className="h-[400px] overflow-y-auto">
                                    <div className="space-y-6 pr-4">
                                        {poll.options.map((option) => {
                                            const optionVoters = voters.optionVoters[option.id] || [];
                                            return (
                                                <div key={option.id}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-medium">{option.text}</h4>
                                                        <Badge variant="outline">
                                                            {optionVoters.length} votes
                                                        </Badge>
                                                    </div>

                                                    {optionVoters.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            No votes for this option yet.
                                                        </p>
                                                    ) : (
                                                        <div className="grid gap-2">
                                                            {optionVoters.map((voter) => (
                                                                <div key={`${option.id}-${voter.id}`} className="flex items-center space-x-2 p-2 rounded border">
                                                                    <VoterAvatar voter={voter} />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium truncate">
                                                                            {voter.display_name || voter.username || voter.email?.split('@')[0] || 'Anonymous'}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {new Date(voter.votedAt).toLocaleDateString()} at {new Date(voter.votedAt).toLocaleTimeString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
