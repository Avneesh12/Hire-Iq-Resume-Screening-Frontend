"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { resumeApi } from "@/lib/api";
import { toast } from "sonner";
import type { ResumeScreeningRequest, ResumeScreeningResult } from "@/lib/types";

/**
 * Hook for screening resumes against job requirements
 * Calls POST /api/v1/resume/screen
 */
export function useScreenResume() {
  return useMutation({
    mutationFn: async (data: ResumeScreeningRequest) => {
      return resumeApi.screen(data);
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to screen resume";
      toast.error(message);
    },
    onSuccess: () => {
      toast.success("Resume screened successfully");
    },
  });
}

/**
 * Standalone function to screen a resume
 * Useful for quick screening without component state
 */
export async function screenResume(
  data: ResumeScreeningRequest
): Promise<ResumeScreeningResult | null> {
  try {
    return await resumeApi.screen(data);
  } catch (error: any) {
    const message = error?.message || "Failed to screen resume";
    toast.error(message);
    return null;
  }
}
