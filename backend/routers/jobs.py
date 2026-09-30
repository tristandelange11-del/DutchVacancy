from typing import Any, Optional
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from lib.applications import notify_application
from lib.auth import current_student, optional_user
from lib.db import db
from lib.contact import notify_contact
from lib.ratelimit import limiter
from lib.vacancies import closes_at, is_open, open_query
from models.schemas import (
    Application,
    ApplicationCreate,
    Company,
    ContactCreate,
    ContactMessage,
    Job,
    JobDetail,
    JobList,
    JobWithMeta,
    OkResponse,
    Stats,
)

router = APIRouter(tags=["jobs"])


def _error(status: int, code: str, message: str) -> HTTPException:
    """Errors the frontend translates by `code`; `message` is the English fallback."""
    return HTTPException(status_code=status, detail={"code": code, "message": message})


async def _decorate(
    jobs: list[dict[str, Any]], user: Optional[dict[str, Any]]
) -> list[JobWithMeta]:
    saved_ids: set[str] = set()
    applied_ids: set[str] = set()
    if user and user.get("role") == "student":
        saved = await db.saved_jobs.find({"student_id": user["id"]}).to_list(500)
        saved_ids = {s["job_id"] for s in saved}
        apps = await db.applications.find({"student_id": user["id"]}).to_list(500)
        applied_ids = {a["job_id"] for a in apps}
    now = datetime.now(timezone.utc)
    out = []
    for doc in jobs:
        clean = {k: v for k, v in doc.items() if k != "_id"}
        homepage_feature = bool(clean.pop("_homepage_feature", False))
        fresh_sponsored = bool(clean.pop("_fresh_sponsored", False))
        out.append(
            JobWithMeta(
                **clean,
                saved=clean["id"] in saved_ids,
                applied=clean["id"] in applied_ids,
                homepage_feature=homepage_feature,
                fresh_sponsored=fresh_sponsored,
                is_open=is_open(doc, now),
                closes_at=closes_at(doc),
            )
        )
    return out


@router.get("/jobs", response_model=JobList)
async def list_jobs(
    q: str = "",
    city: str = "",
    job_type: str = "",
    english_level: str = "",
    permit_support: str = "",
    work_mode: str = "",
    min_rate: float = 0,
    limit: int = Query(default=60, le=200),
    user: Optional[dict[str, Any]] = Depends(optional_user),
):
    conditions: list[dict[str, Any]] = [open_query(datetime.now(timezone.utc))]
    if q.strip():
        conditions.append({"$or": [
            {"title": {"$regex": q.strip(), "$options": "i"}},
            {"company_name": {"$regex": q.strip(), "$options": "i"}},
            {"description": {"$regex": q.strip(), "$options": "i"}},
        ]})
    if city:
        conditions.append({"city": city})
    if job_type:
        conditions.append({"job_type": job_type})
    if english_level:
        conditions.append({"english_level": english_level})
    if permit_support:
        conditions.append({"permit_support": permit_support})
    if work_mode:
        conditions.append({"work_mode": work_mode})
    if min_rate:
        # Only hourly wages are comparable to an hourly minimum; monthly pay and
        # vacancies without stated pay are left out rather than guessed.
        conditions.append({"hourly_max": {"$gte": min_rate}, "salary_period": {"$ne": "month"}})

    docs = await db.jobs.find({"$and": conditions}).sort("created_at", -1).to_list(limit)
    items = await _decorate(docs, user)
    return JobList(items=items, total=len(items))


@router.get("/stats", response_model=Stats)
async def stats():
    open_now = open_query(datetime.now(timezone.utc))
    jobs = await db.jobs.count_documents(open_now)
    employers = len(await db.jobs.distinct("company_id", open_now))
    english_only = await db.jobs.count_documents({"$and": [open_now, {"english_level": "english_only"}]})
    docs = await db.jobs.find(
        {"$and": [open_now, {"salary_period": {"$ne": "month"}, "hourly_min": {"$ne": None}, "hourly_max": {"$ne": None}}]},
        {"hourly_min": 1, "hourly_max": 1},
    ).to_list(500)
    rates = [(d["hourly_min"] + d["hourly_max"]) / 2 for d in docs if d.get("hourly_min") and d.get("hourly_max")]
    city_rows = await db.jobs.aggregate([
        {"$match": open_now},
        {"$group": {"_id": "$city", "count": {"$sum": 1}}},
    ]).to_list(500)
    city_counts = {
        str(row["_id"]): int(row["count"])
        for row in city_rows
        if row.get("_id")
    }
    return Stats(
        jobs=jobs,
        employers=employers,
        english_only=english_only,
        avg_hourly=round(sum(rates) / len(rates), 2) if rates else None,
        city_counts=city_counts,
    )


@router.get("/jobs/fresh", response_model=JobList)
async def fresh_jobs(user: Optional[dict[str, Any]] = Depends(optional_user)):
    now = datetime.now(timezone.utc)
    paid = await db.jobs.find({
        "$and": [open_query(now), {"fresh_until": {"$gt": now}}],
    }).sort("fresh_until", 1).to_list(3)
    paid_ids = [job["id"] for job in paid]
    remaining = 3 - len(paid)
    fillers: list[dict[str, Any]] = []
    if remaining:
        pipeline = [
            {"$match": {"$and": [open_query(now), {"id": {"$nin": paid_ids}}]}},
            {"$sample": {"size": remaining}},
        ]
        fillers = await db.jobs.aggregate(pipeline).to_list(remaining)
    for job in paid:
        job["_homepage_feature"] = True
        job["_fresh_sponsored"] = True
    for job in fillers:
        job["_homepage_feature"] = True
        job["_fresh_sponsored"] = False
    items = await _decorate(paid + fillers, user)
    return JobList(items=items, total=len(items))


@router.get("/jobs/{job_id}", response_model=JobDetail)
async def get_job(job_id: str, user: Optional[dict[str, Any]] = Depends(optional_user)):
    doc = await db.jobs.find_one({"id": job_id})
    is_owner = bool(
        user
        and user.get("role") == "employer"
        and user.get("company_id") == (doc or {}).get("company_id")
    )
    if not doc or (not doc.get("published", False) and not is_owner):
        raise HTTPException(status_code=404, detail="Job not found")
    items = await _decorate([doc], user)
    job = items[0]
    job.applicant_count = await db.applications.count_documents({"job_id": job_id})
    company_doc = await db.companies.find_one({"id": doc["company_id"]})
    company = (
        Company(**{k: v for k, v in company_doc.items() if k != "_id"}) if company_doc else None
    )
    return JobDetail(job=job, company=company)


@router.post("/jobs/{job_id}/apply", response_model=Application)
async def apply(
    job_id: str, payload: ApplicationCreate, user: dict[str, Any] = Depends(current_student)
):
    if not user.get("email_verified", False):
        raise _error(403, "email_not_verified", "Verify your email before applying")
    doc = await db.jobs.find_one({"id": job_id, "published": True})
    if not doc:
        raise _error(404, "job_not_found", "Job not found")
    if not is_open(doc, datetime.now(timezone.utc)):
        raise _error(409, "job_closed", "This vacancy is closed and no longer accepts applications")
    if await db.applications.find_one({"job_id": job_id, "student_id": user["id"]}):
        raise _error(409, "already_applied", "You already applied to this vacancy")
    cv_url = payload.cv_url or (user.get("profile") or {}).get("cv_url", "")
    if doc.get("cv_required") and not cv_url:
        raise _error(422, "cv_required", "This employer asks for a CV with every application")
    job = Job(**{k: v for k, v in doc.items() if k != "_id"})
    app = Application(
        job_id=job.id,
        job_title=job.title,
        company_name=job.company_name,
        company_id=job.company_id,
        student_id=user["id"],
        student_name=user["name"],
        student_email=user["email"],
        student_university=(user.get("profile") or {}).get("university", ""),
        motivation=payload.motivation,
        cv_url=cv_url,
        cv_filename=payload.cv_filename or (user.get("profile") or {}).get("cv_filename", ""),
    )
    doc_app = app.model_dump()
    await db.applications.insert_one(doc_app)
    # Stored first, notified second: a mail outage must never lose an application.
    employers = await db.users.find({"company_id": job.company_id, "role": "employer"}).to_list(20)
    delivery = await notify_application(doc_app, user.get("lang") or "en", employers)
    await db.applications.update_one({"id": app.id}, {"$set": {"notification_status": delivery}})
    return app


@router.get("/student/applications", response_model=list[Application])
async def my_applications(user: dict[str, Any] = Depends(current_student)):
    docs = await db.applications.find({"student_id": user["id"]}).sort("created_at", -1).to_list(200)
    return [Application(**{k: v for k, v in d.items() if k != "_id"}) for d in docs]


@router.get("/student/saved-jobs", response_model=list[JobWithMeta])
async def my_saved_jobs(user: dict[str, Any] = Depends(current_student)):
    saved = await db.saved_jobs.find({"student_id": user["id"]}).sort("created_at", -1).to_list(200)
    ids = [s["job_id"] for s in saved]
    docs = await db.jobs.find({"id": {"$in": ids}}).to_list(200)
    order = {jid: i for i, jid in enumerate(ids)}
    docs.sort(key=lambda d: order.get(d["id"], 999))
    return await _decorate(docs, user)


@router.post("/student/saved-jobs/{job_id}", response_model=OkResponse)
async def save_job(job_id: str, user: dict[str, Any] = Depends(current_student)):
    if not await db.jobs.find_one({"id": job_id}):
        raise HTTPException(status_code=404, detail="Job not found")
    await db.saved_jobs.update_one(
        {"student_id": user["id"], "job_id": job_id},
        {"$setOnInsert": {"student_id": user["id"], "job_id": job_id}},
        upsert=True,
    )
    return OkResponse()


@router.delete("/student/saved-jobs/{job_id}", response_model=OkResponse)
async def unsave_job(job_id: str, user: dict[str, Any] = Depends(current_student)):
    await db.saved_jobs.delete_many({"student_id": user["id"], "job_id": job_id})
    return OkResponse()


@router.post("/contact", response_model=OkResponse)
@limiter.limit("5/minute")
async def contact(request: Request, payload: ContactCreate):
    if not os.getenv("CONTACT_NOTIFICATION_EMAIL", "").strip() or not os.getenv("RESEND_API_KEY", "").strip():
        raise HTTPException(status_code=503, detail="Contact delivery is temporarily unavailable. Please try again later.")
    msg = ContactMessage(**payload.model_dump())
    doc = msg.model_dump()
    doc["notification_status"] = "pending"
    await db.contact_messages.insert_one(doc)
    if not await notify_contact(db, doc):
        raise HTTPException(status_code=503, detail="Your message was saved, but the notification could not be delivered. Please try again later.")
    return OkResponse()
