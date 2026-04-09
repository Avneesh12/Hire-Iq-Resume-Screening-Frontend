import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import type { Assessment } from "@/lib/types";

export function useAssessments() {
  return useQuery({
    queryKey: [QUERY_KEYS.assessments],
    queryFn: assessmentsApi.list,
    // Returns PaginatedResponse<Assessment>
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessment(id),
    queryFn: () => assessmentsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useAssessmentAssignments(filters?: {
  candidateId?: string;
  assessmentId?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.assignments, filters],
    queryFn: () => assessmentsApi.listAssignments(filters),
    // Backend returns AssessmentAssignment[] directly (not paginated)
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Assessment>) => assessmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.assessments] });
      toast.success("Assessment created");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to create assessment"),
  });
}

export function useDeleteAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.assessments] });
      toast.success("Assessment deleted");
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to delete assessment"),
  });
}

export function useAssignAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      candidateIds,
    }: {
      assessmentId: string;
      candidateIds: string[];
    }) => assessmentsApi.assign(assessmentId, candidateIds),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.assignments] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.assessments] });
      toast.success(
        `Assessment assigned to ${data.length} candidate${data.length !== 1 ? "s" : ""}`
      );
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to assign assessment"),
  });
}
