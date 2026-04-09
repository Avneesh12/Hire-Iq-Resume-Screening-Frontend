"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { UploadStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Upload, File, X, CheckCircle, AlertCircle,
  Loader2, RefreshCw, Trash2, FolderOpen,
} from "lucide-react";
import { useUploads, useUploadResumes, useRetryUpload, useDeleteUpload } from "@/hooks/use-uploads";
import { useJobs } from "@/hooks/use-jobs";
import { formatBytes, formatRelative, cn } from "@/lib/utils";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, MAX_BATCH_FILES } from "@/lib/constants";
import { toast } from "sonner";

interface LocalFile {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export default function UploadsPage() {
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("none");
  const [uploading, setUploading] = useState(false);

  const {
    data: uploadsData,
    isLoading: loadingHistory,
    isError: errorHistory,
    refetch: refetchHistory,
  } = useUploads();
  const { data: jobsData } = useJobs();
  const uploadMutation = useUploadResumes();
  const retryMutation = useRetryUpload();
  const deleteMutation = useDeleteUpload();

  const batches = uploadsData?.items ?? [];
  const jobs = jobsData?.items ?? [];

  const onDrop = useCallback((accepted: File[], rejected: { file: File; errors: readonly { message: string }[] }[]) => {
    rejected.forEach((r) => {
      toast.error(`${r.file.name}: ${r.errors[0]?.message ?? "Invalid file"}`);
    });

    const newFiles: LocalFile[] = accepted.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${f.name}`,
      file: f,
      status: "queued",
      progress: 0,
    }));

    setLocalFiles((prev) => {
      const combined = [...prev, ...newFiles];
      if (combined.length > MAX_BATCH_FILES) {
        toast.warning(`Max ${MAX_BATCH_FILES} files per batch. Extra files were dropped.`);
        return combined.slice(0, MAX_BATCH_FILES);
      }
      return combined;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_BATCH_FILES,
  });

  const removeFile = (id: string) => {
    setLocalFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => setLocalFiles([]);

  const handleUpload = async () => {
    if (!localFiles.length) return;
    const filesToUpload = localFiles.filter((f) => f.status === "queued");
    if (!filesToUpload.length) return;

    setUploading(true);

    // Mark all as uploading
    setLocalFiles((prev) =>
      prev.map((f) =>
        f.status === "queued" ? { ...f, status: "uploading" as const } : f
      )
    );

    // Animate progress bars while the real upload runs
    const progressInterval = setInterval(() => {
      setLocalFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading" && f.progress < 85
            ? { ...f, progress: Math.min(f.progress + 15, 85) }
            : f
        )
      );
    }, 300);

    try {
      await uploadMutation.mutateAsync({
        files: filesToUpload.map((f) => f.file),
        jobId: selectedJob !== "none" ? selectedJob : undefined,
      });

      clearInterval(progressInterval);

      // Mark done — real progress complete
      setLocalFiles((prev) =>
        prev.map((f) =>
          filesToUpload.some((lf) => lf.id === f.id)
            ? { ...f, status: "done" as const, progress: 100 }
            : f
        )
      );
    } catch (err) {
      clearInterval(progressInterval);
      setLocalFiles((prev) =>
        prev.map((f) =>
          filesToUpload.some((lf) => lf.id === f.id)
            ? {
                ...f,
                status: "error" as const,
                error: err instanceof Error ? err.message : "Upload failed",
              }
            : f
        )
      );
    } finally {
      setUploading(false);
    }
  };

  const queuedCount = localFiles.filter((f) => f.status === "queued").length;
  const doneCount   = localFiles.filter((f) => f.status === "done").length;
  const errorCount  = localFiles.filter((f) => f.status === "error").length;

  return (
    <div>
      <Topbar
        title="Uploads"
        description="Bulk resume ingestion and processing"
      />

      <div className="px-6 py-6 space-y-6 max-w-5xl">
        <PageHeader
          title="Resume Uploads"
          description="Upload PDF, DOC, DOCX, or TXT resumes. Up to 50 files per batch."
        />

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "hsl(226 100% 65% / 0.1)",
                border: "1px solid hsl(226 100% 65% / 0.2)",
              }}
            >
              <Upload size={20} style={{ color: "hsl(226 100% 65%)" }} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? "Drop files here" : "Drag & drop resumes here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or{" "}
                <span className="text-primary underline cursor-pointer">
                  browse files
                </span>{" "}
                — PDF, DOC, DOCX, TXT up to 10 MB
              </p>
            </div>
          </div>
        </div>

        {/* File queue */}
        {localFiles.length > 0 && (
          <div className="section-shell">
            <div className="section-header">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold font-display">
                  {localFiles.length} file{localFiles.length !== 1 ? "s" : ""} queued
                </span>
                {doneCount > 0 && (
                  <span className="text-[11px] text-success font-mono">
                    {doneCount} done
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="text-[11px] text-destructive font-mono">
                    {errorCount} failed
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Job selector */}
                <Select
                  value={selectedJob}
                  onValueChange={setSelectedJob}
                  disabled={uploading}
                >
                  <SelectTrigger className="w-44 h-7 text-xs">
                    <SelectValue placeholder="No specific job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific job</SelectItem>
                    {jobs
                      .filter((j) => j.status === "active")
                      .map((j) => (
                        <SelectItem key={j.id} value={j.id}>
                          {j.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 gap-1 text-xs text-muted-foreground"
                  >
                    <Trash2 size={11} /> Clear all
                  </Button>
                )}

                <Button
                  size="sm"
                  className="gap-1.5 h-7"
                  onClick={handleUpload}
                  disabled={uploading || queuedCount === 0}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <Upload size={12} /> Upload{" "}
                      {queuedCount > 0 ? queuedCount : ""} file
                      {queuedCount !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {localFiles.map((lf) => (
                <div key={lf.id} className="flex items-center gap-4 px-5 py-3">
                  <File size={14} className="text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{lf.file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatBytes(lf.file.size)}
                      </span>
                      {lf.status === "uploading" && (
                        <div className="flex-1 max-w-[120px]">
                          <Progress value={lf.progress} className="h-1" />
                        </div>
                      )}
                      {lf.error && (
                        <span className="text-[11px] text-destructive truncate max-w-[200px]">
                          {lf.error}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lf.status === "queued"    && <span className="badge-pending text-[10px]">Queued</span>}
                    {lf.status === "uploading" && <Loader2 size={14} className="text-primary animate-spin" />}
                    {lf.status === "done"      && <CheckCircle size={15} className="text-success" />}
                    {lf.status === "error"     && <AlertCircle size={15} className="text-destructive" />}
                  </div>

                  {!uploading && lf.status !== "uploading" && (
                    <button
                      onClick={() => removeFile(lf.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload history */}
        <div className="section-shell">
          <div className="section-header">
            <span className="text-sm font-semibold font-display">Upload History</span>
            <div className="flex items-center gap-2">
              {!loadingHistory && !errorHistory && (
                <span className="text-xs text-muted-foreground font-mono">
                  {batches.length} batch{batches.length !== 1 ? "es" : ""}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground"
                onClick={() => refetchHistory()}
                disabled={loadingHistory}
                title="Refresh"
              >
                <RefreshCw size={11} className={loadingHistory ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>

          {errorHistory ? (
            <EmptyState
              icon={FolderOpen}
              title="Failed to load upload history"
              description="Could not fetch upload batches from the server. Is the backend running?"
              action={
                <Button
                  size="sm"
                  onClick={() => refetchHistory()}
                  className="gap-1.5"
                >
                  <RefreshCw size={12} /> Retry
                </Button>
              }
            />
          ) : loadingHistory ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-5 px-5 py-4 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-3 bg-muted rounded w-36" />
                      <div className="h-5 bg-muted rounded w-20" />
                    </div>
                    <div className="h-2 bg-muted rounded w-48" />
                    <div className="h-1 bg-muted rounded w-32 max-w-xs" />
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="h-5 bg-muted rounded w-8 ml-auto" />
                    <div className="h-2 bg-muted rounded w-14" />
                  </div>
                </div>
              ))}
            </div>
          ) : batches.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No uploads yet"
              description="Upload your first batch of resumes using the dropzone above."
            />
          ) : (
            <div className="divide-y divide-border">
              {batches.map((batch) => {
                const safeDivisor = batch.totalFiles || 1;
                const pct = Math.round((batch.processedFiles / safeDivisor) * 100);
                const statusForBadge =
                  batch.status === "complete"
                    ? "scored"
                    : batch.status === "partial_failure"
                    ? "failed"
                    : "processing";

                return (
                  <div
                    key={batch.id}
                    className="flex items-center gap-5 px-5 py-4 table-row-hover"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium text-foreground">
                          {batch.jobTitle ?? "No specific job"}
                        </span>
                        <UploadStatusBadge status={statusForBadge} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {batch.processedFiles}/{batch.totalFiles} processed
                        </span>
                        {batch.failedFiles > 0 && (
                          <span className="text-[11px] text-destructive font-mono">
                            {batch.failedFiles} failed
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatRelative(batch.uploadedAt)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Progress value={pct} className="h-1 max-w-xs" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Retry individual failed uploads within the batch */}
                      {batch.status === "partial_failure" &&
                        batch.uploads
                          .filter((u) => u.status === "failed")
                          .map((u) => null) /* Retry per-upload handled below */}

                      {/* Retry button for failed batches — retries first failed upload */}
                      {batch.status !== "complete" && batch.uploads.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground"
                          onClick={() => {
                            const firstFailed = batch.uploads.find(
                              (u) => u.status === "failed"
                            );
                            if (firstFailed) {
                              retryMutation.mutate(firstFailed.id);
                            } else {
                              toast.info(
                                "No failed uploads in this batch to retry"
                              );
                            }
                          }}
                          disabled={retryMutation.isPending}
                          title="Retry failed uploads"
                        >
                          <RefreshCw
                            size={12}
                            className={retryMutation.isPending ? "animate-spin" : ""}
                          />
                        </Button>
                      )}

                      {/* Delete batch */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this upload batch?")) {
                            deleteMutation.mutate(batch.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        title="Delete batch"
                      >
                        <Trash2 size={12} />
                      </Button>

                      <div className="text-right">
                        <p className="text-xl font-display font-semibold font-numeric">
                          {batch.totalFiles}
                        </p>
                        <p className="text-[11px] text-muted-foreground">resumes</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
