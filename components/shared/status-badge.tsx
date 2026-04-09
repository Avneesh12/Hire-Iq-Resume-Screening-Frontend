import { cn } from "@/lib/utils";
import {
  CANDIDATE_STATUS_COLORS,
  CANDIDATE_STATUS_LABELS,
  UPLOAD_STATUS_COLORS,
  UPLOAD_STATUS_LABELS,
  ASSIGNMENT_STATUS_LABELS,
} from "@/lib/utils";
import type { CandidateStatus, UploadStatus, AssignmentStatus } from "@/lib/types";

interface CandidateStatusBadgeProps {
  status: CandidateStatus;
  className?: string;
}

export function CandidateStatusBadge({ status, className }: CandidateStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded border",
        CANDIDATE_STATUS_COLORS[status],
        className
      )}
    >
      {CANDIDATE_STATUS_LABELS[status]}
    </span>
  );
}

interface UploadStatusBadgeProps {
  status: UploadStatus;
  className?: string;
}

export function UploadStatusBadge({ status, className }: UploadStatusBadgeProps) {
  return (
    <span className={cn(UPLOAD_STATUS_COLORS[status], "inline-flex items-center gap-1", className)}>
      {status === "processing" && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
      )}
      {UPLOAD_STATUS_LABELS[status]}
    </span>
  );
}

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
  className?: string;
}

const ASSIGNMENT_COLORS: Record<AssignmentStatus, string> = {
  sent: "bg-muted text-muted-foreground border-border",
  opened: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-warning/10 text-warning border-warning/20",
  submitted: "bg-success/10 text-success border-success/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AssignmentStatusBadge({ status, className }: AssignmentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded border",
        ASSIGNMENT_COLORS[status],
        className
      )}
    >
      {ASSIGNMENT_STATUS_LABELS[status]}
    </span>
  );
}

interface ScoreBadgeProps {
  score: number; // 0–1
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const pct = Math.round(score );
  const cls =
    score >= 75 ? "score-high" : score >= 50 ? "score-mid" : "score-low";
  return (
    <span className={cn(cls, "font-numeric", className)}>{pct}%</span>
  );
}
