"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCardSkeleton } from "@/components/shared/skeleton";
import { Button } from "@/components/ui/button";
import { ScoreBadge, CandidateStatusBadge } from "@/components/shared/status-badge";
import {
  Users, Upload, CheckCircle, TrendingUp, Loader2, ArrowRight,
  FileText, RefreshCw, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { ROUTES } from "@/lib/constants";
import { useDashboardMetrics, useUploadTrends, useConversionFunnel } from "@/hooks/use-analytics";
import { useCandidates } from "@/hooks/use-candidates";
import { formatRelative, initials } from "@/lib/utils";

function MetricsSection() {
  const { data: metrics, isLoading, isError, refetch } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-sm">
        <AlertCircle size={15} className="text-destructive flex-shrink-0" />
        <span className="text-muted-foreground flex-1">
          Could not load dashboard metrics. Is the backend running at{" "}
          <code className="font-mono text-xs bg-muted px-1 rounded">
            {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
          </code>
          ?
        </span>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 h-7 text-xs">
          <RefreshCw size={11} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Candidates"
          value={metrics.totalCandidates.toLocaleString()}
          change={metrics.weeklyChange.candidates}
          changeLabel="vs last week"
          icon={Users}
        />
        <StatCard
          label="Resumes Processed"
          value={metrics.resumesProcessed.toLocaleString()}
          change={metrics.weeklyChange.processed}
          changeLabel="vs last week"
          icon={FileText}
        />
        <StatCard
          label="Shortlisted"
          value={metrics.shortlisted}
          change={metrics.weeklyChange.shortlisted}
          changeLabel="vs last week"
          icon={CheckCircle}
          iconColor="hsl(var(--success))"
        />
        <StatCard
          label="Avg. Match Score"
          value={`${Math.round(metrics.averageScore )}%`}
          icon={TrendingUp}
          iconColor="hsl(var(--warning))"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="stat-label">Pending Review</span>
          <div className="flex items-end gap-2">
            <span className="stat-value">{metrics.pendingReview}</span>
            <span className="text-xs text-warning font-mono mb-1">action required</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Processing Queue</span>
          <div className="flex items-end gap-2">
            <span className="stat-value">{metrics.processingQueue}</span>
            {metrics.processingQueue > 0 && (
              <Loader2 size={14} className="text-primary animate-spin mb-1.5" />
            )}
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Today's Uploads</span>
          <div className="flex items-end gap-2">
            <span className="stat-value">{metrics.todayUploads}</span>
            <span className="text-xs text-success font-mono mb-1">resumes</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ChartsSection() {
  const { data: trends = [], isLoading: trendsLoading, isError: trendsError } = useUploadTrends(14);
  const { data: funnel = [], isLoading: funnelLoading, isError: funnelError } = useConversionFunnel();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="section-shell col-span-2">
        <div className="section-header">
          <span className="text-sm font-semibold font-display">Upload Volume</span>
          <span className="text-xs text-muted-foreground font-mono">Last 14 days</span>
        </div>
        <div className="p-5 h-48">
          {trendsLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 size={16} className="text-muted-foreground animate-spin" />
            </div>
          ) : trendsError || trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              {trendsError ? "Failed to load upload trends" : "No upload data yet"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(226 100% 65%)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(226 100% 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-dm-mono)" }}
                  tickFormatter={(v) => v.slice(5)}
                  interval={2}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-dm-mono)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: "var(--font-dm-mono)",
                  }}
                  cursor={{ stroke: "hsl(var(--border))" }}
                />
                <Area type="monotone" dataKey="uploads" stroke="hsl(226 100% 65%)" strokeWidth={1.5} fill="url(#uploadGrad)" />
                <Area type="monotone" dataKey="processed" stroke="hsl(var(--success))" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="section-shell">
        <div className="section-header">
          <span className="text-sm font-semibold font-display">Pipeline</span>
          <span className="text-xs text-muted-foreground font-mono">Conversion</span>
        </div>
        <div className="p-4 space-y-2">
          {funnelLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="text-muted-foreground animate-spin" />
            </div>
          ) : funnelError || funnel.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              {funnelError ? "Failed to load pipeline data" : "No pipeline data yet"}
            </p>
          ) : (
            funnel.slice(0, 6).map((stage, i) => {
              const pct = Math.round((stage.count / (funnel[0]?.count || 1)) * 100);
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground font-mono">{stage.stage}</span>
                    <span className="text-[11px] font-mono text-foreground font-numeric">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: `hsl(226 100% ${65 - i * 5}%)` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function RecentCandidatesSection() {
  const { data, isLoading, isError } = useCandidates({ page: 1, pageSize: 5, sortBy: "createdAt", sortOrder: "desc" });
  const candidates = data?.items ?? [];

  return (
    <div className="section-shell">
      <div className="section-header">
        <span className="text-sm font-semibold font-display">Recent Candidates</span>
        <Link href={ROUTES.candidates}>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground text-xs h-7">
            View all <ArrowRight size={12} />
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-32" />
                  <div className="h-2 bg-muted rounded w-48" />
                </div>
              </div>
            ))
          : isError ? (
            <p className="text-xs text-muted-foreground px-5 py-4">
              Failed to load recent candidates.
            </p>
          ) : candidates.length === 0 ? (
            <p className="text-xs text-muted-foreground px-5 py-4">
              No candidates yet. <Link href={ROUTES.uploads} className="text-primary hover:underline">Upload resumes</Link> to get started.
            </p>
          ) : (
            candidates.map((c) => (
              <Link
                key={c.id}
                href={ROUTES.candidate(c.id)}
                className="flex items-center gap-4 px-5 py-3.5 table-row-hover"
              >
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
                    {c.appliedJobTitle ?? "No job"} · {c.location ?? "Unknown"}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                  {(c.tags ?? []).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <CandidateStatusBadge status={c.status} />
                {c.score && <ScoreBadge score={c.score.overall} />}
                <span className="text-[11px] text-muted-foreground font-mono w-16 text-right flex-shrink-0">
                  {formatRelative(c.createdAt)}
                </span>
              </Link>
            ))
          )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <Topbar
        title="Dashboard"
        description="Resume screening overview"
        actions={
          <Link href={ROUTES.uploads}>
            <Button size="sm" className="gap-1.5">
              <Upload size={13} />
              Upload Resumes
            </Button>
          </Link>
        }
      />
      <div className="px-6 py-6 space-y-6 max-w-7xl">
        <PageHeader title="Overview" description="Your hiring pipeline at a glance" />
        <MetricsSection />
        <ChartsSection />
        <RecentCandidatesSection />
      </div>
    </div>
  );
}
