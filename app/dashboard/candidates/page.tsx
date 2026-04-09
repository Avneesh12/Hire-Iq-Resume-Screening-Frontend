"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CandidateStatusBadge, ScoreBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Search, Upload, Users, ArrowUpDown, ChevronRight, X, RefreshCw,
} from "lucide-react";
import { useCandidates, useUpdateCandidateStatus, useBulkUpdateStatus } from "@/hooks/use-candidates";
import { ROUTES } from "@/lib/constants";
import { initials, formatRelative, CANDIDATE_STATUS_LABELS } from "@/lib/utils";
import type { CandidateStatus, CandidateFilters } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";

const STATUS_OPTIONS: CandidateStatus[] = [
  "new", "under_review", "shortlisted", "assessment_sent",
  "assessment_complete", "interviewing", "offered", "rejected", "hired",
];

export default function CandidatesPage() {
  // All filter state feeds directly into the API call — no client-side filtering
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "name" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const qc = useQueryClient();

  const filters: CandidateFilters = {
    search: search || undefined,
    status: statusFilter !== "all" ? [statusFilter as CandidateStatus] : undefined,
    sortBy,
    sortOrder,
    page,
    pageSize: 25,
  };

  const { data, isLoading, isError, refetch } = useCandidates(filters);
  const bulkMutation = useBulkUpdateStatus();

  const candidates = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.id)));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
    setSelectedIds(new Set());
  };

  const toggleSort = () => {
    if (sortBy === "score") {
      setSortBy("createdAt");
    } else {
      setSortBy("score");
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleBulkStatus = (status: CandidateStatus) => {
    if (!selectedIds.size) return;
    bulkMutation.mutate(
      { ids: Array.from(selectedIds), status },
      { onSuccess: () => setSelectedIds(new Set()) }
    );
  };

  const hasFilters = search || statusFilter !== "all" || sortBy !== "createdAt";

  return (
    <div>
      <Topbar
        title="Candidates"
        description={`${total} candidate${total !== 1 ? "s" : ""}`}
        actions={
          <Link href={ROUTES.uploads}>
            <Button size="sm" className="gap-1.5">
              <Upload size={13} /> Upload Resumes
            </Button>
          </Link>
        }
      />

      <div className="px-6 py-6 space-y-5 max-w-7xl">
        <PageHeader title="Candidates" description="Review, filter, and manage your candidate pipeline" />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, email, role…"
              className="pl-8 h-8 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{CANDIDATE_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as typeof sortBy); setPage(1); }}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest first</SelectItem>
              <SelectItem value="score">Highest score</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 gap-1.5 text-xs"
            disabled={isLoading}
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          </Button>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-xs text-muted-foreground">
              <X size={12} /> Clear
            </Button>
          )}
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-primary/20 bg-primary/5 text-sm">
            <span className="text-xs font-medium text-primary">{selectedIds.size} selected</span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">Move to:</span>
              {(["shortlisted", "under_review", "rejected"] as CandidateStatus[]).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2"
                  onClick={() => handleBulkStatus(s)}
                  disabled={bulkMutation.isPending}
                >
                  {CANDIDATE_STATUS_LABELS[s]}
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => setSelectedIds(new Set())}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="section-shell">
          {/* Header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border">
            <input
              type="checkbox"
              checked={selectedIds.size === candidates.length && candidates.length > 0}
              onChange={toggleAll}
              className="w-3.5 h-3.5 rounded border-border accent-primary"
            />
            <span className="text-[11px] text-muted-foreground font-mono flex-1">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : `${total} candidate${total !== 1 ? "s" : ""}`}
            </span>
            <button
              onClick={toggleSort}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown size={11} /> {sortBy === "score" ? "By score" : "By date"}
            </button>
          </div>

          {/* Rows */}
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse border-b border-border last:border-0">
                <div className="w-3.5 h-3.5 rounded bg-muted" />
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-36" />
                  <div className="h-2 bg-muted rounded w-52" />
                </div>
                <div className="h-5 w-20 bg-muted rounded" />
                <div className="h-5 w-12 bg-muted rounded" />
              </div>
            ))
          ) : isError ? (
            <EmptyState
              icon={Users}
              title="Failed to load candidates"
              description="There was an error fetching candidates from the server."
              action={
                <Button size="sm" onClick={() => refetch()} className="gap-1.5">
                  <RefreshCw size={12} /> Retry
                </Button>
              }
            />
          ) : candidates.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No candidates found"
              description={hasFilters ? "Try adjusting your filters." : "Upload resumes to get started."}
              action={
                !hasFilters ? (
                  <Link href={ROUTES.uploads}>
                    <Button size="sm" className="gap-1.5"><Upload size={13} /> Upload Resumes</Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
                )
              }
            />
          ) : (
            candidates.map((c) => (
              <Link
                key={c.id}
                href={ROUTES.candidate(c.id)}
                className="flex items-center gap-4 px-5 py-3.5 table-row-hover border-b border-border last:border-0"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName === "INPUT") e.preventDefault();
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggleSelect(c.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-3.5 h-3.5 rounded border-border accent-primary"
                />
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold font-display"
                  style={{
                    background: "hsl(226 100% 65% / 0.1)",
                    color: "hsl(226 100% 65%)",
                    border: "1px solid hsl(226 100% 65% / 0.2)",
                  }}
                >
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.appliedJobTitle ?? "No job associated"} · {c.location ?? "Location unknown"}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                  {(c.tags ?? []).slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
                <CandidateStatusBadge status={c.status} />
                {c.score && <ScoreBadge score={c.score.overall} />}
                <span className="text-[11px] text-muted-foreground font-mono w-16 text-right flex-shrink-0">
                  {formatRelative(c.createdAt)}
                </span>
                <ChevronRight size={13} className="text-muted-foreground flex-shrink-0" />
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
