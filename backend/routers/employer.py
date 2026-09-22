import os
from datetime import datetime, timezone
from typing import Any

import httpx

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import current_employer
from lib.db import db
from models.schemas import (
    Application,
    CheckoutResponse,
    Company,
    Job,
    JobCreate,
    OkResponse,
    StatusUpdate,
)

router = APIRouter(prefix="/employer", tags=["employer"])


def clean(doc: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in doc.items() if k != "_id"}


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


@router.get("/jobs", response_model=list[Job])
async def my_jobs(user: dict[str, Any] = Depends(current_employer)):
    docs = (
        await db.jobs.find({"company_id": user.get("company_id")})
        .sort("created_at", -1)
        .to_list(200)
    )
    return [Job(**clean(d)) for d in docs]


@router.post("/jobs", response_model=Job)
async def create_job(payload: JobCreate, user: dict[str, Any] = Depends(current_employer)):
    if not user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Verify your email before publishing a vacancy")
    job = Job(
        **payload.model_dump(),
        company_id=user["company_id"],
        company_name=user.get("company_name") or "",
    )
    await db.jobs.insert_one(job.model_dump())
    return job


@router.post("/jobs/{job_id}/fresh-checkout", response_model=CheckoutResponse)
async def fresh_checkout(job_id: str, user: dict[str, Any] = Depends(current_employer)):
    if not user.get("email_verified", False):
        raise HTTPException(status_code=403, detail="Verify your email before promoting a vacancy")
    job = await db.jobs.find_one({"id": job_id, "company_id": user.get("company_id"), "published": True})
    if not job:
        raise HTTPException(status_code=404, detail="Published vacancy not found")
    now = datetime.now(timezone.utc)
    if job.get("fresh_until") and job["fresh_until"] > now:
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
    await db.jobs.update_one({"id": job_id}, {"$set": payload.model_dump()})
    updated = await db.jobs.find_one({"id": job_id})
    assert updated is not None
    return Job(**clean(updated))


@router.delete("/jobs/{job_id}", response_model=OkResponse)
async def delete_job(job_id: str, user: dict[str, Any] = Depends(current_employer)):
    res = await db.jobs.delete_one({"id": job_id, "company_id": user.get("company_id")})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    await db.applications.delete_many({"job_id": job_id})
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
