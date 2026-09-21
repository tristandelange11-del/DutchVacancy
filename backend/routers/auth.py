import hashlib
import os
import secrets
from datetime import timedelta
from typing import Any, Optional
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from lib.auth import (
    create_session,
    current_student,
    current_user,
    destroy_session,
    hash_password,
    now_utc,
    optional_user,
    verify_password,
)
from lib.db import db
from lib.email import send_email
from models.schemas import (
    Company,
    EmailRequest,
    LoginRequest,
    OkResponse,
    RegisterRequest,
    ResetPasswordRequest,
    StudentProfile,
    TokenRequest,
    User,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _app_url() -> str:
    return os.getenv("APP_URL", "http://localhost:5173").rstrip("/")


async def _new_token(user_id: str, purpose: str, minutes: int) -> str:
    raw = secrets.token_urlsafe(40)
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    await db.auth_tokens.delete_many({"user_id": user_id, "purpose": purpose})
    await db.auth_tokens.insert_one({
        "token_hash": token_hash,
        "user_id": user_id,
        "purpose": purpose,
        "created_at": now_utc(),
        "expires_at": now_utc() + timedelta(minutes=minutes),
    })
    return raw


async def _recent_token(user_id: str, purpose: str) -> bool:
    cutoff = now_utc() - timedelta(seconds=60)
    return bool(await db.auth_tokens.find_one({
        "user_id": user_id,
        "purpose": purpose,
        "created_at": {"$gt": cutoff},
    }))


async def _send_verification(user: dict[str, Any]) -> None:
    token = await _new_token(user["id"], "verify_email", 24 * 60)
    url = f"{_app_url()}/verify-email?token={quote(token)}"
    await send_email(
        user["email"],
        "Verify your DutchVacancy email",
        "Verify your email address",
        "Confirm your email address to apply for jobs or publish vacancies.",
        "Verify email",
        url,
    )


def to_user(doc: dict[str, Any]) -> User:
    return User(**{k: v for k, v in doc.items() if k not in ("_id", "password_hash")})


@router.post("/register", response_model=User)
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    company_id = None
    company_name = None
    if payload.role == "employer":
        name = (payload.company_name or "").strip()
        if not name:
            raise HTTPException(status_code=422, detail="Company name is required for employers")
        company = Company(
            name=name,
            city=(payload.company_city or "").strip(),
            logo_initials="".join(w[0] for w in name.split()[:2]).upper(),
        )
        await db.companies.insert_one(company.model_dump())
        company_id = company.id
        company_name = company.name

    user = User(
        email=email,
        name=payload.name.strip(),
        role=payload.role,
        company_id=company_id,
        company_name=company_name,
    )
    doc = user.model_dump()
    doc["password_hash"] = hash_password(payload.password)
    await db.users.insert_one(doc)
    await _send_verification(doc)
    await create_session(response, user.id)
    return user


@router.post("/resend-verification", response_model=OkResponse)
async def resend_verification(payload: EmailRequest):
    doc = await db.users.find_one({"email": payload.email.lower().strip()})
    if doc and not doc.get("email_verified", False) and not await _recent_token(doc["id"], "verify_email"):
        await _send_verification(doc)
    return OkResponse()


@router.post("/verify-email", response_model=OkResponse)
async def verify_email(payload: TokenRequest):
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    token = await db.auth_tokens.find_one_and_delete({
        "token_hash": token_hash,
        "purpose": "verify_email",
        "expires_at": {"$gt": now_utc()},
    })
    if not token:
        raise HTTPException(status_code=400, detail="This verification link is invalid or expired")
    await db.users.update_one({"id": token["user_id"]}, {"$set": {"email_verified": True}})
    return OkResponse()


@router.post("/forgot-password", response_model=OkResponse)
async def forgot_password(payload: EmailRequest):
    doc = await db.users.find_one({"email": payload.email.lower().strip()})
    if doc and not await _recent_token(doc["id"], "reset_password"):
        token = await _new_token(doc["id"], "reset_password", 60)
        url = f"{_app_url()}/reset-password?token={quote(token)}"
        await send_email(
            doc["email"],
            "Reset your DutchVacancy password",
            "Reset your password",
            "Use the button below to choose a new password. The link expires after one hour.",
            "Reset password",
            url,
        )
    return OkResponse()


@router.post("/reset-password", response_model=OkResponse)
async def reset_password(payload: ResetPasswordRequest):
    token_hash = hashlib.sha256(payload.token.encode()).hexdigest()
    token = await db.auth_tokens.find_one_and_delete({
        "token_hash": token_hash,
        "purpose": "reset_password",
        "expires_at": {"$gt": now_utc()},
    })
    if not token:
        raise HTTPException(status_code=400, detail="This reset link is invalid or expired")
    await db.users.update_one(
        {"id": token["user_id"]}, {"$set": {"password_hash": hash_password(payload.password)}}
    )
    await db.sessions.delete_many({"user_id": token["user_id"]})
    return OkResponse()


@router.delete("/account", response_model=OkResponse)
async def delete_account(user: dict[str, Any] = Depends(current_user)):
    uid = user["id"]
    if user.get("role") == "employer":
        cid = user.get("company_id")
        await db.applications.delete_many({"company_id": cid})
        await db.jobs.delete_many({"company_id": cid})
        await db.companies.delete_many({"id": cid})
    else:
        await db.applications.delete_many({"student_id": uid})
        await db.saved_jobs.delete_many({"student_id": uid})
        await db.cv_files.delete_many({"owner_id": uid})
    await db.sessions.delete_many({"user_id": uid})
    await db.auth_tokens.delete_many({"user_id": uid})
    await db.users.delete_one({"id": uid})
    return OkResponse()


@router.post("/login", response_model=User)
async def login(payload: LoginRequest, response: Response):
    doc = await db.users.find_one({"email": payload.email.lower().strip()})
    if not doc or not verify_password(payload.password, doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await create_session(response, doc["id"])
    return to_user(doc)


@router.post("/logout", response_model=OkResponse)
async def logout(request: Request, response: Response):
    await destroy_session(request, response)
    return OkResponse()


@router.get("/me", response_model=User)
async def me(user: dict[str, Any] = Depends(current_user)):
    return to_user(user)


@router.get("/session", response_model=Optional[User])
async def session(user: Optional[dict[str, Any]] = Depends(optional_user)):
    return to_user(user) if user else None


@router.put("/profile", response_model=User)
async def update_profile(
    profile: StudentProfile, user: dict[str, Any] = Depends(current_student)
):
    await db.users.update_one({"id": user["id"]}, {"$set": {"profile": profile.model_dump()}})
    doc = await db.users.find_one({"id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return to_user(doc)
