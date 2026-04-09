import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import type { JobOpening } from "@/lib/types";

// ─── No mock fallbacks — API errors surface to the UI properly ────────────────

export function useJobs(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [QUERY_KEYS.jobs, params],
    queryFn: () => jobsApi.list(params),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.job(id),
    queryFn: () => jobsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<JobOpening>) => jobsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.jobs] });
      toast.success("Job opening created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create job"),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobOpening> }) =>
      jobsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.jobs] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.job(id) });
      toast.success("Job updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update job"),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.jobs] });
      toast.success("Job deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete job"),
  });
}

export function useJobCandidates(jobId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.job(jobId), "candidates"],
    queryFn: () => jobsApi.getCandidates(jobId),
    enabled: Boolean(jobId),
  });
}
