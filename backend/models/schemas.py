"""Pydantic v2 models. Each has a hand-written TS mirror in frontend/src/lib/types.ts."""

import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

Role = Literal["student", "employer"]
EnglishLevel = Literal["english_only", "basic_dutch", "dutch_required"]
JobType = Literal["part_time", "internship", "working_student", "graduate"]
PermitSupport = Literal["twv_provided", "eu_eea", "freelance_kvk", "none"]
WorkMode = Literal["on_site", "hybrid", "remote"]
AppStatus = Literal["applied", "under_review", "interview", "accepted", "rejected"]


def new_id() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


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
    profile: StudentProfile = Field(default_factory=StudentProfile)
    created_at: datetime = Field(default_factory=utcnow)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=2)
    role: Role
    company_name: Optional[str] = None
    company_city: Optional[str] = None


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
    hourly_min: float = 14.0
    hourly_max: float = 18.0
    hours_per_week: int = 16
    description: str = ""
    requirements: list[str] = Field(default_factory=list)
    perks: list[str] = Field(default_factory=list)
    published: bool = True


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
    avg_hourly: float


class ContactMessage(BaseModel):
    id: str = Field(default_factory=new_id)
    name: str = Field(min_length=2)
    email: EmailStr
    subject: str = Field(min_length=2)
    message: str = Field(min_length=10)
    created_at: datetime = Field(default_factory=utcnow)


class ContactCreate(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    subject: str = Field(min_length=2)
    message: str = Field(min_length=10)


class OkResponse(BaseModel):
    ok: bool = True


class CheckoutResponse(BaseModel):
    url: str
