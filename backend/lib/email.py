"""Transactional email via Resend. Missing RESEND_API_KEY logs and no-ops — a down or
unconfigured mail provider must never fail the request that triggered the email."""

import logging
import os

import resend

logger = logging.getLogger(__name__)

resend.api_key = os.environ.get("RESEND_API_KEY", "")

FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "DutchVacancy <onboarding@resend.dev>")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")


def _send(to: str, subject: str, html: str) -> None:
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not set — skipping email to %s (%s)", to, subject)
        return
    try:
        resend.Emails.send({"from": FROM_EMAIL, "to": [to], "subject": subject, "html": html})
    except Exception as exc:  # a mail provider outage must never break the caller's flow
        logger.error("Resend send to %s failed: %s", to, exc)


def send_verification_email(to: str, name: str, token: str) -> None:
    link = f"{FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#0f172a">
      <h2 style="margin-bottom:4px">Welcome to DutchVacancy, {name}</h2>
      <p>Confirm your email address to start applying to jobs or posting vacancies.</p>
      <p style="margin:24px 0">
        <a href="{link}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 22px;
          border-radius:8px;text-decoration:none;font-weight:600">Verify email</a>
      </p>
      <p style="color:#475569;font-size:13px">Or paste this link into your browser:<br>{link}</p>
      <p style="color:#94a3b8;font-size:12px">This link expires in 24 hours.</p>
    </div>
    """
    _send(to, "Confirm your DutchVacancy email", html)
