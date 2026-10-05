// Hand-written mirrors of backend/models/schemas.py — keep in sync in the same edit.

export type Role = "student" | "employer";
export type EnglishLevel = "english_only" | "basic_dutch" | "dutch_required";
export type JobType = "part_time" | "internship" | "working_student" | "graduate";
export type PermitSupport = "twv_provided" | "eu_eea" | "freelance_kvk" | "none";
export type WorkMode = "on_site" | "hybrid" | "remote";
export type AppStatus = "applied" | "under_review" | "interview" | "accepted" | "rejected";
export type SalaryPeriod = "hour" | "month";
export type ContractType = "employment" | "on_call" | "agency" | "internship" | "freelance";
export type ScheduleTag = "evening" | "weekend" | "holiday";
/** approved: visible once published. pending: waits for a person. rejected: refused, with a reason. */
export type ModerationStatus = "approved" | "pending" | "rejected";

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
  lang: "en" | "nl";
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
  /** Gross pay in `salary_period` units; null when the employer did not state it. */
  hourly_min: number | null;
  hourly_max: number | null;
  salary_period: SalaryPeriod;
  hours_per_week: number | null;
  schedule: string;
  schedule_tags: ScheduleTag[];
  contract_type: ContractType | null;
  /** YYYY-MM-DD */
  start_date: string | null;
  /** Closing date (ISO). Required to publish. */
  valid_through: string | null;
  cv_required: boolean;
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
  moderation_status: ModerationStatus;
  /** Why a person refused the vacancy; empty otherwise. Only its own employer sees it. */
  moderation_note: string;
}

export interface JobWithMeta extends Job {
  saved: boolean;
  applied: boolean;
  applicant_count: number;
  homepage_feature: boolean;
  fresh_sponsored: boolean;
  is_open: boolean;
  closes_at: string | null;
}

export interface JobDetail {
  job: JobWithMeta;
  company: Company | null;
}

export interface JobList {
  items: JobWithMeta[];
  total: number;
}

export type InterviewMode = "online" | "on_location";

export interface Interview {
  mode: InterviewMode;
  location: string;
  note: string;
  slots: string[];
  chosen_slot: string | null;
  proposed_at: string;
}

export interface InterviewInput {
  mode: InterviewMode;
  location: string;
  note: string;
  slots: string[];
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
  interview: Interview | null;
  created_at: string;
}

export interface Stats {
  jobs: number;
  employers: number;
  english_only: number;
  avg_hourly: number | null;
  city_counts: Record<string, number>;
}

export interface OkResponse {
  ok: boolean;
}

export interface CheckoutResponse {
  url: string;
}

export interface PublicConfig {
  payments_enabled: boolean;
}

// ---------- moderation (mirrors the moderation models in backend/models/schemas.py) ----------

export type ModerationCategory = "age" | "gender" | "origin" | "religion" | "appearance" | "health" | "personal";

export interface ModerationFinding {
  category: ModerationCategory;
  phrase: string;
  field: string;
}

export interface VacancyText {
  title: string;
  description: string;
  schedule: string;
  requirements: string[];
  perks: string[];
}

export interface VacancyCheckResult {
  findings: ModerationFinding[];
}

export type ReportReason = "discrimination" | "scam" | "other";
export const REPORT_REASONS: ReportReason[] = ["discrimination", "scam", "other"];

export interface JobReportCreate {
  reason: ReportReason;
  message: string;
}

export type ReviewReason = "first_vacancy" | "flagged" | "report" | "resubmitted";

export interface ReviewReport {
  reason: ReportReason;
  message: string;
  created_at: string;
}

export interface ReviewView {
  reason: ReviewReason;
  findings: ModerationFinding[];
  reports: ReviewReport[];
  expires_at: string;
  job: Job;
}

export interface ReviewDecision {
  decision: "approve" | "reject";
  /** Required (at least 10 characters) to reject: it is mailed to the employer. */
  note: string;
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
export const CONTRACT_TYPES: ContractType[] = ["employment", "on_call", "agency", "internship", "freelance"];
export const SCHEDULE_TAGS: ScheduleTag[] = ["evening", "weekend", "holiday"];
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

// ---------- knowledge base (mirrors the Kb* models in backend/models/schemas.py) ----------

export type KbStatus = "draft" | "in_review" | "published";

export interface LocalizedText {
  en: string;
  nl: string;
}

export interface KbSection {
  title: LocalizedText;
  paragraphs: LocalizedText[];
}

export interface KbContact {
  body: string;
  label: LocalizedText;
  url: LocalizedText;
}

export interface KbJobLink {
  label: LocalizedText;
  /** Query string for /jobs — only filters with a stated value (e.g. english_level=english_only). */
  query: string;
}

export interface KbSource {
  publisher: string;
  title: LocalizedText;
  url: LocalizedText;
  en_available: boolean;
  checked_on: string;
}

export interface KbArticleSummary {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  status: KbStatus;
  /** Passed the publication gate. False = a draft shown for review only (never indexed). */
  live: boolean;
  sensitive: boolean;
  /** Date of the last real content review; null until reviewed. */
  reviewed_on: string | null;
  sources_checked_on: string;
}

export interface KbArticle extends KbArticleSummary {
  answer: LocalizedText[];
  applies_to: LocalizedText[];
  exceptions: LocalizedText[];
  next_steps: LocalizedText[];
  details: KbSection[];
  contacts: KbContact[];
  job_link: KbJobLink | null;
  employer_link: boolean;
  related: KbArticleSummary[];
  sources: KbSource[];
  author: string | null;
  reviewer: string | null;
}

// ---------- contact (mirrors ContactCreate in backend/models/schemas.py) ----------

export type ContactKind = "general" | "employer";

export interface ContactCreate {
  kind?: ContactKind;
  name: string;
  email: string;
  /** Required when kind is "employer". */
  company?: string;
  subject: string;
  message: string;
}
