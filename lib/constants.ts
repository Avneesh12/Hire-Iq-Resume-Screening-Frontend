export const APP_NAME = "HireIQ";
export const APP_TAGLINE = "Resume intelligence for serious hiring teams.";
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** All app routes in one place — never hardcode paths in components */
export const ROUTES = {
  home: "/",
  // Auth
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  // Dashboard
  dashboard: "/dashboard",
  candidates: "/dashboard/candidates",
  candidate: (id: string) => `/dashboard/candidates/${id}`,
  uploads: "/dashboard/uploads",
  assessments: "/dashboard/assessments",
  results: "/dashboard/results",
  jobs: "/dashboard/jobs",
  analytics: "/dashboard/analytics",
  settings: "/dashboard/settings",
  marketing: "/marketing",
} as const;

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_BATCH_FILES = 50;
export const PAGE_SIZE = 25;

export const SKILLS_TAXONOMY = [
  "Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C++", "C#",
  "React", "Next.js", "Vue", "Angular", "Node.js", "FastAPI", "Django", "Flask",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform",
  "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
  "GraphQL", "REST API", "gRPC", "Microservices",
  "Product Management", "Agile", "Scrum", "Jira",
  "Figma", "UX Design", "A/B Testing",
  "SQL", "Data Analysis", "Tableau", "Power BI",
  "Cybersecurity", "Penetration Testing", "SIEM",
];

export const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Data Science", "Marketing",
  "Sales", "Operations", "Finance", "HR", "Legal", "Customer Success",
];

export const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
] as const;

export const PIPELINE_STAGES = [
  { id: "screening", name: "Screening", color: "#6B7280" },
  { id: "shortlisted", name: "Shortlisted", color: "#3B82F6" },
  { id: "assessment", name: "Assessment", color: "#F59E0B" },
  { id: "interview", name: "Interview", color: "#8B5CF6" },
  { id: "offer", name: "Offer", color: "#22C55E" },
] as const;

export const QUERY_KEYS = {
  candidates: "candidates",
  candidate: (id: string) => ["candidate", id],
  uploads: "uploads",
  upload: (id: string) => ["upload", id],
  jobs: "jobs",
  job: (id: string) => ["job", id],
  assessments: "assessments",
  assessment: (id: string) => ["assessment", id],
  assignments: "assignments",
  dashboardMetrics: "dashboardMetrics",
  analytics: "analytics",
  me: "me",
} as const;
