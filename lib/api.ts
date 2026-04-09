import { TokenStorage, authHeaders, authHeadersMultipart } from "./auth";
import { ROUTES } from "./constants";
import type {
  AuthResponse, LoginRequest, RegisterRequest,
  Candidate, CandidateFilters, CandidateScore, RecruiterNote,
  ResumeUpload, UploadBatch, UploadFilters,
  JobOpening, Assessment, AssessmentAssignment,
  DashboardMetrics, UploadTrend, ScoreDistribution,
  SkillFrequency, ConversionFunnel, PaginatedResponse,
  ApiResponse, User, ResumeScreeningRequest, ResumeScreeningResult,
  UpdateProfileRequest, ChangePasswordRequest,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── API Error class ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Redirect helper ──────────────────────────────────────────────────────────

function redirectToLogin() {
  if (typeof window !== "undefined") {
    TokenStorage.clear();
    window.location.href = ROUTES.login;
  }
}

// ─── Serialize filters to URLSearchParams ─────────────────────────────────────

function toParams(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((item) => params.append(k, String(item)));
    } else {
      params.set(k, String(v));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Core request wrapper ─────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        ...authHeaders(),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("Network error — please check your connection", 0);
  }

  if (res.status === 401) {
    redirectToLogin();
    throw new ApiError("Session expired — please sign in again", 401, "SESSION_EXPIRED");
  }

  if (res.status === 403) {
    throw new ApiError("You don't have permission to perform this action", 403, "FORBIDDEN");
  }

  if (res.status === 404) {
    throw new ApiError("The requested resource was not found", 404, "NOT_FOUND");
  }

  if (!res.ok) {
    let message = `Request failed (HTTP ${res.status})`;
    try {
      const body = await res.json();
      // FastAPI returns { detail: "..." } for validation errors
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        // FastAPI 422 returns array of validation errors
        message = body.detail.map((e: { msg: string }) => e.msg).join(", ");
      } else {
        message = body.message ?? message;
      }
    } catch {
      // ignore JSON parse errors on error bodies
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

async function uploadFiles<T>(path: string, form: FormData): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      // Do NOT set Content-Type — browser sets it with boundary for multipart
      headers: authHeadersMultipart(),
      body: form,
    });
  } catch {
    throw new ApiError("Network error — please check your connection", 0);
  }

  if (res.status === 401) {
    redirectToLogin();
    throw new ApiError("Session expired — please sign in again", 401, "SESSION_EXPIRED");
  }

  if (!res.ok) {
    let message = `Upload failed (HTTP ${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        message = body.detail.map((e: { msg: string }) => e.msg).join(", ");
      } else {
        message = body.message ?? message;
      }
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

// ─── Response shape adapter ───────────────────────────────────────────────────
// Backend returns { data: [...], total, page, page_size, total_pages }
// Frontend expects { items: [...], total, page, pageSize, totalPages }

function adaptPaginated<T>(raw: {
  data?: T[];
  items?: T[];
  total: number;
  page: number;
  page_size?: number;
  pageSize?: number;
  total_pages?: number;
  totalPages?: number;
}): PaginatedResponse<T> {
  return {
    items: raw.data ?? raw.items ?? [],
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size ?? raw.pageSize ?? 25,
    totalPages: raw.total_pages ?? raw.totalPages ?? 1,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<User>("/api/v1/auth/me"),

  logout: () =>
    request<void>("/api/v1/auth/logout", {
      method: "POST",
    }),

  forgotPassword: (email: string) =>
    request<ApiResponse<null>>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  updateProfile: (data: UpdateProfileRequest) =>
    request<User>("/api/v1/auth/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordRequest) =>
    request<ApiResponse<null>>("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Candidates ───────────────────────────────────────────────────────────────

export const candidatesApi = {
  list: async (filters: CandidateFilters = {}): Promise<PaginatedResponse<Candidate>> => {
    // All filters are sent as server-side query params — no client-side filtering
    const params: Record<string, unknown> = {
      search: filters.search,
      status: filters.status?.[0],
      job_id: filters.jobId,
      min_score: filters.minScore,
      max_score: filters.maxScore,
      sort_by: filters.sortBy,
      sort_order: filters.sortOrder,
      page: filters.page ?? 1,
      page_size: filters.pageSize ?? 25,
    };
    const raw = await request<{
      data?: Candidate[];
      items?: Candidate[];
      total: number;
      page: number;
      page_size?: number;
      pageSize?: number;
      total_pages?: number;
      totalPages?: number;
    }>(`/api/v1/candidates${toParams(params)}`);
    return adaptPaginated(raw);
  },

  get: (id: string) => request<Candidate>(`/api/v1/candidates/${id}`),

  updateStatus: (id: string, status: Candidate["status"]) =>
    request<Candidate>(`/api/v1/candidates/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  addNote: (id: string, content: string) =>
    request<RecruiterNote>(`/api/v1/candidates/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getScore: (id: string) =>
    request<CandidateScore>(`/api/v1/candidates/${id}/score`),

  bulkUpdateStatus: (ids: string[], status: Candidate["status"]) =>
    request<ApiResponse<null>>("/api/v1/candidates/bulk-status", {
      method: "PATCH",
      body: JSON.stringify({ ids, status }),
    }),
};

// ─── Uploads ──────────────────────────────────────────────────────────────────

export const uploadsApi = {
  /**
   * Upload resumes as multipart/form-data.
   * Field name "files" for the file array, "job_id" for optional job association.
   */
  uploadResumes: (files: File[], jobId?: string) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    if (jobId && jobId !== "none") form.append("job_id", jobId);
    return uploadFiles<UploadBatch>("/api/v1/resumes/upload", form);
  },

  list: async (filters: UploadFilters = {}): Promise<PaginatedResponse<UploadBatch>> => {
    const params: Record<string, unknown> = {
      job_id: filters.jobId,
      status: filters.status?.[0],
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      page: filters.page ?? 1,
      page_size: filters.pageSize ?? 25,
    };
    const raw = await request<{
      data?: UploadBatch[];
      items?: UploadBatch[];
      total: number;
      page: number;
      page_size?: number;
      pageSize?: number;
      total_pages?: number;
      totalPages?: number;
    }>(`/api/v1/resumes/batches${toParams(params)}`);
    return adaptPaginated(raw);
  },

  getBatch: (id: string) => request<UploadBatch>(`/api/v1/resumes/batches/${id}`),

  retry: (uploadId: string) =>
    request<ResumeUpload>(`/api/v1/resumes/${uploadId}/retry`, { method: "POST" }),

  delete: (uploadId: string) =>
    request<ApiResponse<null>>(`/api/v1/resumes/${uploadId}`, { method: "DELETE" }),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: async (params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<JobOpening>> => {
    const qp: Record<string, unknown> = {
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 50,
    };
    const raw = await request<{
      data?: JobOpening[];
      items?: JobOpening[];
      total: number;
      page: number;
      page_size?: number;
      pageSize?: number;
      total_pages?: number;
      totalPages?: number;
    }>(`/api/v1/jobs${toParams(qp)}`);
    return adaptPaginated(raw);
  },

  get: (id: string) => request<JobOpening>(`/api/v1/jobs/${id}`),

  create: (data: Partial<JobOpening>) =>
    request<JobOpening>("/api/v1/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<JobOpening>) =>
    request<JobOpening>(`/api/v1/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<ApiResponse<null>>(`/api/v1/jobs/${id}`, { method: "DELETE" }),

  getCandidates: async (id: string): Promise<PaginatedResponse<Candidate>> => {
    const raw = await request<{
      data?: Candidate[];
      items?: Candidate[];
      total: number;
      page: number;
      page_size?: number;
      pageSize?: number;
      total_pages?: number;
      totalPages?: number;
    }>(`/api/v1/jobs/${id}/candidates`);
    return adaptPaginated(raw);
  },
};

// ─── Assessments ──────────────────────────────────────────────────────────────

export const assessmentsApi = {
  list: async (): Promise<PaginatedResponse<Assessment>> => {
    // Backend may return array directly or paginated — handle both
    const raw = await request<Assessment[] | {
      data?: Assessment[];
      items?: Assessment[];
      total: number;
      page: number;
    }>("/api/v1/assessments");
    if (Array.isArray(raw)) {
      return { items: raw, total: raw.length, page: 1, pageSize: raw.length, totalPages: 1 };
    }
    return adaptPaginated(raw);
  },

  get: (id: string) => request<Assessment>(`/api/v1/assessments/${id}`),

  create: (data: Partial<Assessment>) =>
    request<Assessment>("/api/v1/assessments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<ApiResponse<null>>(`/api/v1/assessments/${id}`, { method: "DELETE" }),

  assign: (assessmentId: string, candidateIds: string[]) =>
    request<AssessmentAssignment[]>("/api/v1/assessments/assign", {
      method: "POST",
      body: JSON.stringify({
        assessment_id: assessmentId,
        candidate_ids: candidateIds,
      }),
    }),

  listAssignments: (filters?: { candidateId?: string; assessmentId?: string }) => {
    const params: Record<string, unknown> = {};
    if (filters?.candidateId) params.candidate_id = filters.candidateId;
    if (filters?.assessmentId) params.assessment_id = filters.assessmentId;
    return request<AssessmentAssignment[]>(
      `/api/v1/assessments/assignments${toParams(params)}`
    );
  },
};

// ─── Resume Screening ─────────────────────────────────────────────────────────

export const resumeApi = {
  screen: (data: ResumeScreeningRequest) =>
    request<ResumeScreeningResult>("/api/v1/resume/screen", {
      method: "POST",
      body: JSON.stringify({
        job_id: data.jobId,
        resume_text: data.resumeText,
        parsed_resume: data.parsedResume,
      }),
    }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsApi = {
  dashboardMetrics: () =>
    request<DashboardMetrics>("/api/v1/analytics/metrics"),

  uploadTrends: (days = 30) =>
    request<UploadTrend[]>(`/api/v1/analytics/upload-trends?days=${days}`),

  scoreDistribution: () =>
    request<ScoreDistribution[]>("/api/v1/analytics/score-distribution"),

  skillFrequency: (limit = 20) =>
    request<SkillFrequency[]>(`/api/v1/analytics/skills?limit=${limit}`),

  conversionFunnel: () =>
    request<ConversionFunnel[]>("/api/v1/analytics/funnel"),
};
