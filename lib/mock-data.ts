/**
 * MOCK DATA — Development only.
 *
 * This file exists ONLY for Storybook / unit tests / isolated UI dev.
 * It is NOT imported anywhere in the production app. All hooks fetch from
 * the real backend. If you need mock data for a test, import from here.
 *
 * If the API is unreachable during local dev, run the backend or use
 * tools like MSW (Mock Service Worker) to intercept requests.
 */

import type {
  Candidate, JobOpening, Assessment, AssessmentAssignment,
  DashboardMetrics, UploadBatch, UploadTrend, ScoreDistribution,
  SkillFrequency, ConversionFunnel,
} from "./types";

export const mockMetrics: DashboardMetrics = {
  totalCandidates: 847,
  resumesProcessed: 1203,
  shortlisted: 124,
  pendingReview: 38,
  averageScore: 0.67,
  processingQueue: 12,
  todayUploads: 23,
  weeklyChange: { candidates: 14.2, processed: 8.7, shortlisted: -3.1 },
};

export const mockCandidates: Candidate[] = [
  {
    id: "c1",
    name: "Priya Nair",
    email: "priya.nair@gmail.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    status: "shortlisted",
    appliedJobId: "j1",
    appliedJobTitle: "Senior ML Engineer",
    resumeUploadId: "u1",
    tags: ["Python", "TensorFlow", "NLP"],
    createdAt: "2025-04-01T09:23:00Z",
    updatedAt: "2025-04-03T14:10:00Z",
    parsedResume: {
      rawText: "",
      name: "Priya Nair",
      email: "priya.nair@gmail.com",
      skills: ["Python", "TensorFlow", "PyTorch", "NLP", "FastAPI", "Docker"],
      totalExperienceYears: 5,
      experience: [],
      education: [],
      certifications: [],
      languages: ["English", "Hindi"],
    },
    score: {
      overall: 0.87,
      breakdown: { skills: 0.92, experience: 0.85, education: 0.90, roleAlignment: 0.88, communication: 0.80 },
      predictedRole: "Senior ML Engineer",
      confidence: 0.91,
      skillMatch: 0.89,
      experienceMatch: 0.84,
      aiExplanation: "Strong alignment with the role.",
      strengths: ["5 years ML experience"],
      concerns: ["Limited LLM experience"],
      recommendation: "strong_hire",
    },
    recruiterNotes: [],
  },
];

export const mockJobs: JobOpening[] = [
  {
    id: "j1",
    title: "Senior ML Engineer",
    department: "Engineering",
    location: "Bengaluru / Remote",
    type: "full_time",
    status: "active",
    description: "We are looking for a Senior ML Engineer...",
    requiredSkills: ["Python", "TensorFlow", "PyTorch"],
    preferredSkills: ["CUDA"],
    minExperienceYears: 4,
    candidateCount: 0,
    shortlistedCount: 0,
    createdAt: "2025-03-15T00:00:00Z",
  },
];

export const mockBatches: UploadBatch[] = [];
export const mockAssessments: Assessment[] = [];
export const mockAssignments: AssessmentAssignment[] = [];

export const mockUploadTrends: UploadTrend[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const uploads = Math.floor(Math.random() * 35) + 5;
  return { date: date.toISOString().split("T")[0], uploads, processed: uploads - 1, failed: 1 };
});

export const mockScoreDistribution: ScoreDistribution[] = [
  { range: "0–20%", count: 48 },
  { range: "20–40%", count: 112 },
  { range: "40–60%", count: 234 },
  { range: "60–75%", count: 287 },
  { range: "75–90%", count: 198 },
  { range: "90–100%", count: 84 },
];

export const mockSkillFrequency: SkillFrequency[] = [
  { skill: "Python", count: 623, percentage: 73.6 },
  { skill: "JavaScript", count: 412, percentage: 48.7 },
];

export const mockFunnel: ConversionFunnel[] = [
  { stage: "Uploaded", count: 1203 },
  { stage: "Parsed", count: 1156 },
];
