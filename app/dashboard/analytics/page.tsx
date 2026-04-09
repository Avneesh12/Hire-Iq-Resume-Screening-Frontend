"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Download, BarChart2, Loader2 } from "lucide-react";
import {
  useUploadTrends,
  useScoreDistribution,
  useSkillFrequency,
  useConversionFunnel,
} from "@/hooks/use-analytics";

const CHART_COLORS = [
  "hsl(226 100% 65%)",
  "hsl(142 71% 45%)",
  "hsl(38 92% 50%)",
  "hsl(280 65% 60%)",
  "hsl(0 84% 60%)",
];

const TooltipContent = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-lg">
      {label && <p className="text-muted-foreground font-mono mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-mono font-numeric" style={{ color: p.name === "uploads" ? "hsl(226 100% 65%)" : "hsl(142 71% 45%)" }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

function ChartShell({ title, subtitle, isLoading, isError, children }: {
  title: string;
  subtitle?: string;
  isLoading: boolean;
  isError?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="section-shell">
      <div className="section-header">
        <div>
          <p className="text-sm font-semibold font-display">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {isLoading ? (
        <div className="p-5 h-56 flex items-center justify-center">
          <Loader2 size={16} className="text-muted-foreground animate-spin" />
        </div>
      ) : isError ? (
        <div className="p-5 h-40 flex items-center justify-center text-xs text-muted-foreground">
          Failed to load data — is the backend running?
        </div>
      ) : children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [trendDays, setTrendDays] = useState(30);

  const { data: trends = [],       isLoading: loadingTrends,  isError: errorTrends }  = useUploadTrends(trendDays);
  const { data: scoreDist = [],    isLoading: loadingScore,   isError: errorScore }    = useScoreDistribution();
  const { data: skillFreq = [],    isLoading: loadingSkills,  isError: errorSkills }   = useSkillFrequency(10);
  const { data: funnel = [],       isLoading: loadingFunnel,  isError: errorFunnel }   = useConversionFunnel();

  const displayTrends = trends.slice(-trendDays);

  return (
    <div>
      <Topbar
        title="Analytics"
        description="Hiring pipeline and screening metrics"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download size={13} /> Export Report
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-5 max-w-7xl">
        <PageHeader
          title="Analytics"
          description="Understand your screening throughput, candidate quality, and pipeline health"
        />

        {/* Upload trend */}
        <div className="section-shell">
          <div className="section-header">
            <div>
              <p className="text-sm font-semibold font-display">Upload & Processing Volume</p>
              <p className="text-xs text-muted-foreground">Daily resume ingestion</p>
            </div>
            <Select value={String(trendDays)} onValueChange={(v) => setTrendDays(Number(v))}>
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loadingTrends ? (
            <div className="p-5 h-56 flex items-center justify-center">
              <Loader2 size={16} className="text-muted-foreground animate-spin" />
            </div>
          ) : errorTrends ? (
            <div className="p-5 h-56 flex items-center justify-center text-xs text-muted-foreground">
              Failed to load upload trends — is the backend running?
            </div>
          ) : trends.length === 0 ? (
            <div className="p-5 h-56 flex items-center justify-center text-xs text-muted-foreground">
              No upload data yet. Upload some resumes to see trends.
            </div>
          ) : (
            <>
              <div className="p-5 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayTrends} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(226 100% 65%)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(226 100% 65%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="hsl(142 71% 45%)" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-dm-mono)" }}
                      tickFormatter={(v: string) => v.slice(5)}
                      interval={Math.max(0, Math.floor(displayTrends.length / 7))}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-dm-mono)" }}
                    />
                    <Tooltip content={<TooltipContent />} cursor={{ stroke: "hsl(var(--border))" }} />
                    <Area type="monotone" dataKey="uploads"   stroke="hsl(226 100% 65%)" strokeWidth={1.5} fill="url(#g1)" />
                    <Area type="monotone" dataKey="processed" stroke="hsl(142 71% 45%)" strokeWidth={1.5} fill="url(#g2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="px-5 pb-4 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-px bg-primary block" />
                  <span className="text-[11px] text-muted-foreground font-mono">Uploaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-px bg-success block" />
                  <span className="text-[11px] text-muted-foreground font-mono">Processed</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Score distribution + funnel */}
        <div className="grid grid-cols-2 gap-5">
          <ChartShell title="Score Distribution" subtitle="Match score histogram" isLoading={loadingScore} isError={errorScore}>
            <div className="p-5 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDist} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="range"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-dm-mono)" }}
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
                    cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                  />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {scoreDist.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i >= 4 ? "hsl(142 71% 45%)"
                          : i >= 3 ? "hsl(226 100% 65%)"
                          : i >= 2 ? "hsl(38 92% 50%)"
                          : "hsl(var(--muted-foreground)/0.5)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartShell>

          <ChartShell title="Conversion Funnel" subtitle="Stage-by-stage drop-off" isLoading={loadingFunnel} isError={errorFunnel}>
            <div className="p-4 space-y-2">
            {funnel.map((stage, i) => {
              const baseCount = Number(funnel[0]?.count) || 0;
              const currentCount = Number(stage.count) || 0;
              const prevCount = Number(funnel[i - 1]?.count) || 0;

              const pct =
                baseCount > 0
                  ? Math.round((currentCount / baseCount) * 100)
                  : 0;

              const dropOff =
                i > 0 && prevCount > 0
                  ? Math.round(((prevCount - currentCount) / prevCount) * 100)
                  : 0;

              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted-foreground">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      {i > 0 && <span className="text-destructive/70">-{dropOff}%</span>}
                      <span className="text-foreground font-numeric">
                        {currentCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: `hsl(226 100% ${Math.max(40, 65 - i * 4)}%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            </div>
          </ChartShell>
        </div>

        {/* Skill frequency */}
        <ChartShell
          title="Top Skills Across Candidates"
          subtitle="Most frequently occurring skills in parsed resumes"
          isLoading={loadingSkills}
          isError={errorSkills}
        >
          <div className="p-5">
            <div className="space-y-2.5">
              {skillFreq.map((s, i) => (
                <div key={s.skill} className="flex items-center gap-4">
                  <span className="text-[12px] font-mono text-muted-foreground w-4 text-right">{i + 1}</span>
                  <span className="text-[13px] font-medium w-28 flex-shrink-0">{s.skill}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${s.percentage}%`, background: CHART_COLORS[i % CHART_COLORS.length], opacity: 0.8 }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground w-12 text-right font-numeric">
                    {s.percentage}%
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground w-20 text-right font-numeric">
                    {s.count.toLocaleString()} candidates
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartShell>
      </div>
    </div>
  );
}
