import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  organization: z.string().min(2, "Organization name is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const jobSchema = z.object({
  title: z.string().min(3, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(2, "Location is required"),
  type: z.enum(["full_time", "part_time", "contract", "internship"]),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requiredSkills: z.array(z.string()).min(1, "Add at least one required skill"),
  preferredSkills: z.array(z.string()).default([]),
  minExperienceYears: z.number().min(0).max(30),
  maxExperienceYears: z.number().min(0).max(30).optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().default("USD"),
  closingDate: z.string().optional(),
}).refine(
  (d) => !d.maxExperienceYears || d.maxExperienceYears >= d.minExperienceYears,
  { message: "Max experience must be greater than min", path: ["maxExperienceYears"] }
);

export const recruiterNoteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty").max(2000, "Note is too long"),
});

export const assessmentSchema = z.object({
  title: z.string().min(3, "Assessment title is required"),
  type: z.enum(["technical", "behavioral", "cognitive", "coding"]),
  description: z.string().min(20, "Description is required"),
  durationMinutes: z.number().min(5).max(480),
  totalQuestions: z.number().min(1).max(200),
  maxScore: z.number().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type RecruiterNoteInput = z.infer<typeof recruiterNoteSchema>;
export type AssessmentInput = z.infer<typeof assessmentSchema>;
