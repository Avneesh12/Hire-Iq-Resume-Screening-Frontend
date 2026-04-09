// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "recruiter" | "hiring_manager";
  avatar?: string;
  organization: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organization: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  job_title?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ─── Resume Upload ────────────────────────────────────────────────────────────

export type UploadStatus = "pending" | "processing" | "parsed" | "scored" | "failed";

export interface ResumeUpload {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  status: UploadStatus;
  candidateId?: string;
  jobId?: string;
  uploadedAt: string;
  processedAt?: string;
  errorMessage?: string;
  parsedData?: ParsedResume;
}

export interface UploadBatch {
  id: string;
  uploadedAt: string;
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  jobId?: string;
  jobTitle?: string;
  uploads: ResumeUpload[];
  status: "uploading" | "processing" | "complete" | "partial_failure";
}

// ─── Parsed Resume ────────────────────────────────────────────────────────────

export interface ParsedResume {
  rawText: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: string[];
  languages: string[];
  totalExperienceYears?: number;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  skills?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear?: number;
  endYear?: number;
  gpa?: number;
}

// ─── Candidate ────────────────────────────────────────────────────────────────

export type CandidateStatus =
  | "new"
  | "under_review"
  | "shortlisted"
  | "assessment_sent"
  | "assessment_complete"
  | "interviewing"
  | "offered"
  | "rejected"
  | "hired";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  status: CandidateStatus;
  appliedJobId?: string;
  appliedJobTitle?: string;
  resumeUploadId: string;
  parsedResume: ParsedResume;
  score?: CandidateScore;
  recruiterNotes?: RecruiterNote[];
  assessmentResults?: AssessmentResult[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface CandidateScore {
  overall: number;
  breakdown: ScoreBreakdown;
  predictedRole: string;
  confidence: number;
  skillMatch: number;
  experienceMatch: number;
  aiExplanation: string;
  strengths: string[];
  concerns: string[];
  recommendation: "strong_hire" | "hire" | "maybe" | "no_hire";
}

export interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  roleAlignment: number;
  communication: number;
}

export interface RecruiterNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

// ─── Job Opening ──────────────────────────────────────────────────────────────

export type JobStatus = "draft" | "active" | "paused" | "closed";

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full_time" | "part_time" | "contract" | "internship";
  status: JobStatus;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  maxExperienceYears?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  candidateCount: number;
  shortlistedCount: number;
  createdAt: string;
  closingDate?: string;
  hiringManagerId?: string;
}

// ─── Assessment ───────────────────────────────────────────────────────────────

export type AssessmentType = "technical" | "behavioral" | "cognitive" | "coding";
export type AssessmentStatus = "draft" | "active" | "archived";

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  maxScore: number;
  status: AssessmentStatus;
  createdAt: string;
  assignedCount: number;
  completedCount: number;
}

export type AssignmentStatus = "sent" | "opened" | "in_progress" | "submitted" | "expired";

export interface AssessmentAssignment {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: AssignmentStatus;
  sentAt: string;
  expiresAt: string;
  startedAt?: string;
  submittedAt?: string;
  result?: AssessmentResult;
}

export interface AssessmentResult {
  id: string;
  assignmentId: string;
  score: number;
  maxScore: number;
  percentile: number;
  timeTaken: number;
  answers: QuestionAnswer[];
  submittedAt: string;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
  correct: boolean;
  score: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalCandidates: number;
  resumesProcessed: number;
  shortlisted: number;
  pendingReview: number;
  averageScore: number;
  processingQueue: number;
  todayUploads: number;
  weeklyChange: {
    candidates: number;
    processed: number;
    shortlisted: number;
  };
}

export interface UploadTrend {
  date: string;
  uploads: number;
  processed: number;
  failed: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface SkillFrequency {
  skill: string;
  count: number;
  percentage: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  candidateIds: string[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Backend uses { data: T[] }, frontend normalises to { items: T[] }
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface CandidateFilters {
  search?: string;
  status?: CandidateStatus[];
  jobId?: string;
  minScore?: number;
  maxScore?: number;
  skills?: string[];
  minExperience?: number;
  sortBy?: "score" | "name" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface UploadFilters {
  search?: string;
  status?: UploadStatus[];
  jobId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// ─── Resume Screening ─────────────────────────────────────────────────────────

export interface ResumeScreeningRequest {
  jobId: string;
  resumeText: string;
  parsedResume?: ParsedResume;
}

export interface ResumeScreeningResult {
  matchScore: number;
  matchPercentage: number;
  recommendation: "strong_match" | "match" | "weak_match" | "no_match";
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  strengths: string[];
  gaps: string[];
  summary: string;
}
