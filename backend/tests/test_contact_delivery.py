import asyncio
import subprocess
import sys
from pathlib import Path
from unittest.mock import AsyncMock

import httpx
import pytest


@pytest.mark.parametrize("outcome", [200, 429, 500, "timeout"])
def test_contact_delivery(client, monkeypatch, outcome):
    from routers.jobs import db
    from lib import contact
    monkeypatch.setenv("CONTACT_NOTIFICATION_EMAIL", "owner@example.com")
    monkeypatch.setenv("RESEND_API_KEY", "test-only")
    post = AsyncMock()
    if outcome == "timeout":
        post.side_effect = httpx.ReadTimeout("test")
    else:
        post.return_value = httpx.Response(outcome)
    transport = AsyncMock()
    transport.__aenter__.return_value.post = post
    monkeypatch.setattr(contact.httpx, "AsyncClient", lambda **kwargs: transport)
    payload = {"name": "Test Visitor", "email": "visitor@example.com", "subject": "Question", "message": "<script>alert(1)</script>"}
    result = client.post("/contact", json=payload)
    assert result.status_code == (200 if outcome == 200 else 503)
    message = asyncio.run(db.contact_messages.find_one({}))
    assert message["notification_status"] == ("sent" if outcome == 200 else "failed")
    sent = post.call_args.kwargs
    assert sent["json"]["to"] == ["owner@example.com"]
    assert sent["json"]["reply_to"] == payload["email"]
    assert "<script>" not in sent["json"]["html"]
    assert sent["headers"]["Idempotency-Key"] == "contact-" + message["id"]


def test_unconfigured_contact_does_not_claim_success(client):
    result = client.post("/contact", json={"name": "Test Visitor", "email": "visitor@example.com", "subject": "Question", "message": "Please contact me about a vacancy."})
    assert result.status_code == 503


def test_seed_refuses_without_database_configuration():
    script = Path(__file__).resolve().parents[1] / "seed.py"
    result = subprocess.run([sys.executable, str(script)], env={}, capture_output=True, text=True)
    assert result.returncode != 0
    assert "No database was accessed" in result.stderr


def _capture_mail(monkeypatch):
    from lib import contact
    monkeypatch.setenv("CONTACT_NOTIFICATION_EMAIL", "owner@example.com")
    monkeypatch.setenv("RESEND_API_KEY", "test-only")
    post = AsyncMock(return_value=httpx.Response(200))
    transport = AsyncMock()
    transport.__aenter__.return_value.post = post
    monkeypatch.setattr(contact.httpx, "AsyncClient", lambda **kwargs: transport)
    return post


def test_employer_request_reaches_the_follow_up_mailbox_with_the_company(client, monkeypatch):
    from routers.jobs import db
    post = _capture_mail(monkeypatch)
    payload = {"kind": "employer", "name": "Test Employer", "email": "hr@example.com",
               "company": "Test Bakery BV", "subject": "Hiring students",
               "message": "We would like to hire two weekend students in Leiden."}
    assert client.post("/contact", json=payload).status_code == 200
    stored = asyncio.run(db.contact_messages.find_one({}))
    assert stored["kind"] == "employer" and stored["company"] == "Test Bakery BV"
    mail = post.call_args.kwargs["json"]
    assert mail["subject"] == "DutchVacancy employer request: Test Bakery BV"
    assert "Company: Test Bakery BV" in mail["text"]


def test_employer_request_without_company_is_rejected(client, monkeypatch):
    post = _capture_mail(monkeypatch)
    payload = {"kind": "employer", "name": "Test Employer", "email": "hr@example.com",
               "company": " ", "subject": "Hiring", "message": "We would like to hire students."}
    assert client.post("/contact", json=payload).status_code == 422
    post.assert_not_called()


def test_general_message_keeps_its_plain_subject(client, monkeypatch):
    post = _capture_mail(monkeypatch)
    payload = {"name": "Test Visitor", "email": "visitor@example.com", "subject": "Question",
               "message": "Where can I find the privacy policy?"}
    assert client.post("/contact", json=payload).status_code == 200
    mail = post.call_args.kwargs["json"]
    assert mail["subject"] == "DutchVacancy contact message"
    assert "Company:" not in mail["text"]
