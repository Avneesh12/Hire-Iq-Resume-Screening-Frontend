"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssignmentStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ClipboardList, Plus, Clock, CheckCircle,
  Send, BarChart2, Code2, Brain, MessageSquare,
  Loader2, Trash2, RefreshCw,
} from "lucide-react";
import {
  useAssessments,
  useAssessmentAssignments,
  useCreateAssessment,
  useDeleteAssessment,
  useAssignAssessment,
} from "@/hooks/use-assessments";
import { useCandidates } from "@/hooks/use-candidates";
import { formatRelative, cn } from "@/lib/utils";
import type { AssessmentType } from "@/lib/types";
import { toast } from "sonner";

const TYPE_META: Record<AssessmentType, { icon: React.ReactNode; color: string; label: string }> = {
  technical:  { icon: <Code2 size={13} />,        color: "text-primary",  label: "Technical" },
  behavioral: { icon: <MessageSquare size={13} />, color: "text-warning",  label: "Behavioral" },
  cognitive:  { icon: <Brain size={13} />,         color: "text-chart-4",  label: "Cognitive" },
  coding:     { icon: <Code2 size={13} />,         color: "text-success",  label: "Coding" },
};

function AssessmentCardSkeleton() {
  return (
    <div className="section-shell animate-pulse">
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-48" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        </div>
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="flex gap-4">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-3 bg-muted rounded w-14" />
        </div>
        <div className="h-1.5 bg-muted rounded w-full" />
      </div>
    </div>
  );
}

// ── Create Assessment Dialog ────────────────────────────────────────────────

function CreateAssessmentDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateAssessment();
  const [form, setForm] = useState({
    title: "",
    type: "technical" as AssessmentType,
    description: "",
    durationMinutes: 60,
    totalQuestions: 20,
    maxScore: 100,
  });

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    try {
      await createMutation.mutateAsync(form);
      onClose();
      setForm({ title: "", type: "technical", description: "", durationMinutes: 60, totalQuestions: 20, maxScore: 100 });
    } catch {
      // error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Assessment</DialogTitle>
          <DialogDescription>
            Create a new assessment to evaluate candidates.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Python Fundamentals Test"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Type</label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as AssessmentType }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="cognitive">Cognitive</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this assessment covers…"
              className="w-full min-h-[80px] text-sm px-3 py-2 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Duration (min)</label>
              <Input
                type="number"
                min={5}
                max={480}
                value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Questions</label>
              <Input
                type="number"
                min={1}
                max={200}
                value={form.totalQuestions}
                onChange={(e) => setForm((f) => ({ ...f, totalQuestions: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Max Score</label>
              <Input
                type="number"
                min={1}
                value={form.maxScore}
                onChange={(e) => setForm((f) => ({ ...f, maxScore: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="gap-1.5"
          >
            {createMutation.isPending
              ? <><Loader2 size={13} className="animate-spin" /> Creating…</>
              : <><Plus size={13} /> Create Assessment</>
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign Assessment Dialog ────────────────────────────────────────────────

function AssignDialog({
  assessmentId,
  onClose,
}: {
  assessmentId: string;
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const assignMutation = useAssignAssessment();
  const { data, isLoading } = useCandidates({ status: ["shortlisted", "under_review"], pageSize: 50 });
  const candidates = data?.items ?? [];

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!selectedIds.size) {
      toast.error("Select at least one candidate");
      return;
    }
    try {
      await assignMutation.mutateAsync({
        assessmentId,
        candidateIds: Array.from(selectedIds),
      });
      onClose();
    } catch {
      // handled by mutation
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Assessment</DialogTitle>
          <DialogDescription>
            Select candidates to send this assessment to. Only shortlisted and under review candidates are shown.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-72 overflow-y-auto border border-border rounded-md divide-y divide-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No eligible candidates. Shortlist candidates first.
            </p>
          ) : (
            candidates.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggle(c.id)}
                  className="w-3.5 h-3.5 rounded accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.email}</p>
                </div>
                {c.score && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {Math.round(c.score.overall * 100)}%
                  </span>
                )}
              </label>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleAssign}
              disabled={assignMutation.isPending || !selectedIds.size}
              className="gap-1.5"
            >
              {assignMutation.isPending
                ? <><Loader2 size={13} className="animate-spin" /> Assigning…</>
                : <><Send size={13} /> Assign</>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AssessmentsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState<string | null>(null);

  // useAssessments now returns PaginatedResponse<Assessment>
  const { data: assessmentsPage, isLoading: loadingAssessments, isError: errorAssessments, refetch } = useAssessments();
  const assessments = assessmentsPage?.items ?? [];

  const { data: assignments = [], isLoading: loadingAssignments, isError: errorAssignments } = useAssessmentAssignments();

  const deleteMutation = useDeleteAssessment();

  return (
    <div>
      <Topbar
        title="Assessments"
        description="Manage tests and track candidate performance"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus size={13} /> New Assessment
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-5 max-w-6xl">
        <PageHeader
          title="Assessments"
          description="Create, assign, and review candidate tests"
        />

        <Tabs defaultValue="library">
          <TabsList>
            <TabsTrigger value="library">
              Library
              {!loadingAssessments && (
                <Badge variant="default" className="ml-1.5 text-[10px] h-4 px-1.5">
                  {assessments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assignments">
              Assignments
              {!loadingAssignments && (
                <Badge variant="default" className="ml-1.5 text-[10px] h-4 px-1.5">
                  {Array.isArray(assignments) ? assignments.length : 0}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Library tab */}
          <TabsContent value="library" className="mt-5">
            {errorAssessments ? (
              <EmptyState
                icon={ClipboardList}
                title="Failed to load assessments"
                description="There was an error fetching the assessment library."
                action={
                  <Button size="sm" onClick={() => refetch()} className="gap-1.5">
                    <RefreshCw size={12} /> Retry
                  </Button>
                }
              />
            ) : loadingAssessments ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <AssessmentCardSkeleton key={i} />)}
              </div>
            ) : assessments.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No assessments yet"
                description="Create your first assessment to start evaluating candidates."
                action={
                  <Button size="sm" className="gap-1" onClick={() => setCreateOpen(true)}>
                    <Plus size={13} /> New Assessment
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {assessments.map((a) => {
                  const meta = TYPE_META[a.type];
                  const completionRate = a.assignedCount
                    ? Math.round((a.completedCount / a.assignedCount) * 100)
                    : 0;

                  return (
                    <div key={a.id} className="section-shell group hover:border-primary/30 transition-colors">
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={cn("w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-muted border border-border", meta.color)}>
                              {meta.icon}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-[13px] font-semibold font-display tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {a.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn("text-[10px] font-mono", meta.color)}>{meta.label}</span>
                                <span className="text-[10px] text-muted-foreground">·</span>
                                <span className="text-[10px] text-muted-foreground font-mono capitalize">{a.status}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              if (confirm(`Delete "${a.title}"?`)) {
                                deleteMutation.mutate(a.id);
                              }
                            }}
                            title="Delete assessment"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>

                        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{a.description}</p>

                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                          <div className="flex items-center gap-1"><Clock size={11} />{a.durationMinutes} min</div>
                          <div className="flex items-center gap-1"><ClipboardList size={11} />{a.totalQuestions} questions</div>
                          <div className="flex items-center gap-1"><BarChart2 size={11} />{a.maxScore} pts</div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-muted-foreground">{a.completedCount}/{a.assignedCount} completed</span>
                            <span className="text-foreground">{completionRate}%</span>
                          </div>
                          <Progress value={completionRate} className="h-1.5" />
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7 flex-1"
                            onClick={() => setAssignOpen(a.id)}
                          >
                            <Send size={11} /> Assign to Candidates
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Assignments tab */}
          <TabsContent value="assignments" className="mt-5">
            <div className="section-shell">
              <div className="section-header">
                <span className="text-sm font-semibold font-display">All Assignments</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {loadingAssignments ? "Loading…" : `${Array.isArray(assignments) ? assignments.length : 0} total`}
                </span>
              </div>

              {errorAssignments ? (
                <EmptyState icon={Send} title="Failed to load assignments" description="There was an error fetching assignment data." />
              ) : loadingAssignments ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted rounded w-36" />
                        <div className="h-2 bg-muted rounded w-48" />
                      </div>
                      <div className="h-3 bg-muted rounded w-32 hidden md:block" />
                      <div className="h-5 bg-muted rounded w-20" />
                      <div className="h-3 bg-muted rounded w-10" />
                    </div>
                  ))}
                </div>
              ) : !Array.isArray(assignments) || assignments.length === 0 ? (
                <EmptyState icon={Send} title="No assignments yet" description="Assign assessments to shortlisted candidates from the Library tab." />
              ) : (
                <div className="divide-y divide-border">
                  <div className="flex items-center gap-4 px-5 py-3 bg-muted/30">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground flex-1">Candidate</span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground w-48 hidden md:block">Assessment</span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground w-24">Status</span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground w-16 text-right">Score</span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground w-16 text-right hidden lg:block">Sent</span>
                  </div>

                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center gap-4 px-5 py-3.5 table-row-hover">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{assignment.candidateName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{assignment.candidateEmail}</p>
                      </div>
                      <div className="w-48 hidden md:block">
                        <p className="text-[12px] text-foreground truncate">{assignment.assessmentTitle}</p>
                      </div>
                      <div className="w-24">
                        <AssignmentStatusBadge status={assignment.status} />
                      </div>
                      <div className="w-16 text-right">
                        {assignment.result ? (
                          <span className="text-[12px] font-mono font-numeric text-success">
                            {assignment.result.score}/{assignment.result.maxScore}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-mono">—</span>
                        )}
                      </div>
                      <div className="w-16 text-right hidden lg:block">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatRelative(assignment.sentAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateAssessmentDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {assignOpen && (
        <AssignDialog assessmentId={assignOpen} onClose={() => setAssignOpen(null)} />
      )}
    </div>
  );
}
