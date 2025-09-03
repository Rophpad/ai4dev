"use client";

import React, { useState, useMemo } from "react";
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
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePolls } from "@/hooks/use-polls";
import { useUrlState } from "@/hooks/use-url-state";
import type { PollFilters } from "@/types";

function PollsContent() {
  const { getUrlState, updateUrlState } = useUrlState();
  const urlState = getUrlState();
  
  const [searchQuery, setSearchQuery] = useState(urlState.search);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired"
  >(urlState.status as "all" | "active" | "expired");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">(
    urlState.sort as "newest" | "oldest" | "popular",
  );

  // Update URL when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateUrlState({ search: value, page: 1 });
  };

  const handleStatusFilterChange = (value: "all" | "active" | "expired") => {
    setStatusFilter(value);
    updateUrlState({ status: value, page: 1 });
  };

  const handleSortChange = (value: "newest" | "oldest" | "popular") => {
    setSortBy(value);
    updateUrlState({ sort: value, page: 1 });
  };

  const filters: PollFilters = useMemo(
    () => ({
      status: statusFilter,
      sortBy:
        sortBy === "newest"
          ? "createdAt"
          : sortBy === "oldest"
            ? "createdAt"
            : "totalVotes",
      sortOrder: sortBy === "oldest" ? "asc" : "desc",
    }),
    [statusFilter, sortBy],
  );

  const { polls, loading, error } = usePolls(filters);

  // Filter polls based on search query
  const filteredPolls = useMemo(() => 
    polls.filter(
      (poll) =>
        poll.title.toLowerCase().includes((searchQuery ?? "").toLowerCase()) ||
        (poll.description &&
          poll.description.toLowerCase().includes((searchQuery ?? "").toLowerCase())),
    ), [polls, searchQuery]
  );

  // Categorize polls
  const categorizedPolls = useMemo(() => {
    const active = filteredPolls.filter(
      (poll) =>
        poll.isActive &&
        (!poll.expiresAt || new Date(poll.expiresAt) > new Date()),
    );
    const expired = filteredPolls.filter(
      (poll) => poll.expiresAt && new Date(poll.expiresAt) <= new Date(),
    );
    const draft = filteredPolls.filter((poll) => !poll.isActive);

    return { active, expired, draft };
  }, [filteredPolls]);

  // Pagination for each category
  const activePagination = usePagination(categorizedPolls.active.length, urlState.pageSize);
  const expiredPagination = usePagination(categorizedPolls.expired.length, 6);
  const draftPagination = usePagination(categorizedPolls.draft.length, 6);

  // Update pagination state from URL
  React.useEffect(() => {
    if ((urlState.page ?? 1) !== activePagination.currentPage) {
      activePagination.setCurrentPage(urlState.page ?? 1);
    }
  }, [urlState.page, activePagination]);

  // Handle pagination changes
  const handleActivePageChange = (page: number) => {
    activePagination.setCurrentPage(page);
    updateUrlState({ page });
  };

  const handleActivePageSizeChange = (pageSize: number) => {
    activePagination.setItemsPerPage(pageSize);
    updateUrlState({ pageSize, page: 1 });
  };

  // Get paginated items
  const paginatedActivePolls = activePagination.getPageItems(categorizedPolls.active);
  const paginatedExpiredPolls = expiredPagination.getPageItems(categorizedPolls.expired);
  const paginatedDraftPolls = draftPagination.getPageItems(categorizedPolls.draft);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading polls...</span>
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
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Polls</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={handleSortChange}
            >
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

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Badge variant="default">{categorizedPolls.active.length} Active</Badge>
            <Badge variant="secondary">{categorizedPolls.expired.length} Expired</Badge>
            <Badge variant="outline">{categorizedPolls.draft.length} Draft</Badge>
          </div>
        </div>

        {/* Active Polls */}
        {categorizedPolls.active.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              Active Polls
              <Badge className="ml-3">{categorizedPolls.active.length}</Badge>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedActivePolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  showResults={false}
                  compact={false}
                />
              ))}
            </div>
            {activePagination.paginationInfo.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={activePagination.currentPage}
                  totalPages={activePagination.paginationInfo.totalPages}
                  onPageChange={handleActivePageChange}
                  itemsPerPage={activePagination.itemsPerPage}
                  totalItems={categorizedPolls.active.length}
                  showSizeChanger={true}
                  onPageSizeChange={handleActivePageSizeChange}
                  pageSizeOptions={[6, 12, 24, 48]}
                />
              </div>
            )}
          </div>
        )}

        {/* Recent Results */}
        {categorizedPolls.expired.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              Recent Results
              <Badge variant="secondary" className="ml-3">
                {categorizedPolls.expired.length}
              </Badge>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedExpiredPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  showResults={true}
                  compact={true}
                />
              ))}
            </div>
            {expiredPagination.paginationInfo.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={expiredPagination.currentPage}
                  totalPages={expiredPagination.paginationInfo.totalPages}
                  onPageChange={expiredPagination.setCurrentPage}
                  itemsPerPage={expiredPagination.itemsPerPage}
                  totalItems={categorizedPolls.expired.length}
                  showSizeChanger={true}
                  onPageSizeChange={expiredPagination.setItemsPerPage}
                  pageSizeOptions={[6, 12, 18, 24]}
                />
              </div>
            )}
          </div>
        )}

        {/* Draft Polls */}
        {categorizedPolls.draft.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              Draft Polls
              <Badge variant="outline" className="ml-3">
                {categorizedPolls.draft.length}
              </Badge>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedDraftPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  showResults={false}
                  compact={true}
                />
              ))}
            </div>
            {draftPagination.paginationInfo.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={draftPagination.currentPage}
                  totalPages={draftPagination.paginationInfo.totalPages}
                  onPageChange={draftPagination.setCurrentPage}
                  itemsPerPage={draftPagination.itemsPerPage}
                  totalItems={categorizedPolls.draft.length}
                  showSizeChanger={true}
                  onPageSizeChange={draftPagination.setItemsPerPage}
                  pageSizeOptions={[6, 12, 18, 24]}
                />
              </div>
            )}
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
      </div>
    </div>
  );
}

export default function PollsPage() {
  return <PollsContent />;
}
