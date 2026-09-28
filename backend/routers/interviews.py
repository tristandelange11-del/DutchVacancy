"""Interview scheduling: the employer proposes time slots, the candidate picks one."""

import base64
from datetime import timedelta
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Response

from lib.auth import current_employer, current_student, now_utc
from lib.db import db
from lib.email import app_url, send_email
from lib.ics import build_ics
from models.schemas import Application, Interview, InterviewProposal, SlotChoice, as_utc

router = APIRouter(tags=["interviews"])

MAX_DAYS_AHEAD = 90
AMSTERDAM = ZoneInfo("Europe/Amsterdam")


def _clean(doc: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in doc.items() if k != "_id"}


def _fmt(slot) -> str:
    return as_utc(slot).astimezone(AMSTERDAM).strftime("%A %d %B %Y, %H:%M") + " (Amsterdam time)"


def _ics_bytes(doc: dict[str, Any], interview: dict[str, Any], *, for_employer: bool) -> bytes:
    if for_employer:
        summary = f"Interview: {doc['student_name']} — {doc['job_title']}"
        description = f"Interview with {doc['student_name']} for {doc['job_title']}."
    else:
        summary = f"Interview: {doc['job_title']} at {doc['company_name']}"
        description = f"Interview for {doc['job_title']} at {doc['company_name']}."
    if interview.get("note"):
        description += f" {interview['note']}"
    return build_ics(
        uid=f"interview-{doc['id']}@dutchvacancy.nl",
        summary=summary,
        description=description,
        location=interview["location"],
        start=as_utc(interview["chosen_slot"]),
    )


def _ics_attachment(doc: dict[str, Any], interview: dict[str, Any], *, for_employer: bool) -> dict[str, str]:
    content = _ics_bytes(doc, interview, for_employer=for_employer)
    return {"filename": "interview.ics", "content": base64.b64encode(content).decode("ascii")}


def _ics_response(doc: dict[str, Any], *, for_employer: bool) -> Response:
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    interview = doc.get("interview")
    if not interview or not interview.get("chosen_slot"):
        raise HTTPException(status_code=409, detail="No confirmed interview time yet")
    content = _ics_bytes(doc, interview, for_employer=for_employer)
    return Response(
        content=content,
        media_type="text/calendar; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="interview.ics"'},
    )


@router.put("/employer/applications/{app_id}/interview", response_model=Application)
async def propose_interview(
    app_id: str, payload: InterviewProposal, user: dict[str, Any] = Depends(current_employer)
):
    doc = await db.applications.find_one({"id": app_id, "company_id": user.get("company_id")})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    if doc.get("status") in ("accepted", "rejected"):
        raise HTTPException(status_code=409, detail="This application is already closed")

    now = now_utc()
    if len(set(payload.slots)) != len(payload.slots):
        raise HTTPException(status_code=422, detail="Each proposed time must be different")
    if any(s <= now for s in payload.slots):
        raise HTTPException(status_code=422, detail="Proposed times must be in the future")
    if any(s > now + timedelta(days=MAX_DAYS_AHEAD) for s in payload.slots):
        raise HTTPException(status_code=422, detail=f"Proposed times must be within {MAX_DAYS_AHEAD} days")

    interview = Interview(
        mode=payload.mode,
        location=payload.location.strip(),
        note=payload.note.strip(),
        slots=sorted(payload.slots),
    )
    await db.applications.update_one(
        {"id": app_id}, {"$set": {"status": "interview", "interview": interview.model_dump()}}
    )
    updated = await db.applications.find_one({"id": app_id})
    assert updated is not None

    await send_email(
        doc["student_email"],
        f"Interview invitation from {doc['company_name']}: {doc['job_title']}",
        "Choose your interview time",
        f"{doc['company_name']} would like to invite you for an interview for {doc['job_title']}. "
        "Pick the time that suits you best.",
        "Choose a time",
        f"{app_url()}/student/applications/{app_id}/interview",
    )
    return Application(**_clean(updated))


@router.post("/student/applications/{app_id}/interview/choose", response_model=Application)
async def choose_slot(
    app_id: str, payload: SlotChoice, user: dict[str, Any] = Depends(current_student)
):
    doc = await db.applications.find_one({"id": app_id, "student_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    interview = doc.get("interview")
    if doc.get("status") != "interview" or not interview:
        raise HTTPException(status_code=409, detail="There is no interview waiting for a time")
    if interview.get("chosen_slot"):
        raise HTTPException(status_code=409, detail="You already chose a time for this interview")
    if payload.slot not in {as_utc(s) for s in interview["slots"]}:
        raise HTTPException(status_code=422, detail="That time was not offered")
    if payload.slot <= now_utc():
        raise HTTPException(status_code=409, detail="That time has already passed")

    result = await db.applications.update_one(
        {"id": app_id, "interview.chosen_slot": None},
        {"$set": {"interview.chosen_slot": payload.slot}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=409, detail="You already chose a time for this interview")
    updated = await db.applications.find_one({"id": app_id})
    assert updated is not None
    interview = updated["interview"]
    when = _fmt(payload.slot)

    await send_email(
        doc["student_email"],
        f"Interview confirmed: {when}",
        "Your interview is scheduled",
        f"Your interview with {doc['company_name']} for {doc['job_title']} is confirmed for {when}. "
        "Add it to your calendar with the attached file.",
        "Open dashboard",
        f"{app_url()}/student/dashboard",
        attachments=[_ics_attachment(doc, interview, for_employer=False)],
    )

    employers = await db.users.find({"company_id": doc["company_id"], "role": "employer"}).to_list(20)
    for employer in employers:
        await send_email(
            employer["email"],
            f"{doc['student_name']} chose an interview time",
            "Interview time confirmed",
            f"{doc['student_name']} will attend the interview for {doc['job_title']} on {when}. "
            "Add it to your calendar with the attached file.",
            "Open dashboard",
            f"{app_url()}/employer/dashboard",
            attachments=[_ics_attachment(doc, interview, for_employer=True)],
        )
    return Application(**_clean(updated))


@router.get("/student/applications/{app_id}/interview.ics")
async def student_interview_ics(app_id: str, user: dict[str, Any] = Depends(current_student)):
    doc = await db.applications.find_one({"id": app_id, "student_id": user["id"]})
    return _ics_response(doc, for_employer=False)


@router.get("/employer/applications/{app_id}/interview.ics")
async def employer_interview_ics(app_id: str, user: dict[str, Any] = Depends(current_employer)):
    doc = await db.applications.find_one({"id": app_id, "company_id": user.get("company_id")})
    return _ics_response(doc, for_employer=True)
