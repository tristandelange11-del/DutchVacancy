"""Vacancy completeness and lifecycle: no invented defaults, closing dates enforced,
closed vacancies hidden everywhere public, and the application route notifying the
right people without ever mailing reserved test addresses."""

import asyncio
import importlib
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

os.environ.setdefault("MONGO_URL", "mongodb://127.0.0.1:1")
os.environ.setdefault("DB_NAME", "dutchvacancy_test")

MODULES = (
    "server", "lib.db", "lib.auth", "routers.auth", "routers.jobs", "routers.employer",
    "routers.uploads", "routers.seo", "routers.payments", "routers.interviews", "routers.moderation",
)


def iso(days: float) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def job_payload(**overrides):
    body = {
        "title": "Barista",
        "city": "Utrecht",
        "category": "Hospitality & Events",
        "job_type": "part_time",
        "english_level": "english_only",
        "valid_through": iso(30),
    }
    body.update(overrides)
    return body


@pytest.fixture
def env(monkeypatch):
    from server import app

    db = AsyncMongoMockClient(tz_aware=True)["vac_" + uuid.uuid4().hex]
    for name in MODULES:
        module = importlib.import_module(name)
        if hasattr(module, "db"):
            monkeypatch.setattr(module, "db", db)
    monkeypatch.setattr("routers.auth.send_email", AsyncMock(return_value=True))
    mail = AsyncMock(return_value=True)
    monkeypatch.setattr("lib.applications.send_email", mail)
    monkeypatch.setenv("CONTACT_NOTIFICATION_EMAIL", "ops@dutchvacancy.test")
    monkeypatch.delenv("APPLICATION_OPS_EMAIL", raising=False)

    def signup(role, **extra):
        c = TestClient(app, base_url="https://testserver/api/")
        payload = {"name": f"{role.title()} Tester", "email": f"{role}-{uuid.uuid4().hex[:8]}@example.com",
                   "password": secrets.token_urlsafe(16) + "Aa1!", "role": role, **extra}
        r = c.post("/auth/register", json=payload)
        assert r.status_code == 200, r.text
        asyncio.run(db.users.update_one({"id": r.json()["id"]}, {"$set": {"email_verified": True}}))
        return c, r.json()

    employer, employer_user = signup("employer", company_name="Acme", company_city="Utrecht")
    student, _ = signup("student", lang="nl")
    anon = TestClient(app, base_url="https://testserver/api/")
    yield {"db": db, "mail": mail, "employer": employer, "employer_user": employer_user,
           "student": student, "anon": anon}
    for c in (employer, student, anon):
        c.close()


def insert_job(env, **fields):
    doc = {
        "id": uuid.uuid4().hex, "company_id": env["employer_user"]["company_id"], "company_name": "Acme",
        "title": "Seeded", "city": "Utrecht", "category": "Hospitality & Events", "job_type": "part_time",
        "english_level": "english_only", "permit_support": "none", "work_mode": "on_site",
        "description": "", "requirements": [], "perks": [], "published": True,
        "created_at": datetime.now(timezone.utc),
    }
    doc.update(fields)
    asyncio.run(env["db"].jobs.insert_one(dict(doc)))
    return doc["id"]


# --- publishing rules -------------------------------------------------------------

@pytest.mark.parametrize("overrides,code", [
    ({"valid_through": None}, "closing_date_required"),
    ({"valid_through": iso(-1)}, "closing_date_past"),
    ({"valid_through": iso(200)}, "closing_date_too_far"),
])
def test_published_vacancy_needs_a_sensible_closing_date(env, overrides, code):
    r = env["employer"].post("/employer/jobs", json=job_payload(**overrides))
    assert r.status_code == 422
    assert r.json()["detail"]["code"] == code


def test_unpublished_draft_may_omit_the_closing_date(env):
    r = env["employer"].post("/employer/jobs", json=job_payload(valid_through=None, published=False))
    assert r.status_code == 200, r.text


def test_pay_and_hours_are_never_invented(env):
    # An employer a person already approved, so the vacancy goes online straight away.
    asyncio.run(env["db"].companies.update_one(
        {"id": env["employer_user"]["company_id"]}, {"$set": {"moderation_trusted": True}}))
    r = env["employer"].post("/employer/jobs", json=job_payload())
    assert r.status_code == 200, r.text
    job = r.json()
    assert job["hourly_min"] is None and job["hourly_max"] is None and job["hours_per_week"] is None
    listed = env["anon"].get("/jobs").json()["items"]
    assert listed[0]["hourly_min"] is None and listed[0]["hours_per_week"] is None


def test_salary_range_must_be_ordered(env):
    r = env["employer"].post("/employer/jobs", json=job_payload(hourly_min=20, hourly_max=15))
    assert r.status_code == 422


# --- closed vacancies -----------------------------------------------------------------

def test_closed_vacancies_disappear_from_public_listings_but_stay_readable(env):
    open_id = insert_job(env, title="Open one", valid_through=datetime.now(timezone.utc) + timedelta(days=5))
    closed_id = insert_job(env, title="Closed one", valid_through=datetime.now(timezone.utc) - timedelta(days=1))

    ids = [j["id"] for j in env["anon"].get("/jobs").json()["items"]]
    assert open_id in ids and closed_id not in ids
    assert env["anon"].get("/stats").json()["jobs"] == 1
    sitemap = env["anon"].get("/seo/sitemap.xml").text
    assert open_id in sitemap and closed_id not in sitemap

    detail = env["anon"].get(f"/jobs/{closed_id}").json()["job"]
    assert detail["is_open"] is False and detail["closes_at"]


def test_legacy_vacancies_without_a_closing_date_expire_after_60_days(env):
    now = datetime.now(timezone.utc)
    fresh = insert_job(env, created_at=now - timedelta(days=10))
    stale = insert_job(env, created_at=now - timedelta(days=61))
    ids = [j["id"] for j in env["anon"].get("/jobs").json()["items"]]
    assert fresh in ids and stale not in ids


def test_applying_to_a_closed_vacancy_is_refused(env):
    closed_id = insert_job(env, valid_through=datetime.now(timezone.utc) - timedelta(hours=1))
    r = env["student"].post(f"/jobs/{closed_id}/apply", json={"motivation": "I would like this job a lot."})
    assert r.status_code == 409
    assert r.json()["detail"]["code"] == "job_closed"
    env["mail"].assert_not_awaited()


def test_promoting_a_closed_vacancy_is_refused(env):
    closed_id = insert_job(env, valid_through=datetime.now(timezone.utc) - timedelta(hours=1))
    r = env["employer"].post(f"/employer/jobs/{closed_id}/fresh-checkout")
    assert r.status_code == 409


def test_employer_dashboard_shows_open_and_closed_status(env):
    insert_job(env, title="Closed", valid_through=datetime.now(timezone.utc) - timedelta(days=1))
    insert_job(env, title="Open", valid_through=datetime.now(timezone.utc) + timedelta(days=1))
    rows = {j["title"]: j["is_open"] for j in env["employer"].get("/employer/jobs").json()}
    assert rows == {"Closed": False, "Open": True}


def test_average_wage_is_absent_rather_than_made_up(env):
    insert_job(env, valid_through=datetime.now(timezone.utc) + timedelta(days=5))
    assert env["anon"].get("/stats").json()["avg_hourly"] is None
    insert_job(env, valid_through=datetime.now(timezone.utc) + timedelta(days=5), hourly_min=14.0, hourly_max=16.0)
    insert_job(env, valid_through=datetime.now(timezone.utc) + timedelta(days=5),
               hourly_min=900.0, hourly_max=1100.0, salary_period="month")
    assert env["anon"].get("/stats").json()["avg_hourly"] == 15.0


# --- application route ---------------------------------------------------------------

def test_cv_is_enforced_only_when_the_employer_requires_it(env):
    job_id = insert_job(env, valid_through=datetime.now(timezone.utc) + timedelta(days=5), cv_required=True)
    body = {"motivation": "I would like this job a lot."}
    r = env["student"].post(f"/jobs/{job_id}/apply", json=body)
    assert r.status_code == 422 and r.json()["detail"]["code"] == "cv_required"
    r = env["student"].post(f"/jobs/{job_id}/apply", json={**body, "cv_url": "/api/cv/abc", "cv_filename": "cv.pdf"})
    assert r.status_code == 200, r.text


def test_test_addresses_are_recorded_as_skipped_not_failed(env):
    job_id = insert_job(env, valid_through=datetime.now(timezone.utc) + timedelta(days=5))
    r = env["student"].post(f"/jobs/{job_id}/apply", json={"motivation": "I would like this job a lot."})
    assert r.status_code == 200, r.text
    stored = asyncio.run(env["db"].applications.find_one({"id": r.json()["id"]}))
    assert stored["notification_status"]["student"] == "skipped_test_address"
    assert stored["notification_status"]["employer"] == "skipped_test_address"
    recipients = [c.args[0] for c in env["mail"].await_args_list]
    assert not any(a.endswith("@example.com") for a in recipients)


def test_successful_application_notifies_student_employer_and_ops(env):
    # Real-looking addresses so the non-test path runs; send_email itself is mocked.
    db = env["db"]
    asyncio.run(db.users.update_many({"role": "student"}, {"$set": {"email": "student-real@students.invalid-free.nl"}}))
    asyncio.run(db.users.update_many({"role": "employer"}, {"$set": {"email": "employer-real@acme-hiring.nl"}}))
    job_id = insert_job(env, title="Data intern", valid_through=datetime.now(timezone.utc) + timedelta(days=5))
    r = env["student"].post(f"/jobs/{job_id}/apply", json={"motivation": "I would like this job a lot."})
    assert r.status_code == 200, r.text

    recipients = [c.args[0] for c in env["mail"].await_args_list]
    assert "student-real@students.invalid-free.nl" in recipients
    assert "employer-real@acme-hiring.nl" in recipients
    assert "ops@dutchvacancy.test" in recipients
    student_mail = next(c for c in env["mail"].await_args_list if c.args[0].startswith("student-real"))
    assert "Sollicitatie ontvangen" in student_mail.args[1]  # the student registered in Dutch
    for call in env["mail"].await_args_list:
        assert "I would like this job" not in " ".join(str(a) for a in call.args)  # no motivation in mail

    stored = asyncio.run(env["db"].applications.find_one({"id": r.json()["id"]}))
    assert stored["notification_status"] == {"student": "sent", "employer": "sent", "ops": "sent"}


def test_error_codes_for_the_other_apply_failures(env):
    job_id = insert_job(env, valid_through=datetime.now(timezone.utc) + timedelta(days=5))
    body = {"motivation": "I would like this job a lot."}
    assert env["student"].post(f"/jobs/{job_id}/apply", json=body).status_code == 200
    again = env["student"].post(f"/jobs/{job_id}/apply", json=body)
    assert again.status_code == 409 and again.json()["detail"]["code"] == "already_applied"
    missing = env["student"].post("/jobs/nope/apply", json=body)
    assert missing.status_code == 404 and missing.json()["detail"]["code"] == "job_not_found"


# --- test addresses never receive mail ---------------------------------------------

@pytest.mark.parametrize("address,expected", [
    ("someone@example.com", True), ("x@sub.example", True), ("x@shop.test", True),
    ("x@foo.invalid", True), ("x@dutchvacancy.nl", False), ("tristan+student@gmail.com", False),
])
def test_reserved_test_domains_are_recognised(address, expected):
    from lib.email import is_test_address
    assert is_test_address(address) is expected


def test_send_email_never_contacts_resend_for_a_test_address(monkeypatch):
    import lib.email as email_module

    monkeypatch.setenv("RESEND_API_KEY", "re_live_looking_key")
    boom = AsyncMock(side_effect=AssertionError("network must not be touched"))
    monkeypatch.setattr(email_module.httpx.AsyncClient, "post", boom)
    sent = asyncio.run(email_module.send_email("student@example.com", "s", "t", "b", "a", "https://x"))
    assert sent is False
    boom.assert_not_awaited()
