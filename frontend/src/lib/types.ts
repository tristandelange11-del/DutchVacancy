// Hand-written mirrors of backend/models/schemas.py — keep in sync in the same edit.

export type Role = "student" | "employer";
export type EnglishLevel = "english_only" | "basic_dutch" | "dutch_required";
export type JobType = "part_time" | "internship" | "working_student" | "graduate";
export type PermitSupport = "twv_provided" | "eu_eea" | "freelance_kvk" | "none";
export type AppStatus = "applied" | "under_review" | "interview" | "accepted" | "rejected";

export interface StudentProfile {
  university: string;
  study: string;
  city: string;
  english_level: string;
  cv_url: string;
  bio: string;
  phone: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  company_id: string | null;
  company_name: string | null;
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
  created_at: string;
}

export interface JobWithMeta extends Job {
  saved: boolean;
  applied: boolean;
  applicant_count: number;
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
  status: AppStatus;
  created_at: string;
}

export interface Stats {
  jobs: number;
  employers: number;
  english_only: number;
  avg_hourly: number;
}

export interface OkResponse {
  ok: boolean;
}

export const CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Utrecht",
  "Eindhoven",
  "Delft",
  "Groningen",
];

export const CATEGORIES = [
  "Tech & Engineering",
  "Data & Analytics",
  "Hospitality & Events",
  "Logistics & Operations",
  "Customer Support",
  "Marketing & Communications",
];

export const ENGLISH_LEVEL_LABELS: Record<EnglishLevel, string> = {
  english_only: "English only",
  basic_dutch: "Basic Dutch welcome",
  dutch_required: "Dutch required",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  part_time: "Part-time (≤16h)",
  internship: "Internship / Stage",
  working_student: "Working student",
  graduate: "Graduate / Zoekjaar",
};

export const PERMIT_LABELS: Record<PermitSupport, string> = {
  twv_provided: "TWV permit support",
  eu_eea: "EU / EEA direct",
  freelance_kvk: "Freelance / KVK",
  none: "No permit support",
};

export const STATUS_LABELS: Record<AppStatus, string> = {
  applied: "Applied",
  under_review: "Under review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Not selected",
};

export const STATUS_CLASSES: Record<AppStatus, string> = {
  applied: "bg-slate-100 text-slate-700",
  under_review: "bg-sky-50 text-sky-700",
  interview: "bg-orange-50 text-orange-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};
