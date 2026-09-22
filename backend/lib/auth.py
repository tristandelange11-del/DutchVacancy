"""Session auth: httpOnly cookie + sessions collection. Never returns tokens in JSON."""

import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import Depends, HTTPException, Request, Response
from passlib.context import CryptContext

from lib.db import db

COOKIE_NAME = "dv_session"
SESSION_DAYS = 14

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(raw: str) -> str:
    return pwd_context.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(raw, hashed)
    except Exception:
        return False


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


async def create_session(response: Response, user_id: str) -> None:
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    await db.sessions.insert_one(
        {
            # Keep the legacy unique index satisfied during a rolling migration.
            # Both fields contain only the one-way hash, never the cookie value.
            "token": token_hash,
            "token_hash": token_hash,
            "user_id": user_id,
            "created_at": now_utc(),
            "expires_at": now_utc() + timedelta(days=SESSION_DAYS),
        }
    )
    response.set_cookie(
        COOKIE_NAME,
        token,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=SESSION_DAYS * 24 * 3600,
        path="/",
    )


async def destroy_session(request: Request, response: Response) -> None:
    token = request.cookies.get(COOKIE_NAME)
    if token:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        await db.sessions.delete_many({"token_hash": token_hash})
    response.delete_cookie(COOKIE_NAME, path="/")


async def optional_user(request: Request) -> Optional[dict[str, Any]]:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    sess = await db.sessions.find_one({"token_hash": token_hash})
    if not sess:
        return None
    exp = sess.get("expires_at")
    if isinstance(exp, datetime):
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < now_utc():
            await db.sessions.delete_many({"token_hash": token_hash})
            return None
    user = await db.users.find_one({"id": sess["user_id"]})
    return user


async def current_user(user: Optional[dict[str, Any]] = Depends(optional_user)) -> dict[str, Any]:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def current_student(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Student account required")
    return user


async def current_employer(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if user.get("role") != "employer":
        raise HTTPException(status_code=403, detail="Employer account required")
    return user
