import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CandidateStatus, UploadStatus, AssignmentStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDateShort(iso);
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function scoreClass(score: number): string {
  if (score >= 0.75) return "score-high";
  if (score >= 0.5) return "score-mid";
  return "score-low";
}

export function scoreLabel(score: number): string {
  if (score >= 0.85) return "Excellent";
  if (score >= 0.75) return "Strong";
  if (score >= 0.6) return "Good";
  if (score >= 0.5) return "Fair";
  return "Weak";
}

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  new: "New",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  assessment_sent: "Assessment Sent",
  assessment_complete: "Assessment Done",
  interviewing: "Interviewing",
  offered: "Offer Sent",
  rejected: "Rejected",
  hired: "Hired",
};

export const CANDIDATE_STATUS_COLORS: Record<CandidateStatus, string> = {
  new: "bg-muted text-muted-foreground border-border",
  under_review: "bg-primary/10 text-primary border-primary/20",
  shortlisted: "bg-success/10 text-success border-success/20",
  assessment_sent: "bg-warning/10 text-warning border-warning/20",
  assessment_complete: "bg-warning/10 text-warning border-warning/20",
  interviewing: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  offered: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  hired: "bg-success/10 text-success border-success/20",
};

export const UPLOAD_STATUS_LABELS: Record<UploadStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  parsed: "Parsed",
  scored: "Scored",
  failed: "Failed",
};

export const UPLOAD_STATUS_COLORS: Record<UploadStatus, string> = {
  pending: "badge-pending",
  processing: "badge-processing",
  parsed: "badge-processing",
  scored: "badge-complete",
  failed: "badge-failed",
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  sent: "Sent",
  opened: "Opened",
  in_progress: "In Progress",
  submitted: "Submitted",
  expired: "Expired",
};

export function truncate(str: string, length = 50): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
