"use client";

import { useState, useMemo, useCallback } from "react";
import { PollCard } from "@/components/polls/poll-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePolls } from "@/hooks/use-polls";
import type { PollFilters } from "@/types";

// Skeleton Components
function PollCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function PollsSectionSkeleton({ title, count = 6 }: { title: string; count?: number }) {
  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-8 ml-3 rounded-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <PollCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-8">
      <div className="relative flex-1 max-w-md">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-10 w-[140px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function PollsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
  const [isFiltering, setIsFiltering] = useState(false);

  const filters: PollFilters = useMemo(
    () => ({
      status: statusFilter,
      sortBy: sortBy === "newest" ? "createdAt" : sortBy === "oldest" ? "createdAt" : "totalVotes",
      sortOrder: sortBy === "oldest" ? "asc" : "desc",
    }),
    [statusFilter, sortBy],
  );

  const { polls, loading, error } = usePolls(filters);

  // Debounced search with loading state
  const handleSearchChange = useCallback((value: string) => {
    if (value !== searchQuery) {
      setIsFiltering(true);
      setSearchQuery(value);
      // Simulate filtering delay for better UX
      setTimeout(() => setIsFiltering(false), 300);
    }
  }, [searchQuery]);

  const handleStatusFilterChange = useCallback((value: "all" | "active" | "expired") => {
    if (value !== statusFilter) {
      setIsFiltering(true);
      setStatusFilter(value);
      setTimeout(() => setIsFiltering(false), 300);
    }
  }, [statusFilter]);

  const handleSortByChange = useCallback((value: "newest" | "oldest" | "popular") => {
    if (value !== sortBy) {
      setIsFiltering(true);
      setSortBy(value);
      setTimeout(() => setIsFiltering(false), 300);
    }
  }, [sortBy]);

  // Memoized filtered polls to prevent unnecessary recalculations
  const filteredPolls = useMemo(() => {
    if (!polls.length) return [];
    
    return polls.filter(
      (poll) =>
        poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [polls, searchQuery]);

  // Memoized poll categories
  const pollCategories = useMemo(() => {
    const active = filteredPolls.filter(
      (poll) => poll.isActive && (!poll.expiresAt || new Date(poll.expiresAt) > new Date()),
    );
    const expired = filteredPolls.filter(
      (poll) => poll.expiresAt && new Date(poll.expiresAt) <= new Date(),
    );
    const draft = filteredPolls.filter((poll) => !poll.isActive);

    return { active, expired, draft };
  }, [filteredPolls]);

  // Initial loading state
  if (loading && !polls.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <FiltersSkeleton />
          <StatsSkeleton />
          <PollsSectionSkeleton title="Active Polls" count={6} />
          <PollsSectionSkeleton title="Recent Results" count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Error Loading Polls</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const { active: activePolls, expired: expiredPolls, draft: draftPolls } = pollCategories;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Polls</h1>
            <p className="text-muted-foreground">
              Discover and participate in polls from the community
            </p>
          </div>
          <Link href="/polls/create">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Poll</span>
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search polls..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Polls</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading indicator for filtering */}
        {isFiltering && (
          <div className="flex items-center justify-center py-4 mb-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Updating results...</span>
          </div>
        )}

        {/* Stats */}
        {!isFiltering ? (
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <Badge variant="default">{activePolls.length} Active</Badge>
              <Badge variant="secondary">{expiredPolls.length} Expired</Badge>
              <Badge variant="outline">{draftPolls.length} Draft</Badge>
            </div>
          </div>
        ) : (
          <StatsSkeleton />
        )}

        {/* Content Area */}
        {isFiltering ? (
          // Show skeletons while filtering
          <>
            <PollsSectionSkeleton title="Active Polls" count={Math.min(activePolls.length, 6)} />
            {expiredPolls.length > 0 && (
              <PollsSectionSkeleton title="Recent Results" count={Math.min(expiredPolls.length, 3)} />
            )}
            {draftPolls.length > 0 && (
              <PollsSectionSkeleton title="Draft Polls" count={Math.min(draftPolls.length, 3)} />
            )}
          </>
        ) : (
          <>
            {/* Active Polls */}
            {activePolls.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  Active Polls
                  <Badge className="ml-3">{activePolls.length}</Badge>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {activePolls.map((poll) => (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      showResults={false}
                      compact={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Results */}
            {expiredPolls.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  Recent Results
                  <Badge variant="secondary" className="ml-3">
                    {expiredPolls.length}
                  </Badge>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {expiredPolls.map((poll) => (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      showResults={true}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Draft Polls */}
            {draftPolls.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  Draft Polls
                  <Badge variant="outline" className="ml-3">
                    {draftPolls.length}
                  </Badge>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {draftPolls.map((poll) => (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      showResults={false}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {polls.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No polls found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms or filters."
                    : "Be the first to create a poll and start gathering opinions!"}
                </p>
                <Link href="/polls/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Poll
                  </Button>
                </Link>
              </div>
            )}

            {/* No Results for Current Filter */}
            {polls.length > 0 && filteredPolls.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No matching polls found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSortBy("newest");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PollsPage() {
  return <PollsContent />;
}