// Hand-written mirrors of backend/models/schemas.py — keep in sync in the same edit.

export type Role = "student" | "employer";
export type EnglishLevel = "english_only" | "basic_dutch" | "dutch_required";
export type JobType = "part_time" | "internship" | "working_student" | "graduate";
export type PermitSupport = "twv_provided" | "eu_eea" | "freelance_kvk" | "none";
export type WorkMode = "on_site" | "hybrid" | "remote";
export type AppStatus = "applied" | "under_review" | "interview" | "accepted" | "rejected";

export interface StudentProfile {
  university: string;
  study: string;
  city: string;
  english_level: string;
  cv_url: string;
  cv_filename: string;
  bio: string;
  phone: string;
}

export interface CvUpload {
  id: string;
  url: string;
  filename: string;
  size: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  company_id: string | null;
  company_name: string | null;
  email_verified: boolean;
  profile: StudentProfile;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  city: string;
  industry: string;
  website: string;
  about: string;
  logo_initials: string;
}

export interface JobInput {
  title: string;
  city: string;
  category: string;
  job_type: JobType;
  english_level: EnglishLevel;
  permit_support: PermitSupport;
  work_mode: WorkMode;
  hourly_min: number;
  hourly_max: number;
  hours_per_week: number;
  description: string;
  requirements: string[];
  perks: string[];
  published: boolean;
}

export interface Job extends JobInput {
  id: string;
  company_id: string;
  company_name: string;
  fresh_until: string | null;
  created_at: string;
}

export interface JobWithMeta extends Job {
  saved: boolean;
  applied: boolean;
  applicant_count: number;
  homepage_feature: boolean;
  fresh_sponsored: boolean;
}

export interface JobDetail {
  job: JobWithMeta;
  company: Company | null;
}

export interface JobList {
  items: JobWithMeta[];
  total: number;
}

export interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  company_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_university: string;
  motivation: string;
  cv_url: string;
  cv_filename: string;
  status: AppStatus;
  created_at: string;
}

export interface Stats {
  jobs: number;
  employers: number;
  english_only: number;
  avg_hourly: number;
  city_counts: Record<string, number>;
}

export interface OkResponse {
  ok: boolean;
}

export interface CheckoutResponse {
  url: string;
}

export const CITIES = [
  "Leeuwarden",
  "Groningen",
  "Assen",
  "Enschede",
  "Arnhem",
  "Nijmegen",
  "Tilburg",
  "Leiden",
  "Amsterdam",
  "Utrecht",
  "Alkmaar",
];

export const CATEGORIES = [
  "Tech & Engineering",
  "Data & Analytics",
  "Hospitality & Events",
  "Logistics & Operations",
  "Customer Support",
  "Marketing & Communications",
];

// Option orders — labels come from the i18n dictionary as `label.<value>`.
export const ENGLISH_LEVELS: EnglishLevel[] = ["english_only", "basic_dutch", "dutch_required"];
export const JOB_TYPES: JobType[] = ["part_time", "internship", "working_student", "graduate"];
export const PERMITS: PermitSupport[] = ["twv_provided", "eu_eea", "freelance_kvk", "none"];
export const WORK_MODES: WorkMode[] = ["on_site", "hybrid", "remote"];
export const STATUSES: AppStatus[] = [
  "applied",
  "under_review",
  "interview",
  "accepted",
  "rejected",
];

export const STATUS_CLASSES: Record<AppStatus, string> = {
  applied: "bg-slate-100 text-slate-700",
  under_review: "bg-sky-50 text-sky-700",
  interview: "bg-orange-50 text-orange-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};
