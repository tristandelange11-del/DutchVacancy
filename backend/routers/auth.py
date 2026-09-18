from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from lib.auth import (
    create_session,
    current_student,
    current_user,
    destroy_session,
    hash_password,
    optional_user,
    verify_password,
)
from lib.db import db
from models.schemas import (
    Company,
    LoginRequest,
    OkResponse,
    RegisterRequest,
    StudentProfile,
    User,
)

router = APIRouter(prefix="/auth", tags=["auth"])


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
    await create_session(response, user.id)
    return user


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
