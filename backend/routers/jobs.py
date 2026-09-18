from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from lib.auth import current_student, optional_user
from lib.db import db
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
    out = []
    for doc in jobs:
        clean = {k: v for k, v in doc.items() if k != "_id"}
        out.append(
            JobWithMeta(
                **clean,
                saved=clean["id"] in saved_ids,
                applied=clean["id"] in applied_ids,
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
    min_rate: float = 0,
    limit: int = Query(default=60, le=200),
    user: Optional[dict[str, Any]] = Depends(optional_user),
):
    query: dict[str, Any] = {"published": True}
    if q.strip():
        query["$or"] = [
            {"title": {"$regex": q.strip(), "$options": "i"}},
            {"company_name": {"$regex": q.strip(), "$options": "i"}},
            {"description": {"$regex": q.strip(), "$options": "i"}},
        ]
    if city:
        query["city"] = city
    if job_type:
        query["job_type"] = job_type
    if english_level:
        query["english_level"] = english_level
    if permit_support:
        query["permit_support"] = permit_support
    if min_rate:
        query["hourly_max"] = {"$gte": min_rate}

    docs = await db.jobs.find(query).sort("created_at", -1).to_list(limit)
    items = await _decorate(docs, user)
    return JobList(items=items, total=len(items))


@router.get("/stats", response_model=Stats)
async def stats():
    jobs = await db.jobs.count_documents({"published": True})
    employers = await db.companies.count_documents({})
    english_only = await db.jobs.count_documents({"published": True, "english_level": "english_only"})
    docs = await db.jobs.find({"published": True}, {"hourly_min": 1, "hourly_max": 1}).to_list(500)
    rates = [(d.get("hourly_min", 0) + d.get("hourly_max", 0)) / 2 for d in docs] or [0]
    return Stats(
        jobs=jobs,
        employers=employers,
        english_only=english_only,
        avg_hourly=round(sum(rates) / len(rates), 2),
    )


@router.get("/jobs/{job_id}", response_model=JobDetail)
async def get_job(job_id: str, user: Optional[dict[str, Any]] = Depends(optional_user)):
    doc = await db.jobs.find_one({"id": job_id})
    if not doc:
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
    doc = await db.jobs.find_one({"id": job_id, "published": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found")
    if await db.applications.find_one({"job_id": job_id, "student_id": user["id"]}):
        raise HTTPException(status_code=409, detail="You already applied to this vacancy")
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
        cv_url=payload.cv_url or (user.get("profile") or {}).get("cv_url", ""),
        cv_filename=payload.cv_filename or (user.get("profile") or {}).get("cv_filename", ""),
    )
    await db.applications.insert_one(app.model_dump())
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
async def contact(payload: ContactCreate):
    msg = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())
    return OkResponse()
