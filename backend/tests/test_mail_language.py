"""Account mail follows the language stored on the account; dates are spelled per language."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock

import httpx

from lib.mail_text import format_slot


def test_slot_is_written_out_in_the_recipients_language_and_dutch_time():
    slot = datetime(2026, 10, 5, 12, 0, tzinfo=timezone.utc)  # 14:00 in Amsterdam (CEST)
    assert format_slot(slot, "en") == "Monday 5 October 2026, 14:00 (Amsterdam time)"
    assert format_slot(slot, "nl") == "maandag 5 oktober 2026, 14:00 (Nederlandse tijd)"
    assert format_slot(slot, "xx") == format_slot(slot, "en")


def test_verification_and_reset_mail_follow_the_account_language(client):
    from routers import auth

    payload = {"name": "Test Student", "email": "nl-student@example.com", "password": "Correct-Horse-1!",
               "role": "student", "lang": "nl"}
    assert client.post("/auth/register", json=payload).status_code == 200
    verify = auth.send_email.await_args
    assert verify.args[1] == "Bevestig je e-mailadres bij DutchVacancy"
    assert verify.kwargs["lang"] == "nl"

    client.cookies.clear()
    assert client.post("/auth/forgot-password", json={"email": "nl-student@example.com"}).status_code == 200
    reset = auth.send_email.await_args
    assert reset.args[1] == "Nieuw wachtwoord voor DutchVacancy"

    payload.update(email="en-student@example.com", lang="en")
    client.post("/auth/register", json=payload)
    assert auth.send_email.await_args.args[1] == "Verify your DutchVacancy email"


def test_mail_footer_is_in_the_recipients_language(monkeypatch):
    import asyncio

    from lib import email

    monkeypatch.setenv("RESEND_API_KEY", "test-only")
    post = AsyncMock(return_value=httpx.Response(200))
    transport = AsyncMock()
    transport.__aenter__.return_value.post = post
    monkeypatch.setattr(email.httpx, "AsyncClient", lambda **kwargs: transport)

    asyncio.run(email.send_email("someone@dutchvacancy.nl", "s", "t", "b", "a", "https://x", lang="nl"))
    assert "Heb je deze e-mail niet verwacht?" in post.call_args.kwargs["json"]["html"]
    asyncio.run(email.send_email("someone@dutchvacancy.nl", "s", "t", "b", "a", "https://x"))
    assert "If you did not request this email" in post.call_args.kwargs["json"]["html"]
