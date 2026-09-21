"""Transactional email through Resend. Secrets are read only from environment variables."""

import logging
import os
from html import escape

import httpx

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, title: str, body: str, action: str, url: str) -> bool:
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    sender = os.getenv("EMAIL_FROM", "DutchVacancy <noreply@dutchvacancy.nl>").strip()
    if not api_key:
        logger.warning("RESEND_API_KEY is not configured. Email to %s was not sent.", to)
        return False

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033">
      <h1 style="font-size:24px">{escape(title)}</h1>
      <p style="line-height:1.6">{escape(body)}</p>
      <p style="margin:28px 0">
        <a href="{escape(url, quote=True)}" style="background:#f97316;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">{escape(action)}</a>
      </p>
      <p style="font-size:12px;color:#64748b">If you did not request this email, you can ignore it.</p>
    </div>
    """
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"from": sender, "to": [to], "subject": subject, "html": html},
        )
    if response.is_error:
        logger.error("Resend rejected email to %s: %s", to, response.text[:500])
        return False
    return True
