"""CV uploads. Bytes live in Mongo (no disk dependency); served back behind auth."""

from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile

from lib.auth import current_student, current_user
from lib.db import db
from models.schemas import CvUpload, new_id, utcnow

router = APIRouter(tags=["uploads"])

MAX_BYTES = 5 * 1024 * 1024
ALLOWED = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}


@router.post("/uploads/cv", response_model=CvUpload)
async def upload_cv(
    file: UploadFile = File(...), user: dict[str, Any] = Depends(current_student)
):
    content_type = file.content_type or ""
    filename = (file.filename or "cv").strip()
    if content_type not in ALLOWED and not filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=415, detail="Upload a PDF, DOC or DOCX file")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=422, detail="The file is empty")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="The file is larger than 5 MB")

    file_id = new_id()
    await db.cv_files.insert_one(
        {
            "id": file_id,
            "owner_id": user["id"],
            "filename": filename,
            "content_type": content_type or "application/pdf",
            "size": len(data),
            "data": data,
            "created_at": utcnow(),
        }
    )
    return CvUpload(id=file_id, url=f"/api/cv/{file_id}", filename=filename, size=len(data))


@router.get("/cv/{file_id}")
async def download_cv(file_id: str, user: dict[str, Any] = Depends(current_user)):
    doc = await db.cv_files.find_one({"id": file_id})
    if not doc:
        raise HTTPException(status_code=404, detail="CV not found")

    # The owning student always may read it; an employer only if this CV reached one of their vacancies.
    allowed = doc["owner_id"] == user["id"]
    if not allowed and user.get("role") == "employer":
        allowed = bool(
            await db.applications.find_one(
                {"company_id": user.get("company_id"), "cv_url": f"/api/cv/{file_id}"}
            )
        )
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed to view this CV")

    return Response(
        content=doc["data"],
        media_type=doc.get("content_type", "application/pdf"),
        headers={"Content-Disposition": f'inline; filename="{doc.get("filename", "cv")}"'},
    )
