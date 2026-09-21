from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import current_employer, verified_employer
from lib.db import db
from models.schemas import (
    Application,
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
async def create_job(payload: JobCreate, user: dict[str, Any] = Depends(verified_employer)):
    job = Job(
        **payload.model_dump(),
        company_id=user["company_id"],
        company_name=user.get("company_name") or "",
    )
    await db.jobs.insert_one(job.model_dump())
    return job


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
