"""Rate limiting on the endpoints most exposed to abuse: brute-forcing a login,
spamming account creation, enumerating emails via password reset, and flooding the
contact form. Disabled by default in tests (see conftest.py) — each test here turns
it on for itself only, and resets the shared in-memory bucket first so test order
and any earlier (disabled) traffic to these routes can't affect the count.
"""

import secrets
import uuid

import pytest

from lib.ratelimit import limiter


@pytest.fixture
def limited(client, monkeypatch):
    monkeypatch.setattr(limiter, "enabled", True)
    limiter.reset()
    yield client
    limiter.reset()


def test_register_is_rate_limited(limited):
    def attempt():
        payload = {
            "name": "Spam Bot",
            "email": f"spam-{uuid.uuid4().hex}@example.com",
            "password": secrets.token_urlsafe(16) + "Aa1!",
            "role": "student",
        }
        r = limited.post("/auth/register", json=payload)
        limited.cookies.clear()
        return r

    responses = [attempt() for _ in range(6)]
    assert [r.status_code for r in responses[:5]] == [200] * 5
    assert responses[5].status_code == 429
    assert responses[5].json()["detail"]


def test_login_is_rate_limited(limited):
    body = {"email": "nobody@example.com", "password": "wrong"}
    responses = [limited.post("/auth/login", json=body) for _ in range(11)]
    assert all(r.status_code == 401 for r in responses[:10])
    assert responses[10].status_code == 429


def test_forgot_password_is_rate_limited(limited):
    body = {"email": "nobody@example.com"}
    responses = [limited.post("/auth/forgot-password", json=body) for _ in range(6)]
    assert all(r.status_code == 200 for r in responses[:5])
    assert responses[5].status_code == 429


def test_resend_verification_is_rate_limited(limited):
    body = {"email": "nobody@example.com"}
    responses = [limited.post("/auth/resend-verification", json=body) for _ in range(6)]
    assert all(r.status_code == 200 for r in responses[:5])
    assert responses[5].status_code == 429


def test_contact_is_rate_limited(limited):
    body = {"name": "Spammer", "email": "spam@example.com", "subject": "hi", "message": "x" * 20}
    responses = [limited.post("/contact", json=body) for _ in range(6)]
    codes = [r.status_code for r in responses]
    # No RESEND_API_KEY/CONTACT_NOTIFICATION_EMAIL in tests, so the endpoint itself
    # returns 503 before rate limiting even matters — the limiter still must fire.
    assert all(c == 503 for c in codes[:5])
    assert codes[5] == 429


def test_endpoints_without_this_fixture_are_unaffected(client):
    """Sanity check: the module-level disable still holds for a plain `client`."""
    body = {"email": "nobody@example.com", "password": "wrong"}
    responses = [client.post("/auth/login", json=body) for _ in range(15)]
    assert all(r.status_code == 401 for r in responses)
