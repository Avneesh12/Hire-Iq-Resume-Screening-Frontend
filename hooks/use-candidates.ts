import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidatesApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import type { CandidateFilters, CandidateStatus } from "@/lib/types";

export function useCandidates(filters: CandidateFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.candidates, filters],
    queryFn: () => candidatesApi.list(filters),
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.candidate(id),
    queryFn: () => candidatesApi.get(id),
    enabled: Boolean(id),
  });
}

export function useUpdateCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatus }) =>
      candidatesApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.candidates] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.candidate(id) });
      toast.success("Candidate status updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update status"),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      candidatesApi.addNote(id, content),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.candidate(id) });
      toast.success("Note added");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to add note"),
  });
}

export function useBulkUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: CandidateStatus }) =>
      candidatesApi.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.candidates] });
      toast.success("Candidates updated");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to update candidates"),
  });
}
