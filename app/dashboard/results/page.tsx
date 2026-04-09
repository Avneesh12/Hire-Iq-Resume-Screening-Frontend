"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScoreBadge, CandidateStatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Trophy, Download, ChevronRight, Sparkles,
  CheckCircle2, AlertTriangle, ThumbsUp, ThumbsDown, Users, Loader2,
} from "lucide-react";
import { useCandidates } from "@/hooks/use-candidates";
import { useJobs } from "@/hooks/use-jobs";
import { ROUTES } from "@/lib/constants";
import { initials, cn } from "@/lib/utils";

type SortMode = "score" | "name" | "recommendation";

const RECOMMENDATION_ORDER = { strong_hire: 0, hire: 1, maybe: 2, no_hire: 3 } as const;

function RankListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
          <div className="w-5 h-3 bg-muted rounded" />
          <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-muted rounded w-32" />
            <div className="h-2 bg-muted rounded w-24" />
          </div>
          <div className="h-5 w-12 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

function DetailPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="section-shell animate-pulse">
        <div className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-40" />
            <div className="h-3 bg-muted rounded w-56" />
          </div>
        </div>
      </div>
      <div className="section-shell animate-pulse p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 bg-muted rounded w-28" />
            <div className="flex-1 h-1.5 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [jobFilter, setJobFilter] = useState("all");
  const [sortMode, setSortMode]   = useState<SortMode>("score");
  const [selected, setSelected]   = useState<string | null>(null);

  const { data: candidatesData, isLoading: loadingCandidates, isError: errorCandidates } = useCandidates({
    sortBy: sortMode === "name" ? "name" : "score",
    sortOrder: "desc",
    jobId: jobFilter !== "all" ? jobFilter : undefined,
    pageSize: 100,
  });
  const { data: jobsData, isLoading: loadingJobs } = useJobs();

  const allCandidates = candidatesData?.items ?? [];
  const allJobs = jobsData?.items ?? [];

  const filtered = useMemo(() => {
    // Only show candidates the ML model has scored
    const scored = allCandidates.filter((c) => c.score);
    // recommendation order must be done client-side
    if (sortMode === "recommendation") {
      return [...scored].sort((a, b) =>
        RECOMMENDATION_ORDER[a.score!.recommendation] - RECOMMENDATION_ORDER[b.score!.recommendation]
      );
    }
    return scored;
  }, [allCandidates, sortMode]);

  const selectedCandidate = filtered.find((c) => c.id === selected) ?? filtered[0];

  return (
    <div>
      <Topbar
        title="Results"
        description="Ranked candidate evaluation results"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download size={13} /> Export Rankings
          </Button>
        }
      />

      <div className="px-6 py-6 max-w-7xl space-y-5">
        <PageHeader
          title="Evaluation Results"
          description="AI-scored candidates ranked by match quality"
        />

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={jobFilter} onValueChange={setJobFilter} disabled={loadingJobs}>
            <SelectTrigger className="w-52 h-8 text-xs">
              <SelectValue placeholder="All jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All jobs</SelectItem>
              {allJobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Sort by Score</SelectItem>
              <SelectItem value="recommendation">Sort by Recommendation</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground font-mono ml-auto">
            {loadingCandidates ? "Loading…" : `${filtered.length} candidates scored`}
          </span>
        </div>

        {errorCandidates ? (
          <EmptyState icon={Users} title="Failed to load results" description="There was an error fetching candidate results." />
        ) : (
          <div className="grid grid-cols-5 gap-5">
            {/* Rankings list */}
            <div className="col-span-2 section-shell">
              <div className="section-header">
                <div className="flex items-center gap-1.5">
                  <Trophy size={13} className="text-warning" />
                  <span className="text-sm font-semibold font-display">Rankings</span>
                </div>
              </div>
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {loadingCandidates ? (
                  <RankListSkeleton />
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No scored candidates yet
                  </div>
                ) : (
                  filtered.map((c, rank) => {
                    const isSelected = (selected ?? filtered[0]?.id) === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelected(c.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors",
                          isSelected
                            ? "bg-primary/[0.08] border-l-2 border-primary"
                            : "hover:bg-muted/50 border-l-2 border-transparent"
                        )}
                      >
                        <span className={cn("text-[11px] font-mono w-5 text-center flex-shrink-0", rank === 0 ? "text-warning font-semibold" : "text-muted-foreground")}>
                          {rank + 1}
                        </span>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold font-display flex-shrink-0"
                          style={{ background: "hsl(226 100% 65% / 0.1)", color: "hsl(226 100% 65%)", border: "1px solid hsl(226 100% 65% / 0.2)" }}
                        >
                          {initials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{c.appliedJobTitle}</p>
                        </div>
                        <ScoreBadge score={c.score!.overall} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Detail panel */}
            <div className="col-span-3">
              {loadingCandidates ? (
                <DetailPanelSkeleton />
              ) : selectedCandidate ? (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="section-shell">
                    <div className="p-5 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold font-display flex-shrink-0"
                          style={{ background: "hsl(226 100% 65% / 0.12)", color: "hsl(226 100% 65%)", border: "2px solid hsl(226 100% 65% / 0.25)" }}
                        >
                          {initials(selectedCandidate.name)}
                        </div>
                        <div>
                          <h2 className="text-base font-semibold font-display tracking-tight">{selectedCandidate.name}</h2>
                          <p className="text-xs text-muted-foreground">{selectedCandidate.appliedJobTitle} · {selectedCandidate.location}</p>
                          <div className="mt-1.5">
                            <CandidateStatusBadge status={selectedCandidate.status} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <ScoreBadge score={selectedCandidate.score!.overall} className="text-base" />
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {Math.round(selectedCandidate.score!.confidence * 100)}% confidence
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="section-shell">
                    <div className="section-header">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-primary" />
                        <span className="text-sm font-semibold font-display">Score Breakdown</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        Predicted: {selectedCandidate.score!.predictedRole}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      {Object.entries(selectedCandidate.score!.breakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-4">
                          <span className="text-[12px] text-muted-foreground capitalize w-32 flex-shrink-0">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <div className="flex-1">
                            <Progress
                              value={val}
                              indicatorClassName={val >= 75 ? "bg-success" : val >= 75 ? "bg-warning" : "bg-destructive"}
                            />
                          </div>
                          <span className="text-[12px] font-mono font-numeric w-10 text-right">
                            {Math.round(val)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="section-shell">
                    <div className="section-header">
                      <span className="text-sm font-semibold font-display">AI Analysis</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        {selectedCandidate.score!.aiExplanation}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <CheckCircle2 size={12} className="text-success" />
                            <span className="text-[11px] font-semibold text-success">Strengths</span>
                          </div>
                          <ul className="space-y-1.5">
                            {selectedCandidate.score!.strengths.map((s) => (
                              <li key={s} className="flex items-start gap-2 text-[12px] text-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <AlertTriangle size={12} className="text-warning" />
                            <span className="text-[11px] font-semibold text-warning">Concerns</span>
                          </div>
                          <ul className="space-y-1.5">
                            {selectedCandidate.score!.concerns.map((c) => (
                              <li key={c} className="flex items-start gap-2 text-[12px] text-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Recommendation</span>
                          <span className={cn(
                            "text-sm font-semibold font-display",
                            (selectedCandidate.score!.recommendation === "strong_hire" || selectedCandidate.score!.recommendation === "hire") && "text-success",
                            selectedCandidate.score!.recommendation === "maybe" && "text-warning",
                            selectedCandidate.score!.recommendation === "no_hire" && "text-destructive",
                          )}>
                            {selectedCandidate.score!.recommendation.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 h-8">
                            <ThumbsDown size={12} /> Reject
                          </Button>
                          <Button size="sm" className="gap-1.5 bg-success hover:bg-success/90 h-8">
                            <ThumbsUp size={12} /> Shortlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href={ROUTES.candidate(selectedCandidate.id)}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      View Full Profile <ChevronRight size={13} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="section-shell p-12 flex items-center justify-center text-sm text-muted-foreground">
                  Select a candidate to view their evaluation
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
