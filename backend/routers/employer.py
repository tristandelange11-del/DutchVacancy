import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import httpx

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import current_employer
from lib.db import db
from lib.moderation import check_vacancy, close_reviews, forget_vacancies, has_public_vacancy, open_review
from lib.vacancies import MAX_LISTING_DAYS, closes_at, is_open, is_public
from models.schemas import (
    Application,
    CheckoutResponse,
    Company,
    Job,
    JobCreate,
    JobWithMeta,
    OkResponse,
    StatusUpdate,
    VacancyCheckResult,
    VacancyText,
    as_utc,
)

router = APIRouter(prefix="/employer", tags=["employer"])


def clean(doc: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in doc.items() if k != "_id"}


def _with_status(doc: dict[str, Any]) -> JobWithMeta:
    now = datetime.now(timezone.utc)
    return JobWithMeta(**clean(doc), is_open=is_open(doc, now), closes_at=closes_at(doc))


def _check_closing_date(payload: JobCreate) -> None:
    """A published vacancy needs a real closing date so it can never linger as an open job."""
    if not payload.published:
        return
    now = datetime.now(timezone.utc)
    if payload.valid_through is None:
        raise HTTPException(status_code=422, detail={
            "code": "closing_date_required", "message": "Set a closing date before publishing"})
    if payload.valid_through <= now:
        raise HTTPException(status_code=422, detail={
            "code": "closing_date_past", "message": "The closing date must be in the future to publish"})
    if payload.valid_through > now + timedelta(days=MAX_LISTING_DAYS):
        raise HTTPException(status_code=422, detail={
            "code": "closing_date_too_far",
            "message": f"The closing date can be at most {MAX_LISTING_DAYS} days ahead"})


async def _trusted(company_id: str, except_id: str) -> bool:
    """A person has let this company's vacancies through before."""
    company = await db.companies.find_one({"id": company_id}, {"moderation_trusted": 1})
    if company and company.get("moderation_trusted"):
        return True
    # Companies with public vacancies from before moderation existed count as trusted.
    return await has_public_vacancy(db, company_id, except_id)


async def _moderate(job: dict[str, Any], previous: Optional[str], was_public: bool) -> tuple[str, str, list]:
    """(status, review reason, findings) for a vacancy that is being saved.

    A published vacancy waits for a person when its text has a flagged phrase, when it
    was waiting or refused before, or when it is the first of a company no person has
    approved yet. Anything else is approved, and a vacancy that was already online stays
    online when it is edited without flagged phrases.
    """
    if not job.get("published"):
        return previous or "approved", "", []
    findings = check_vacancy(job)
    if findings:
        return "pending", "flagged", findings
    if previous in ("pending", "rejected"):
        return "pending", "resubmitted", []
    if was_public or await _trusted(job["company_id"], job["id"]):
        return "approved", "", []
    return "pending", "first_vacancy", []


async def _after_save(job: dict[str, Any], status: str, reason: str, findings: list) -> None:
    # Only a newly published or changed vacancy asks for a person; unpublishing one that
    # waits keeps its review link as it is.
    if reason:
        await close_reviews(db, job["id"], "superseded")
        await open_review(db, job, reason, findings)


@router.post("/jobs/check", response_model=VacancyCheckResult)
async def check_text(payload: VacancyText, user: dict[str, Any] = Depends(current_employer)):
    """Hints while typing: phrases a person would look at twice. Nothing is stored."""
    return VacancyCheckResult(findings=check_vacancy(payload.model_dump()))


@router.get("/company", response_model=Company)
async def get_company(user: dict[str, Any] = Depends(current_employer)):
    doc = await db.companies.find_one({"id": user.get("company_id")})
    if not doc:
        raise HTTPException(status_code=404, detail="Company not found")
    return Company(**clean(doc))


@router.put("/company", response_model=Company)
async def update_company(payload: Company, user: dict[str, Any] = Depends(current_employer)):
    cid = user.get("company_id")
    data = payload.model_dump()
    data["id"] = cid
    await db.companies.update_one({"id": cid}, {"$set": data})
    await db.jobs.update_many({"company_id": cid}, {"$set": {"company_name": data["name"]}})
    await db.users.update_one({"id": user["id"]}, {"$set": {"company_name": data["name"]}})
    return Company(**data)


@router.get("/jobs", response_model=list[JobWithMeta])
async def my_jobs(user: dict[str, Any] = Depends(current_employer)):
    docs = (
        await db.jobs.find({"company_id": user.get("company_id")})
        .sort("created_at", -1)
        .to_list(200)
    )
    return [_with_status(d) for d in docs]


@router.post("/jobs", response_model=Job)
async def create_job(payload: JobCreate, user: dict[str, Any] = Depends(current_employer)):
    if not user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Verify your email before publishing a vacancy")
    _check_closing_date(payload)
    job = Job(
        **payload.model_dump(),
        company_id=user["company_id"],
        company_name=user.get("company_name") or "",
    )
    status, reason, findings = await _moderate(job.model_dump(), None, was_public=False)
    job.moderation_status = status
    doc = job.model_dump()
    await db.jobs.insert_one(dict(doc))
    await _after_save(doc, status, reason, findings)
    return job


@router.post("/jobs/{job_id}/fresh-checkout", response_model=CheckoutResponse)
async def fresh_checkout(job_id: str, user: dict[str, Any] = Depends(current_employer)):
    if not user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Verify your email before promoting a vacancy")
    job = await db.jobs.find_one({"id": job_id, "company_id": user.get("company_id"), "published": True})
    if not job:
        raise HTTPException(status_code=404, detail="Published vacancy not found")
    now = datetime.now(timezone.utc)
    if not is_public(job):
        raise HTTPException(status_code=409, detail="This vacancy is not online yet; it is waiting for review")
    if not is_open(job, now):
        raise HTTPException(status_code=409, detail="This vacancy is closed; extend its closing date first")
    # Mongo returns naive UTC datetimes; comparing one to an aware `now` raised TypeError.
    if job.get("fresh_until") and as_utc(job["fresh_until"]) > now:
        raise HTTPException(status_code=409, detail="This vacancy already has an active Fresh placement")
    active = await db.jobs.count_documents({"published": True, "fresh_until": {"$gt": now}})
    if active >= 3:
        raise HTTPException(status_code=409, detail="All three Fresh Vacancy slots are currently occupied")

    api_key = os.getenv("STRIPE_SECRET_KEY", "").strip()
    app_url = os.getenv("APP_URL", "http://localhost:5173").rstrip("/")
    if not api_key:
        raise HTTPException(status_code=503, detail="Payments are not configured yet")
    data = {
        "mode": "payment",
        "success_url": f"{app_url}/employer/dashboard?fresh=success",
        "cancel_url": f"{app_url}/employer/dashboard?fresh=cancelled",
        "billing_address_collection": "required",
        "customer_creation": "always",
        "automatic_tax[enabled]": "true",
        "tax_id_collection[enabled]": "true",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "eur",
        "line_items[0][price_data][unit_amount]": "1495",
        "line_items[0][price_data][tax_behavior]": "exclusive",
        "line_items[0][price_data][product_data][name]": "Fresh Vacancy. 24 hours",
        "metadata[job_id]": job_id,
        "metadata[company_id]": user.get("company_id") or "",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.stripe.com/v1/checkout/sessions",
            headers={"Authorization": f"Bearer {api_key}"},
            data=data,
        )
    if response.is_error:
        raise HTTPException(status_code=502, detail="Could not start the payment")
    url = response.json().get("url")
    if not url:
        raise HTTPException(status_code=502, detail="Stripe did not return a checkout URL")
    return CheckoutResponse(url=url)


@router.put("/jobs/{job_id}", response_model=Job)
async def update_job(
    job_id: str, payload: JobCreate, user: dict[str, Any] = Depends(current_employer)
):
    doc = await db.jobs.find_one({"id": job_id, "company_id": user.get("company_id")})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    _check_closing_date(payload)
    merged = {**clean(doc), **payload.model_dump()}
    status, reason, findings = await _moderate(
        merged, doc.get("moderation_status") or "approved", was_public=is_public(doc))
    note = doc.get("moderation_note", "") if status == "rejected" else ""
    await db.jobs.update_one({"id": job_id}, {"$set": {
        **payload.model_dump(), "moderation_status": status, "moderation_note": note}})
    updated = await db.jobs.find_one({"id": job_id})
    assert updated is not None
    await _after_save(clean(updated), status, reason, findings)
    return Job(**clean(updated))


@router.delete("/jobs/{job_id}", response_model=OkResponse)
async def delete_job(job_id: str, user: dict[str, Any] = Depends(current_employer)):
    res = await db.jobs.delete_one({"id": job_id, "company_id": user.get("company_id")})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    await db.applications.delete_many({"job_id": job_id})
    await forget_vacancies(db, [job_id])
    return OkResponse()


@router.get("/applications", response_model=list[Application])
async def applicants(user: dict[str, Any] = Depends(current_employer)):
    docs = (
        await db.applications.find({"company_id": user.get("company_id")})
        .sort("created_at", -1)
        .to_list(300)
    )
    return [Application(**clean(d)) for d in docs]


@router.patch("/applications/{app_id}", response_model=Application)
async def set_status(
    app_id: str, payload: StatusUpdate, user: dict[str, Any] = Depends(current_employer)
):
    doc = await db.applications.find_one({"id": app_id, "company_id": user.get("company_id")})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    await db.applications.update_one({"id": app_id}, {"$set": {"status": payload.status}})
    updated = await db.applications.find_one({"id": app_id})
    assert updated is not None
    return Application(**clean(updated))
