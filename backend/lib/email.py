"""Transactional email through Resend. Secrets are read only from environment variables."""

import logging
import os
from html import escape
from typing import Optional

import httpx

from lib.mail_text import text

logger = logging.getLogger(__name__)

# RFC 2606 / 6761 reserved names. Test accounts and applications use these, so a test
# run can never email a real employer or candidate even with a live Resend key.
_RESERVED_DOMAINS = {"example.com", "example.org", "example.net"}
_RESERVED_SUFFIXES = (".example", ".test", ".invalid", ".localhost")


def is_test_address(address: str) -> bool:
    domain = address.rsplit("@", 1)[-1].strip().lower()
    return domain in _RESERVED_DOMAINS or domain.endswith(_RESERVED_SUFFIXES)


def app_url() -> str:
    return os.getenv("APP_URL", "http://localhost:5173").rstrip("/")


async def send_email(
    to: str,
    subject: str,
    title: str,
    body: str,
    action: str,
    url: str,
    attachments: Optional[list[dict[str, str]]] = None,
    lang: str = "en",
) -> bool:
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    sender = os.getenv("EMAIL_FROM", "DutchVacancy <noreply@dutchvacancy.nl>").strip()
    if is_test_address(to):
        logger.info("Email to reserved test address %s was not sent (%s).", to, subject)
        return False
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
      <p style="font-size:12px;color:#64748b">{escape(text("ignore_footer", lang))}</p>
    </div>
    """
    payload = {"from": sender, "to": [to], "subject": subject, "html": html}
    if attachments:
        payload["attachments"] = attachments
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
    except httpx.HTTPError as exc:
        logger.error("Resend request failed for %s: %s", to, exc)
        return False
    if response.is_error:
        logger.error("Resend rejected email to %s: %s", to, response.text[:500])
        return False
    return True
