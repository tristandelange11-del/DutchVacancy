"""Stripe webhook for the paid, 24-hour Fresh Vacancy placement."""

import hashlib
import hmac
import json
import os
import time
from datetime import timedelta

from fastapi import APIRouter, HTTPException, Request

from lib.auth import now_utc
from lib.db import db
from models.schemas import OkResponse

router = APIRouter(prefix="/payments", tags=["payments"])


def _valid_signature(payload: bytes, header: str, secret: str) -> bool:
    parts = {}
    for item in header.split(","):
        key, _, value = item.partition("=")
        parts.setdefault(key, []).append(value)
    try:
        timestamp = int(parts["t"][0])
    except (KeyError, ValueError, IndexError):
        return False
    if abs(time.time() - timestamp) > 300:
        return False
    signed = f"{timestamp}.".encode() + payload
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return any(hmac.compare_digest(expected, sig) for sig in parts.get("v1", []))


@router.post("/stripe/webhook", response_model=OkResponse)
async def stripe_webhook(request: Request):
    secret = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
    if not secret:
        raise HTTPException(status_code=503, detail="Stripe webhook is not configured")
    payload = await request.body()
    if not _valid_signature(payload, request.headers.get("stripe-signature", ""), secret):
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    event = json.loads(payload)
    if event.get("type") != "checkout.session.completed":
        return OkResponse()
    session = event.get("data", {}).get("object", {})
    if session.get("payment_status") != "paid":
        return OkResponse()
    if session.get("currency") != "eur" or int(session.get("amount_subtotal") or 0) != 1495:
        raise HTTPException(status_code=400, detail="Unexpected checkout amount")
    metadata = session.get("metadata") or {}
    job_id = metadata.get("job_id")
    company_id = metadata.get("company_id")
    if not job_id or not company_id:
        raise HTTPException(status_code=400, detail="Missing checkout metadata")

    existing = await db.jobs.find_one({"fresh_checkout_session_id": session.get("id")})
    if existing:
        return OkResponse()
    now = now_utc()
    active = await db.jobs.count_documents({"published": True, "fresh_until": {"$gt": now}})
    if active >= 3:
        await db.payment_events.insert_one({
            "stripe_session_id": session.get("id"),
            "job_id": job_id,
            "status": "manual_refund_required",
            "created_at": now,
        })
        return OkResponse()
    await db.jobs.update_one(
        {"id": job_id, "company_id": company_id, "published": True},
        {"$set": {
            "fresh_until": now + timedelta(hours=24),
            "fresh_payment_id": session.get("payment_intent") or session.get("id"),
            "fresh_checkout_session_id": session.get("id"),
        }},
    )
    return OkResponse()
