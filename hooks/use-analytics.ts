import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboardMetrics],
    queryFn: analyticsApi.dashboardMetrics,
    staleTime: 2 * 60 * 1000, // 2 min cache
    retry: 1,
  });
}

export function useUploadTrends(days = 30) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "trends", days],
    queryFn: () => analyticsApi.uploadTrends(days),
    retry: 1,
  });
}

export function useScoreDistribution() {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "score-dist"],
    queryFn: analyticsApi.scoreDistribution,
    retry: 1,
  });
}

export function useSkillFrequency(limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "skills", limit],
    queryFn: () => analyticsApi.skillFrequency(limit),
    retry: 1,
  });
}

export function useConversionFunnel() {
  return useQuery({
    queryKey: [QUERY_KEYS.analytics, "funnel"],
    queryFn: analyticsApi.conversionFunnel,
    retry: 1,
  });
}
