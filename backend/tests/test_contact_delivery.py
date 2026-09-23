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
