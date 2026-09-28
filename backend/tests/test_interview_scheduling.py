"""Interview scheduling: employer proposes slots, candidate picks one.

Self-contained: in-memory Mongo substitute, mocked email, no external services.
Datetimes come back from the mock as naive UTC, like real MongoDB, so the UTC
normalisation is exercised too.
"""

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
    "routers.uploads", "routers.seo", "routers.payments", "routers.interviews",
)


def future(days: int, hour: int = 10) -> str:
    dt = (datetime.now(timezone.utc) + timedelta(days=days)).replace(
        hour=hour, minute=0, second=0, microsecond=0
    )
    return dt.isoformat().replace("+00:00", "Z")


@pytest.fixture
def world(monkeypatch):
    from server import app

    db = AsyncMongoMockClient()["ivtest_" + uuid.uuid4().hex]
    for name in MODULES:
        module = importlib.import_module(name)
        if hasattr(module, "db"):
            monkeypatch.setattr(module, "db", db)
    monkeypatch.setattr("routers.auth.send_email", AsyncMock(return_value=True))
    mail = AsyncMock(return_value=True)
    monkeypatch.setattr("routers.interviews.send_email", mail)

    def new_client():
        return TestClient(app, base_url="https://testserver/api/")

    def signup(client, role, **extra):
        payload = {
            "name": f"{role.title()} Tester",
            "email": f"{role}-{uuid.uuid4().hex[:8]}@example.com",
            "password": secrets.token_urlsafe(16) + "Aa1!",
            "role": role,
            **extra,
        }
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 200, response.text
        return response.json()

    employer_client, student_client, other_employer_client, other_student_client = (
        new_client(), new_client(), new_client(), new_client()
    )
    company = {"company_name": "Acme", "company_city": "Amsterdam"}
    employer = signup(employer_client, "employer", **company)
    student = signup(student_client, "student")
    other_employer = signup(other_employer_client, "employer", company_name="Other BV", company_city="Utrecht")
    other_student = signup(other_student_client, "student")

    now = datetime.now(timezone.utc)
    application = {
        "id": uuid.uuid4().hex,
        "job_id": "job-1",
        "job_title": "Data Analyst",
        "company_name": "Acme",
        "company_id": employer["company_id"],
        "student_id": student["id"],
        "student_name": student["name"],
        "student_email": student["email"],
        "student_university": "",
        "motivation": "I would love to join the team.",
        "cv_url": "",
        "cv_filename": "",
        "status": "under_review",
        "created_at": now,
    }
    asyncio.run(db.applications.insert_one(dict(application)))

    yield {
        "db": db, "mail": mail, "app_id": application["id"],
        "employer": employer_client, "student": student_client,
        "other_employer": other_employer_client, "other_student": other_student_client,
    }
    for c in (employer_client, student_client, other_employer_client, other_student_client):
        c.close()


def proposal(**overrides):
    body = {
        "mode": "online",
        "location": "https://meet.example.com/abc",
        "note": "Bring your portfolio.",
        "slots": [future(3), future(4, 14)],
    }
    body.update(overrides)
    return body


def propose(world, **overrides):
    return world["employer"].put(f"/employer/applications/{world['app_id']}/interview", json=proposal(**overrides))


def test_propose_sets_interview_status_and_emails_candidate(world):
    r = propose(world)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "interview"
    assert body["interview"]["mode"] == "online"
    assert len(body["interview"]["slots"]) == 2
    assert body["interview"]["chosen_slot"] is None
    assert all(s.endswith("Z") or s.endswith("+00:00") for s in body["interview"]["slots"])

    world["mail"].assert_awaited_once()
    args = world["mail"].await_args.args
    assert args[0].endswith("@example.com") and args[0].startswith("student-")
    assert f"/student/applications/{world['app_id']}/interview" in args[5]


@pytest.mark.parametrize(
    "overrides,code",
    [
        ({"slots": [future(-1)]}, 422),
        ({"slots": [future(3), future(3)]}, 422),
        ({"slots": [future(200)]}, 422),
        ({"slots": []}, 422),
        ({"slots": [future(i + 1) for i in range(6)]}, 422),
        ({"location": ""}, 422),
        ({"mode": "carrier-pigeon"}, 422),
    ],
)
def test_propose_rejects_bad_input(world, overrides, code):
    assert propose(world, **overrides).status_code == code
    world["mail"].assert_not_awaited()


def test_propose_is_limited_to_own_company_and_employers(world):
    url = f"/employer/applications/{world['app_id']}/interview"
    assert world["other_employer"].put(url, json=proposal()).status_code == 404
    assert world["student"].put(url, json=proposal()).status_code == 403


def test_closed_application_cannot_get_interview(world):
    asyncio.run(world["db"].applications.update_one({"id": world["app_id"]}, {"$set": {"status": "rejected"}}))
    assert propose(world).status_code == 409


def test_student_chooses_offered_slot_and_employer_is_notified(world):
    slots = propose(world).json()["interview"]["slots"]
    world["mail"].reset_mock()

    r = world["student"].post(
        f"/student/applications/{world['app_id']}/interview/choose", json={"slot": slots[1]}
    )
    assert r.status_code == 200, r.text
    chosen = r.json()["interview"]["chosen_slot"]
    assert datetime.fromisoformat(chosen.replace("Z", "+00:00")) == datetime.fromisoformat(slots[1].replace("Z", "+00:00"))

    world["mail"].assert_awaited_once()
    assert world["mail"].await_args.args[0].startswith("employer-")

    listed = world["student"].get("/student/applications").json()
    assert listed[0]["interview"]["chosen_slot"] == chosen


def test_choice_can_only_be_made_once(world):
    slots = propose(world).json()["interview"]["slots"]
    url = f"/student/applications/{world['app_id']}/interview/choose"
    assert world["student"].post(url, json={"slot": slots[0]}).status_code == 200
    assert world["student"].post(url, json={"slot": slots[1]}).status_code == 409


def test_choice_must_be_one_of_the_offered_slots(world):
    propose(world)
    url = f"/student/applications/{world['app_id']}/interview/choose"
    assert world["student"].post(url, json={"slot": future(10)}).status_code == 422


def test_choice_requires_a_proposal_and_the_owning_student(world):
    url = f"/student/applications/{world['app_id']}/interview/choose"
    assert world["student"].post(url, json={"slot": future(3)}).status_code == 409
    slots = propose(world).json()["interview"]["slots"]
    assert world["other_student"].post(url, json={"slot": slots[0]}).status_code == 404
    assert world["employer"].post(url, json={"slot": slots[0]}).status_code == 403


def test_proposing_again_resets_the_chosen_time(world):
    slots = propose(world).json()["interview"]["slots"]
    url = f"/student/applications/{world['app_id']}/interview/choose"
    assert world["student"].post(url, json={"slot": slots[0]}).status_code == 200

    again = propose(world, slots=[future(6)]).json()
    assert again["interview"]["chosen_slot"] is None
    assert world["student"].post(url, json={"slot": again["interview"]["slots"][0]}).status_code == 200
