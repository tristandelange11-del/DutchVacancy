"""Contact notification delivery. Failed messages remain available for retry."""
import os
from html import escape

import httpx

from models.schemas import utcnow


def _subject(message: dict) -> str:
    if message.get("kind") == "employer":
        return f"DutchVacancy employer request: {message.get('company', '').strip()}"
    return "DutchVacancy contact message"


def _body(message: dict) -> str:
    lines = [f"From: {message['name']} <{message['email']}>"]
    if message.get("kind") == "employer":
        lines.append(f"Company: {message.get('company', '')}")
    lines.append(f"Subject: {message['subject']}")
    return "\n".join(lines) + f"\n\n{message['message']}"


async def notify_contact(db, message: dict) -> bool:
    recipient = os.getenv("CONTACT_NOTIFICATION_EMAIL", "").strip()
    key = os.getenv("RESEND_API_KEY", "").strip()
    if not recipient or not key:
        return False
    delivered = False
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {key}",
                         "Idempotency-Key": f"contact-{message['id']}"},
                json={
                    "from": os.getenv("EMAIL_FROM", "DutchVacancy <noreply@dutchvacancy.nl>"),
                    "to": [recipient],
                    "reply_to": message["email"],
                    "subject": _subject(message),
                    "text": _body(message),
                    "html": "<pre>" + escape(_body(message)) + "</pre>",
                },
            )
            delivered = response.is_success
    except httpx.HTTPError:
        pass
    await db.contact_messages.update_one(
        {"id": message["id"]},
        {"$set": {"notification_status": "sent" if delivered else "failed",
                  "notification_attempted_at": utcnow()},
         "$inc": {"notification_attempts": 1}},
    )
    return delivered
