"""Pydantic v2 models. Each has a hand-written TS mirror in frontend/src/lib/types.ts."""

import uuid
from datetime import date, datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

Role = Literal["student", "employer"]
Lang = Literal["en", "nl"]
EnglishLevel = Literal["english_only", "basic_dutch", "dutch_required"]
JobType = Literal["part_time", "internship", "working_student", "graduate"]
PermitSupport = Literal["twv_provided", "eu_eea", "freelance_kvk", "none"]
WorkMode = Literal["on_site", "hybrid", "remote"]
SalaryPeriod = Literal["hour", "month"]
# Kept separate from job_type on purpose: loondienst, oproep, uitzend, stage and
# zelfstandig werk carry different rights and obligations and must not be merged.
ContractType = Literal["employment", "on_call", "agency", "internship", "freelance"]
ScheduleTag = Literal["evening", "weekend", "holiday"]
AppStatus = Literal["applied", "under_review", "interview", "accepted", "rejected"]
InterviewMode = Literal["online", "on_location"]


def new_id() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime) -> datetime:
    """MongoDB hands datetimes back naive (UTC); normalise so JSON always carries a UTC offset."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


class StudentProfile(BaseModel):
    university: str = ""
    study: str = ""
    city: str = ""
    english_level: str = "fluent"
    cv_url: str = ""
    cv_filename: str = ""
    bio: str = ""
    phone: str = ""


class CvUpload(BaseModel):
    id: str
    url: str
    filename: str
    size: int


class User(BaseModel):
    id: str = Field(default_factory=new_id)
    email: str
    name: str
    role: Role
    company_id: Optional[str] = None
    company_name: Optional[str] = None
    email_verified: bool = False
    lang: Lang = "en"
    profile: StudentProfile = Field(default_factory=StudentProfile)
    created_at: datetime = Field(default_factory=utcnow)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=2)
    role: Role
    company_name: Optional[str] = None
    company_city: Optional[str] = None
    lang: Lang = "en"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class EmailRequest(BaseModel):
    email: EmailStr


class TokenRequest(BaseModel):
    token: str = Field(min_length=20)


class ResetPasswordRequest(TokenRequest):
    password: str = Field(min_length=8)


class Company(BaseModel):
    id: str = Field(default_factory=new_id)
    name: str
    city: str = ""
    industry: str = ""
    website: str = ""
    about: str = ""
    logo_initials: str = ""


class JobBase(BaseModel):
    title: str = Field(min_length=3)
    city: str
    category: str
    job_type: JobType
    english_level: EnglishLevel
    permit_support: PermitSupport = "none"
    work_mode: WorkMode = "on_site"
    # Pay and hours are only shown when the employer states them — never defaulted.
    # The field names predate monthly pay: values are gross, in `salary_period` units.
    hourly_min: Optional[float] = Field(default=None, gt=0)
    hourly_max: Optional[float] = Field(default=None, gt=0)
    salary_period: SalaryPeriod = "hour"
    hours_per_week: Optional[int] = Field(default=None, ge=1, le=40)
    schedule: str = Field(default="", max_length=300)
    schedule_tags: list[ScheduleTag] = Field(default_factory=list)
    contract_type: Optional[ContractType] = None
    start_date: Optional[date] = None
    valid_through: Optional[datetime] = None
    cv_required: bool = False
    description: str = ""
    requirements: list[str] = Field(default_factory=list)
    perks: list[str] = Field(default_factory=list)
    published: bool = True

    @model_validator(mode="after")
    def _salary_range(self):
        if self.hourly_min is not None and self.hourly_max is not None and self.hourly_min > self.hourly_max:
            raise ValueError("The lowest salary must not exceed the highest salary")
        return self

    @field_validator("valid_through")
    @classmethod
    def _valid_through_utc(cls, value: Optional[datetime]) -> Optional[datetime]:
        return as_utc(value) if value else value


class JobCreate(JobBase):
    pass


class Job(JobBase):
    id: str = Field(default_factory=new_id)
    company_id: str
    company_name: str
    fresh_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=utcnow)


class JobWithMeta(Job):
    saved: bool = False
    applied: bool = False
    applicant_count: int = 0
    homepage_feature: bool = False
    fresh_sponsored: bool = False
    is_open: bool = True
    closes_at: Optional[datetime] = None


class JobDetail(BaseModel):
    job: JobWithMeta
    company: Optional[Company] = None


class JobList(BaseModel):
    items: list[JobWithMeta]
    total: int


class ApplicationCreate(BaseModel):
    motivation: str = Field(min_length=10)
    cv_url: str = ""
    cv_filename: str = ""


class InterviewProposal(BaseModel):
    mode: InterviewMode
    location: str = Field(min_length=2, max_length=300)  # meeting link (online) or address (on location)
    note: str = Field(default="", max_length=1000)
    slots: list[datetime] = Field(min_length=1, max_length=5)

    @field_validator("slots")
    @classmethod
    def _slots_utc(cls, value: list[datetime]) -> list[datetime]:
        return [as_utc(v) for v in value]


class Interview(BaseModel):
    mode: InterviewMode
    location: str
    note: str = ""
    slots: list[datetime]
    chosen_slot: Optional[datetime] = None
    proposed_at: datetime = Field(default_factory=utcnow)

    @field_validator("slots")
    @classmethod
    def _slots_utc(cls, value: list[datetime]) -> list[datetime]:
        return [as_utc(v) for v in value]

    @field_validator("chosen_slot", "proposed_at")
    @classmethod
    def _one_utc(cls, value: Optional[datetime]) -> Optional[datetime]:
        return as_utc(value) if value else value


class SlotChoice(BaseModel):
    slot: datetime

    @field_validator("slot")
    @classmethod
    def _slot_utc(cls, value: datetime) -> datetime:
        return as_utc(value)


class Application(BaseModel):
    id: str = Field(default_factory=new_id)
    job_id: str
    job_title: str
    company_name: str
    company_id: str
    student_id: str
    student_name: str
    student_email: str
    student_university: str = ""
    motivation: str
    cv_url: str = ""
    cv_filename: str = ""
    status: AppStatus = "applied"
    interview: Optional[Interview] = None
    created_at: datetime = Field(default_factory=utcnow)


class StatusUpdate(BaseModel):
    status: AppStatus


class SavedJob(BaseModel):
    id: str = Field(default_factory=new_id)
    student_id: str
    job_id: str
    created_at: datetime = Field(default_factory=utcnow)


class Stats(BaseModel):
    jobs: int
    employers: int
    english_only: int
    # None when no open vacancy states an hourly wage — never a made-up average.
    avg_hourly: Optional[float] = None
    city_counts: dict[str, int] = Field(default_factory=dict)


ContactKind = Literal["general", "employer"]


class ContactCreate(BaseModel):
    # "employer" = a hiring request from the employer page; it carries the company
    # so the follow-up owner can recognise it. Nothing else is asked for.
    kind: ContactKind = "general"
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: str = Field(default="", max_length=120)
    subject: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=10, max_length=5000)

    @model_validator(mode="after")
    def _employer_needs_company(self):
        if self.kind == "employer" and len(self.company.strip()) < 2:
            raise ValueError("company is required for an employer request")
        return self


class ContactMessage(ContactCreate):
    id: str = Field(default_factory=new_id)
    created_at: datetime = Field(default_factory=utcnow)


class OkResponse(BaseModel):
    ok: bool = True


class CheckoutResponse(BaseModel):
    url: str


# ---------- knowledge base (content lives in content/kb, not in MongoDB) ----------

KbStatus = Literal["draft", "in_review", "published"]


class LocalizedText(BaseModel):
    en: str
    nl: str


class KbSection(BaseModel):
    title: LocalizedText
    paragraphs: list[LocalizedText]


class KbContact(BaseModel):
    body: str
    label: LocalizedText
    url: LocalizedText


class KbJobLink(BaseModel):
    label: LocalizedText
    query: str


class KbSource(BaseModel):
    publisher: str
    title: LocalizedText
    url: LocalizedText
    en_available: bool
    checked_on: date


class KbArticleSummary(BaseModel):
    slug: str
    title: LocalizedText
    summary: LocalizedText
    status: KbStatus
    # True only when the article passed the publication gate; drafts are served
    # on staging for review and must never be indexed.
    live: bool
    sensitive: bool
    # The date of the last real content review — null until someone reviewed it.
    reviewed_on: Optional[date] = None
    # When the oldest of its official sources was last read.
    sources_checked_on: date


class KbArticle(KbArticleSummary):
    answer: list[LocalizedText]
    applies_to: list[LocalizedText]
    exceptions: list[LocalizedText]
    next_steps: list[LocalizedText]
    details: list[KbSection]
    contacts: list[KbContact]
    job_link: Optional[KbJobLink] = None
    employer_link: bool = False
    related: list[KbArticleSummary]
    sources: list[KbSource]
    author: Optional[str] = None
    reviewer: Optional[str] = None
