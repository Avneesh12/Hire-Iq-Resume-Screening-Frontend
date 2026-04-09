import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import type { UploadFilters } from "@/lib/types";

export function useUploads(filters: UploadFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.uploads, filters],
    queryFn: () => uploadsApi.list(filters),
    // Poll every 10s while processing so the history refreshes automatically
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      const hasProcessing = items.some(
        (b) => b.status === "processing" || b.status === "uploading"
      );
      return hasProcessing ? 10_000 : false;
    },
  });
}

export function useUploadResumes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, jobId }: { files: File[]; jobId?: string }) =>
      uploadsApi.uploadResumes(files, jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.uploads] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.candidates] });
      toast.success("Upload complete — resumes are being processed");
    },
    onError: (err: Error) => toast.error(err.message ?? "Upload failed"),
  });
}

export function useRetryUpload() {
  const qc = useQueryClient();
  return useMutation({
    // uploadId is an individual resume upload ID (not a batch ID)
    mutationFn: (uploadId: string) => uploadsApi.retry(uploadId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.uploads] });
      toast.success("Retry queued");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to retry upload"),
  });
}

export function useDeleteUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uploadId: string) => uploadsApi.delete(uploadId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.uploads] });
      toast.success("Upload deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete upload"),
  });
}
