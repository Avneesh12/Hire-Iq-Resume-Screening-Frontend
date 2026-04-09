"use client";

import { use } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CandidateStatusBadge, ScoreBadge } from "@/components/shared/status-badge";
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Star, AlertTriangle, CheckCircle2, MessageSquare, Award,
  Sparkles, ThumbsUp, ThumbsDown, ClipboardList, ChevronRight, Loader2, Send,
} from "lucide-react";
import { useCandidate, useUpdateCandidateStatus, useAddNote } from "@/hooks/use-candidates";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatRelative, initials } from "@/lib/utils";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CANDIDATE_STATUS_LABELS } from "@/lib/utils";
import type { CandidateStatus } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

function CandidateDetailSkeleton() {
  return (
    <div className="px-6 py-6 max-w-7xl animate-pulse">
      <div className="h-4 bg-muted rounded w-32 mb-5" />
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-1 space-y-4">
          <div className="section-shell p-5 space-y-3">
            <div className="w-14 h-14 rounded-full bg-muted mx-auto" />
            <div className="h-4 bg-muted rounded w-32 mx-auto" />
            <div className="h-3 bg-muted rounded w-48 mx-auto" />
            <div className="h-5 bg-muted rounded w-20 mx-auto" />
          </div>
        </div>
        <div className="col-span-2 space-y-4">
          <div className="section-shell p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-3 bg-muted rounded w-28" />
                <div className="flex-1 h-1.5 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: candidate, isLoading, isError } = useCandidate(id);
  const updateStatus = useUpdateCandidateStatus();
  const addNote = useAddNote();
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await addNote.mutateAsync({ id, content: noteText.trim() });
      setNoteText("");
    } catch {
      // handled by mutation
    } finally {
      setSavingNote(false);
    }
  };

  const STATUS_OPTIONS: CandidateStatus[] = [
    "new", "under_review", "shortlisted", "assessment_sent",
    "assessment_complete", "interviewing", "offered", "rejected", "hired",
  ];

  if (isLoading) {
    return (
      <div>
        <Topbar title="Loading…" description="Candidate detail" />
        <CandidateDetailSkeleton />
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div>
        <Topbar title="Candidate not found" />
        <div className="px-6 py-6">
          <Link href={ROUTES.candidates} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors">
            <ArrowLeft size={13} /> Back to candidates
          </Link>
          <div className="section-shell p-12 text-center">
            <p className="text-sm text-muted-foreground">
              This candidate could not be found.
            </p>
            <Link href={ROUTES.candidates}>
              <Button variant="outline" size="sm" className="mt-4">Back to Candidates</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { score, parsedResume: resume } = candidate;

  console.log("Candidate data:", score?.overall);

  return (
    <div>
      <Topbar
        title={candidate.name}
        description={candidate.appliedJobTitle ?? "Candidate detail"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => updateStatus.mutate({ id: candidate.id, status: "rejected" })}
              disabled={updateStatus.isPending}
            >
              <ThumbsDown size={13} /> Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <ClipboardList size={13} /> Send Assessment
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-success hover:bg-success/90"
              onClick={() => updateStatus.mutate({ id: candidate.id, status: "shortlisted" })}
              disabled={updateStatus.isPending}
            >
              <ThumbsUp size={13} /> Shortlist
            </Button>
          </div>
        }
      />

      <div className="px-6 py-6 max-w-7xl">
        <Link
          href={ROUTES.candidates}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft size={13} /> Back to candidates
        </Link>

        <div className="grid grid-cols-3 gap-5">
          {/* Left: identity + contact */}
          <div className="col-span-1 space-y-4">
            <div className="section-shell">
              <div className="p-5 flex flex-col items-center text-center border-b border-border">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-display mb-3"
                  style={{
                    background: "hsl(226 100% 65% / 0.12)",
                    color: "hsl(226 100% 65%)",
                    border: "2px solid hsl(226 100% 65% / 0.25)",
                  }}
                >
                  {initials(candidate.name)}
                </div>
                <h2 className="text-base font-semibold font-display tracking-tight">{candidate.name}</h2>
                {resume.summary && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">{resume.summary}</p>
                )}
                <div className="mt-3">
                  <Select
                    value={candidate.status}
                    onValueChange={(v) =>
                      updateStatus.mutate({ id: candidate.id, status: v as CandidateStatus })
                    }
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="h-7 text-xs w-44">
                      <SelectValue>
                        <CandidateStatusBadge status={candidate.status} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {CANDIDATE_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updateStatus.isPending && (
                    <span className="text-[11px] text-muted-foreground font-mono mt-1 flex items-center gap-1">
                      <Loader2 size={10} className="animate-spin" /> Updating…
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                {[
                  { icon: Mail,     value: candidate.email },
                  { icon: Phone,    value: candidate.phone },
                  { icon: MapPin,   value: candidate.location },
                  { icon: Briefcase, value: candidate.appliedJobTitle },
                ].filter((r) => r.value).map(({ icon: Icon, value }) => (
                  <div key={value} className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
                    <Icon size={12} className="flex-shrink-0" />
                    <span className="truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {candidate.tags.length > 0 && (
              <div className="section-shell p-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Score summary */}
            {score && (
              <div className="section-shell p-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2.5">Match Score</p>
                <div className="flex items-center justify-between mb-3">
                  <ScoreBadge score={score.overall} />
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {Math.round(score.confidence * 100)}% confidence
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(score.breakdown).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-[10px] font-mono mb-0.5">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span>{Math.round(val)}%</span>
                      </div>
                      <Progress
                        value={val}
                        className="h-1"
                        indicatorClassName={val >= 75 ? "bg-success" : val >= 50 ? "bg-warning" : "bg-destructive"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: tabs */}
          <div className="col-span-2">
            <Tabs defaultValue="resume">
              <TabsList>
                <TabsTrigger value="resume">Resume</TabsTrigger>
                {score && <TabsTrigger value="evaluation">AI Evaluation</TabsTrigger>}
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* Resume tab */}
              <TabsContent value="resume" className="mt-5 space-y-4">
                {/* Experience */}
                {resume.experience?.length > 0 && (
                  <div className="section-shell">
                    <div className="section-header">
                      <div className="flex items-center gap-2">
                        <Briefcase size={13} className="text-muted-foreground" />
                        <span className="text-sm font-semibold font-display">Experience</span>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {resume.experience.map((exp, i) => (
                        <div key={i} className="px-5 py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[13px] font-semibold text-foreground">{exp.title}</p>
                              <p className="text-[12px] text-muted-foreground">{exp.company}</p>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono flex-shrink-0 ml-4">
                              {exp.startDate} — {exp.endDate ?? "Present"}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resume.education?.length > 0 && (
                  <div className="section-shell">
                    <div className="section-header">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={13} className="text-muted-foreground" />
                        <span className="text-sm font-semibold font-display">Education</span>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {resume.education.map((edu, i) => (
                        <div key={i} className="px-5 py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[13px] font-semibold text-foreground">{edu.degree} in {edu.field}</p>
                              <p className="text-[12px] text-muted-foreground">{edu.institution}</p>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono flex-shrink-0 ml-4">
                              {edu.endYear || edu.startYear || "In Progress"}
                            </span>
                          </div>
                          {edu.gpa && (
                            <p className="text-[11px] text-muted-foreground mt-1 font-mono">GPA: {edu.gpa}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resume.skills?.length > 0 && (
                  <div className="section-shell p-5">
                    <p className="text-sm font-semibold font-display mb-3">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.skills.map((skill) => (
                        <span key={skill} className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Evaluation tab */}
              {score && (
                <TabsContent value="evaluation" className="mt-5 space-y-4">
                  <div className="section-shell p-5 space-y-4">
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{score.aiExplanation}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <CheckCircle2 size={12} className="text-success" />
                          <span className="text-[11px] font-semibold text-success">Strengths</span>
                        </div>
                        <ul className="space-y-1.5">
                          {score.strengths.map((s) => (
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
                          {score.concerns.map((c) => (
                            <li key={c} className="flex items-start gap-2 text-[12px] text-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">
                        Recommendation
                      </span>
                      <span className="text-sm font-semibold font-display">
                        {score.recommendation.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Notes tab */}
              <TabsContent value="notes" className="mt-5 space-y-4">
                {/* Add note form */}
                <div className="section-shell">
                  <div className="p-5 space-y-3">
                    <label className="text-xs font-medium text-foreground">Add recruiter note</label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write a note about this candidate…"
                      className="w-full min-h-[80px] text-sm px-3 py-2 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote();
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-mono">Cmd+Enter to save</span>
                      <Button
                        size="sm"
                        onClick={handleAddNote}
                        disabled={savingNote || !noteText.trim()}
                        className="gap-1.5 h-7 text-xs"
                      >
                        {savingNote
                          ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                          : <><Send size={12} /> Add Note</>
                        }
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Existing notes */}
                <div className="section-shell">
                  {candidate.recruiterNotes && candidate.recruiterNotes.length > 0 ? (
                    <div className="divide-y divide-border">
                      {candidate.recruiterNotes.map((note) => (
                        <div key={note.id} className="px-5 py-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-medium text-foreground">{note.authorName}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{formatRelative(note.createdAt)}</span>
                          </div>
                          <p className="text-[13px] text-muted-foreground leading-relaxed">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare size={20} className="text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No notes yet — add one above</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
