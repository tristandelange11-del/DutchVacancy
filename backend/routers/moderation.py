"""Reviewing a vacancy through the single-use link mailed to the moderation inbox.

There are no moderator accounts: the link itself is the permission, like a password
reset link. It works for one decision and expires (lib/moderation.REVIEW_DAYS). Opening
it only shows the vacancy; deciding is a separate POST, so a mail scanner that follows
links can never approve or refuse anything.
"""

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from lib.db import db
from lib.moderation import close_reviews, find_review, log, notify_employers
from lib.ratelimit import limiter
from models.schemas import Job, OkResponse, ReviewDecision, ReviewReport, ReviewView, as_utc

router = APIRouter(prefix="/moderation", tags=["moderation"])


def _error(status: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status, detail={"code": code, "message": message})


async def _open_review(token: str) -> tuple[dict[str, Any], dict[str, Any]]:
    review = await find_review(db, token)
    if not review:
        raise _error(404, "review_not_found", "This review link does not exist")
    if review.get("used_at"):
        raise _error(410, "review_used", "This review link was already used")
    if as_utc(review["expires_at"]) <= datetime.now(timezone.utc):
        raise _error(410, "review_expired", "This review link has expired")
    job = await db.jobs.find_one({"id": review["job_id"]})
    if not job:
        raise _error(404, "job_not_found", "The vacancy no longer exists")
    return review, {k: v for k, v in job.items() if k != "_id"}


@router.get("/reviews/{token}", response_model=ReviewView)
@limiter.limit("30/minute")
async def view_review(request: Request, token: str):
    review, job = await _open_review(token)
    reports = await db.job_reports.find({"job_id": job["id"]}).sort("created_at", -1).to_list(50)
    return ReviewView(
        reason=review["reason"],
        findings=review.get("findings", []),
        reports=[ReviewReport(**{k: r[k] for k in ("reason", "message", "created_at")}) for r in reports],
        expires_at=review["expires_at"],
        job=Job(**job),
    )


@router.post("/reviews/{token}", response_model=OkResponse)
@limiter.limit("10/minute")
async def decide_review(request: Request, token: str, payload: ReviewDecision):
    review, job = await _open_review(token)
    note = payload.note.strip()
    if payload.decision == "approve":
        await db.jobs.update_one({"id": job["id"]}, {"$set": {"moderation_status": "approved", "moderation_note": ""}})
        # A person has now let this company through: its next vacancies only wait when flagged.
        await db.companies.update_one({"id": job["company_id"]}, {"$set": {"moderation_trusted": True}})
    else:
        await db.jobs.update_one({"id": job["id"]}, {"$set": {"moderation_status": "rejected", "moderation_note": note}})
    await close_reviews(db, job["id"], payload.decision)
    await log(db, job["id"], payload.decision + "d", "moderator", reason=review["reason"], note=note)
    was_online = job.get("moderation_status") not in ("pending", "rejected")
    # The employer hears about a change, not about a report that left an online vacancy online.
    if payload.decision == "reject" or not was_online:
        await notify_employers(db, job, "approved" if payload.decision == "approve" else "rejected", note)
    return OkResponse()
