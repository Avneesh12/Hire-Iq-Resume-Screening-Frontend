"use client";

import { useState, useMemo, useEffect } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Briefcase, Plus, Search, Users, ChevronRight,
  MapPin, Clock, Building2, X, Loader2,
  DollarSign, Calendar, User,
} from "lucide-react";
import { useJobs, useCreateJob } from "@/hooks/use-jobs";
import { formatDate, cn } from "@/lib/utils";
import type { JobStatus, JobOpening } from "@/lib/types";

const STATUS_COLORS: Record<JobStatus, string> = {
  active:  "bg-success/10 text-success border-success/20",
  paused:  "bg-warning/10 text-warning border-warning/20",
  draft:   "bg-muted text-muted-foreground border-border",
  closed:  "bg-destructive/10 text-destructive border-destructive/20",
};

const TYPE_LABELS: Record<string, string> = {
  full_time:  "Full-time",
  part_time:  "Part-time",
  contract:   "Contract",
  internship: "Internship",
};

function JobCardSkeleton() {
  return (
    <div className="section-shell animate-pulse">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-3 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-20" />
        </div>
        <div className="flex gap-1.5">
          {[40, 56, 48, 36].map((w, i) => (
            <div key={i} className="h-5 bg-muted rounded" style={{ width: w }} />
          ))}
        </div>
        <div className="pt-3 border-t border-border flex items-center gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-5 bg-muted rounded w-8" />
              <div className="h-2 bg-muted rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateJobForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "full_time" as const,
    description: "",
    status: "active" as const,
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    minExperienceYears: 0,
    maxExperienceYears: undefined as number | undefined,
    salaryMin: undefined as number | undefined,
    salaryMax: undefined as number | undefined,
    currency: "INR",
  });

  const [skillInput, setSkillInput] = useState("");
  const [isRequired, setIsRequired] = useState(true);

  const createJobMutation = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJobMutation.mutateAsync(formData);
      onSuccess();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const skill = skillInput.trim();
    if (isRequired) {
      if (!formData.requiredSkills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          requiredSkills: [...prev.requiredSkills, skill]
        }));
      }
    } else {
      if (!formData.preferredSkills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          preferredSkills: [...prev.preferredSkills, skill]
        }));
      }
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string, isRequiredSkill: boolean) => {
    if (isRequiredSkill) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: prev.requiredSkills.filter(s => s !== skill)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredSkills: prev.preferredSkills.filter(s => s !== skill)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* SECTION: Basic Information */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Basic Information</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium">Job Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Senior Software Engineer"
              className="h-8 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Department *</label>
            <Input
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              placeholder="e.g. Engineering"
              className="h-8 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Location *</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Bengaluru, India"
              className="h-8 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Job Type</label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SECTION: Experience & Salary */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Experience & Salary</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Min Experience (years)</label>
              <Input
                type="number"
                value={formData.minExperienceYears}
                onChange={(e) => setFormData(prev => ({ ...prev, minExperienceYears: parseInt(e.target.value) || 0 }))}
                className="h-8 text-sm"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Max Experience (years)</label>
              <Input
                type="number"
                value={formData.maxExperienceYears || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, maxExperienceYears: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="h-8 text-sm"
                min="0"
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium">Min Salary</label>
              <Input
                type="number"
                value={formData.salaryMin || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="h-8 text-sm"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Max Salary</label>
              <Input
                type="number"
                value={formData.salaryMax || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="h-8 text-sm"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Currency</label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Description */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Details</h4>
        <div className="space-y-2">
          <label className="text-xs font-medium">Job Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the role, responsibilities, and requirements..."
            className="w-full h-20 px-3 py-2 text-xs border border-border rounded-md resize-none bg-background"
            required
          />
        </div>
      </div>

      {/* SECTION: Skills */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Required Skills</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill..."
              className="h-8 text-sm flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} size="sm" className="h-8 px-3">Add</Button>
          </div>

          {/* Required Skills Display */}
          {formData.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-red-50 border border-red-200 rounded">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded bg-red-100 border border-red-300 text-red-700"
                >
                  {skill}
                  <X
                    size={12}
                    className="cursor-pointer hover:text-red-900"
                    onClick={() => removeSkill(skill, true)}
                  />
                </span>
              ))}
            </div>
          )}

          {/* Preferred Skills */}
          {formData.preferredSkills.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Preferred Skills</label>
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                {formData.preferredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded bg-blue-100 border border-blue-300 text-blue-700"
                  >
                    {skill}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => removeSkill(skill, false)}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="h-8 text-sm">
          Cancel
        </Button>
        <Button type="submit" disabled={createJobMutation.isPending} className="h-8 text-sm">
          {createJobMutation.isPending ? (
            <>
              <Loader2 size={12} className="animate-spin mr-1.5" />
              Creating...
            </>
          ) : (
            <>
              <Plus size={12} className="mr-1.5" />
              Create Job
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function JobsPage() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [deptFilter, setDept]     = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useJobs();
  const createJobMutation = useCreateJob();
  const jobs = data?.items ?? [];

  const departments = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.department))).sort(),
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter((j) => {
      const matchSearch = !q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || j.status === statusFilter;
      const matchDept   = deptFilter   === "all" || j.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [jobs, search, statusFilter, deptFilter]);

  const statusCounts = useMemo(
    () => ({
      active:  jobs.filter((j) => j.status === "active").length,
      paused:  jobs.filter((j) => j.status === "paused").length,
      draft:   jobs.filter((j) => j.status === "draft").length,
      closed:  jobs.filter((j) => j.status === "closed").length,
    }),
    [jobs]
  );

  const hasFilters = search || statusFilter !== "all" || deptFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setDept("all");
  };

  return (
    <div>
      <Topbar
        title="Jobs"
        description="Manage open positions and candidate pools"
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={13} /> New Job
          </Button>
        }
      />

      <div className="px-6 py-6 space-y-5 max-w-6xl">
        <PageHeader
          title="Job Openings"
          description={
            isLoading
              ? "Loading positions…"
              : `${statusCounts.active} active position${statusCounts.active !== 1 ? "s" : ""}`
          }
        />

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4">
          {(["active", "paused", "draft", "closed"] as JobStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(statusFilter === s ? "all" : s)}
              className={cn(
                "stat-card text-left transition-all",
                statusFilter === s && "ring-1 ring-primary border-primary/50"
              )}
            >
              <span className="stat-label capitalize">{s.replace("_", " ")}</span>
              {isLoading ? (
                <div className="h-6 w-8 bg-muted rounded animate-pulse mt-1" />
              ) : (
                <span className="stat-value">{statusCounts[s]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs…"
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatus}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDept} disabled={isLoading}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-xs text-muted-foreground">
              <X size={12} /> Clear
            </Button>
          )}
        </div>

        {/* Content */}
        {isError ? (
          <EmptyState
            icon={Briefcase}
            title="Failed to load jobs"
            description="There was an error fetching job openings."
            action={<Button size="sm" onClick={() => refetch()}>Try again</Button>}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description={hasFilters ? "Adjust your filters or create a new job opening." : "Create your first job opening to start screening candidates."}
            action={
              hasFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
              ) : (
                <Button size="sm" className="gap-1"><Plus size={13} /> New Job</Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((job) => {
              const conversionRate = job.candidateCount
                ? Math.round((job.shortlistedCount / job.candidateCount) * 100)
                : 0;

              return (
                <div
                  key={job.id}
                  className="section-shell hover:border-primary/30 transition-colors group"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-[11px] font-mono px-2 py-0.5 rounded border", STATUS_COLORS[job.status])}>
                            {job.status}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {TYPE_LABELS[job.type] ?? job.type}
                          </span>
                        </div>
                        <h3 className="text-[14px] font-semibold font-display tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                      </div>
                      <ChevronRight size={15} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1"><Building2 size={11} />{job.department}</div>
                      <div className="flex items-center gap-1"><MapPin size={11} />{job.location}</div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} />{job.minExperienceYears}–{job.maxExperienceYears ?? "∞"} yrs
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.slice(0, 4).map((s) => (
                        <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                          {s}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                          +{job.requiredSkills.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-4">
                        {[
                          { value: job.candidateCount, label: "candidates" },
                          { value: job.shortlistedCount, label: "shortlisted", color: "text-success" },
                          { value: `${conversionRate}%`, label: "conversion", color: "text-primary" },
                        ].map(({ value, label, color }) => (
                          <div key={label} className="text-center">
                            <p className={cn("text-lg font-display font-semibold font-numeric leading-none", color)}>{value}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 text-xs h-7"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Users size={11} /> View Candidates
                      </Button>
                    </div>

                    {job.closingDate && (
                      <p className="text-[10px] text-muted-foreground font-mono border-t border-border pt-2">
                        Closes {formatDate(job.closingDate)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Job Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh]">
          <div className="sticky top-0 px-6 py-4 border-b border-border bg-background">
            <DialogTitle className="text-lg font-semibold">
              Create New Job Opening
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Fill in the details below to create a new job opening
            </DialogDescription>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <CreateJobForm
                onSuccess={() => setIsCreateDialogOpen(false)}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
