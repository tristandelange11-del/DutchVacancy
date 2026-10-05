"""Vacancy moderation (lib/moderation.py): flagged phrases, review before going online,
single-use review links and reports from visitors."""

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

from lib.moderation import check_vacancy

os.environ.setdefault("MONGO_URL", "mongodb://127.0.0.1:1")
os.environ.setdefault("DB_NAME", "dutchvacancy_test")

MODULES = (
    "server", "lib.db", "lib.auth", "routers.auth", "routers.jobs", "routers.employer",
    "routers.uploads", "routers.seo", "routers.payments", "routers.interviews", "routers.moderation",
)
OPS = "ops@dutchvacancy.test"


def iso(days: float) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def job_payload(**overrides):
    body = {
        "title": "Barista",
        "city": "Utrecht",
        "category": "Hospitality & Events",
        "job_type": "part_time",
        "english_level": "english_only",
        "description": "Make coffee and help guests in our café.",
        "valid_through": iso(30),
    }
    body.update(overrides)
    return body


@pytest.fixture
def env(monkeypatch):
    from server import app

    db = AsyncMongoMockClient(tz_aware=True)["mod_" + uuid.uuid4().hex]
    for name in MODULES:
        module = importlib.import_module(name)
        if hasattr(module, "db"):
            monkeypatch.setattr(module, "db", db)
    monkeypatch.setattr("routers.auth.send_email", AsyncMock(return_value=True))
    monkeypatch.setattr("lib.applications.send_email", AsyncMock(return_value=True))
    mail = AsyncMock(return_value=True)
    monkeypatch.setattr("lib.moderation.send_email", mail)
    monkeypatch.setenv("CONTACT_NOTIFICATION_EMAIL", OPS)
    monkeypatch.setenv("APP_URL", "https://dutchvacancy.test")

    def signup(role, email, **extra):
        c = TestClient(app, base_url="https://testserver/api/")
        payload = {"name": f"{role.title()} Tester", "email": email,
                   "password": secrets.token_urlsafe(16) + "Aa1!", "role": role, **extra}
        r = c.post("/auth/register", json=payload)
        assert r.status_code == 200, r.text
        asyncio.run(db.users.update_one({"id": r.json()["id"]}, {"$set": {"email_verified": True}}))
        return c, r.json()

    # A real-looking domain: employers on reserved test domains are never mailed.
    employer, employer_user = signup("employer", f"hr-{uuid.uuid4().hex[:8]}@acme-bv.nl",
                                     company_name="Acme", company_city="Utrecht", lang="nl")
    student, _ = signup("student", f"student-{uuid.uuid4().hex[:8]}@example.com")
    anon = TestClient(app, base_url="https://testserver/api/")
    yield {"db": db, "mail": mail, "employer": employer, "employer_user": employer_user,
           "student": student, "anon": anon}
    for c in (employer, student, anon):
        c.close()


def run(coro):
    return asyncio.run(coro)


def review_mails(env):
    return [c for c in env["mail"].await_args_list if c.args[0] == OPS]


def employer_mails(env):
    return [c for c in env["mail"].await_args_list if c.args[0] == env["employer_user"]["email"]]


def last_token(env) -> str:
    url = review_mails(env)[-1].args[5]
    assert url.startswith("https://dutchvacancy.test/review/")
    return url.rsplit("/", 1)[-1]


def trust(env):
    run(env["db"].companies.update_one(
        {"id": env["employer_user"]["company_id"]}, {"$set": {"moderation_trusted": True}}))


def post_job(env, **overrides):
    r = env["employer"].post("/employer/jobs", json=job_payload(**overrides))
    assert r.status_code == 200, r.text
    return r.json()


def public_ids(env):
    return [j["id"] for j in env["anon"].get("/jobs").json()["items"]]


def insert_job(env, **fields):
    doc = {
        "id": uuid.uuid4().hex, "company_id": env["employer_user"]["company_id"], "company_name": "Acme",
        "title": "Seeded", "city": "Utrecht", "category": "Hospitality & Events", "job_type": "part_time",
        "english_level": "english_only", "permit_support": "none", "work_mode": "on_site",
        "description": "", "requirements": [], "perks": [], "published": True,
        "valid_through": datetime.now(timezone.utc) + timedelta(days=30),
        "created_at": datetime.now(timezone.utc),
    }
    doc.update(fields)
    run(env["db"].jobs.insert_one(dict(doc)))
    return doc["id"]


# --- the word list ----------------------------------------------------------------

@pytest.mark.parametrize("text,category", [
    ("Je bent maximaal 25 jaar oud", "age"),
    ("Leeftijd tussen 18 en 25 jaar", "age"),
    ("Kom werken in ons jonge team", "age"),
    ("We are looking for someone under 30", "age"),
    ("Join our young and dynamic crew", "age"),
    ("Gezocht: enthousiaste verkoopster", "gender"),
    ("Wij zoeken meiden voor de bediening", "gender"),
    ("Ladies only for this role", "gender"),
    ("Nederlands als moedertaal", "origin"),
    ("Native English speaker required", "origin"),
    ("Alleen Nederlandse nationaliteit", "origin"),
    ("Dutch nationals only", "origin"),
    ("Accentloos Nederlands", "origin"),
    ("Geen hoofddoek tijdens het werk", "religion"),
    ("Representatief uiterlijk is een must", "appearance"),
    ("Please send a photo with your application", "appearance"),
    ("Geen zichtbare tattoo's", "appearance"),
    ("Je bent kerngezond", "health"),
    ("Not suitable when pregnant", "health"),
    ("Liefst geen kinderen", "personal"),
    ("Please state your marital status", "personal"),
])
def test_phrases_that_may_signal_unequal_treatment_are_flagged(text, category):
    findings = check_vacancy({"description": text})
    assert category in {f["category"] for f in findings}, findings


@pytest.mark.parametrize("text", [
    "Reageer uiterlijk vrijdag 9 oktober",
    "Ons jonge bedrijf groeit snel",
    "Je spreekt goed Engels (B2)",
    "Fluent English, Dutch is a plus",
    "Je werkt in een team van 25 collega's",
    "Students aged 16 and over may apply",
])
def test_neutral_text_is_not_flagged(text):
    assert check_vacancy({"description": text}) == []


def test_findings_name_the_field_and_appear_once():
    findings = check_vacancy({
        "title": "Verkoopster",
        "description": "Wij zoeken een verkoopster. Verkoopster gezocht!",
        "requirements": ["Nederlands als moedertaal"],
        "perks": ["Personeelskorting"],
    })
    assert findings == [
        {"category": "gender", "phrase": "Verkoopster", "field": "title"},
        {"category": "origin", "phrase": "moedertaal", "field": "requirements"},
    ]


def test_check_endpoint_gives_hints_to_employers_only(env):
    r = env["employer"].post("/employer/jobs/check", json={"description": "Max 25 jaar"})
    assert r.status_code == 200
    assert r.json()["findings"][0]["category"] == "age"
    assert env["anon"].post("/employer/jobs/check", json={"description": "x"}).status_code == 401
    assert env["student"].post("/employer/jobs/check", json={"description": "x"}).status_code == 403
    # Nothing is stored or mailed while typing.
    assert run(env["db"].moderation_reviews.count_documents({})) == 0
    assert env["mail"].await_count == 0


# --- the first vacancy waits for a person -------------------------------------------

def test_first_vacancy_waits_for_review_and_is_hidden_from_the_public(env):
    job = post_job(env)
    assert job["moderation_status"] == "pending"
    assert public_ids(env) == []
    assert env["anon"].get(f"/jobs/{job['id']}").status_code == 404
    assert env["student"].get(f"/jobs/{job['id']}").status_code == 404
    assert env["student"].post(f"/jobs/{job['id']}/apply", json={"motivation": "I would like this job."}).status_code == 404
    assert env["student"].post(f"/student/saved-jobs/{job['id']}").status_code == 404
    # Its own employer can still look at it.
    owner = env["employer"].get(f"/jobs/{job['id']}")
    assert owner.status_code == 200 and owner.json()["job"]["moderation_status"] == "pending"
    listed = env["employer"].get("/employer/jobs").json()
    assert listed[0]["moderation_status"] == "pending" and listed[0]["is_open"] is False

    [mail] = review_mails(env)
    assert mail.args[1] == "[Review] Barista (Acme)"
    assert "first vacancy of this employer" in mail.args[3]


def test_draft_is_not_sent_for_review(env):
    job = post_job(env, published=False, valid_through=None)
    assert job["moderation_status"] == "approved"
    assert review_mails(env) == []


def test_review_link_shows_the_vacancy_without_deciding(env):
    job = post_job(env)
    token = last_token(env)
    for _ in range(2):  # a mail scanner opening the link changes nothing
        r = env["anon"].get(f"/moderation/reviews/{token}")
        assert r.status_code == 200, r.text
    body = r.json()
    assert body["reason"] == "first_vacancy" and body["job"]["id"] == job["id"]
    assert body["findings"] == [] and body["reports"] == []
    assert env["employer"].get(f"/jobs/{job['id']}").json()["job"]["moderation_status"] == "pending"


def test_approval_publishes_mails_the_employer_and_trusts_the_company(env):
    job = post_job(env)
    token = last_token(env)
    r = env["anon"].post(f"/moderation/reviews/{token}", json={"decision": "approve"})
    assert r.status_code == 200, r.text
    assert public_ids(env) == [job["id"]]
    [mail] = employer_mails(env)
    assert mail.args[1] == "Je vacature staat online: Barista"
    assert mail.args[5] == "https://dutchvacancy.test/employer/dashboard"
    company = run(env["db"].companies.find_one({"id": job["company_id"]}))
    assert company["moderation_trusted"] is True

    # The next clean vacancy goes online straight away.
    second = post_job(env, title="Host")
    assert second["moderation_status"] == "approved"
    assert len(review_mails(env)) == 1
    actions = [d["action"] for d in run(env["db"].moderation_log.find({"job_id": job["id"]}).to_list(10))]
    assert actions == ["review_requested", "approved"]


def test_employer_cannot_mark_the_company_trusted(env):
    company = env["employer"].get("/employer/company").json()
    r = env["employer"].put("/employer/company", json={**company, "moderation_trusted": True})
    assert r.status_code == 200
    assert post_job(env)["moderation_status"] == "pending"


def test_existing_public_vacancies_count_as_approved(env):
    legacy = insert_job(env)  # stored before moderation existed: no status
    assert public_ids(env) == [legacy]
    job = post_job(env)
    assert job["moderation_status"] == "approved"


# --- flagged text -----------------------------------------------------------------

def test_flagged_text_waits_even_for_a_trusted_company(env):
    trust(env)
    job = post_job(env, requirements=["Native English speaker"])
    assert job["moderation_status"] == "pending"
    assert public_ids(env) == []
    view = env["anon"].get(f"/moderation/reviews/{last_token(env)}").json()
    assert view["reason"] == "flagged"
    assert view["findings"] == [{"category": "origin", "phrase": "Native English", "field": "requirements"}]
    assert "Native English (origin)" in review_mails(env)[-1].args[3]


def test_editing_an_online_vacancy(env):
    trust(env)
    job = post_job(env)
    r = env["employer"].put(f"/employer/jobs/{job['id']}", json=job_payload(title="Senior barista"))
    assert r.json()["moderation_status"] == "approved" and review_mails(env) == []
    r = env["employer"].put(f"/employer/jobs/{job['id']}", json=job_payload(description="Jong team, max 25 jaar"))
    assert r.json()["moderation_status"] == "pending"
    assert public_ids(env) == []
    assert env["anon"].get(f"/moderation/reviews/{last_token(env)}").json()["reason"] == "flagged"


# --- refusing ---------------------------------------------------------------------

def test_refusal_needs_a_reason(env):
    post_job(env)
    token = last_token(env)
    for note in ("", "Nee.", "          "):
        r = env["anon"].post(f"/moderation/reviews/{token}", json={"decision": "reject", "note": note})
        assert r.status_code == 422
    assert env["anon"].get(f"/moderation/reviews/{token}").status_code == 200


def test_refused_vacancy_stays_hidden_until_changed_and_reviewed_again(env):
    job = post_job(env, description="Gezocht: verkoopster, max 25 jaar")
    note = "Leeftijd en geslacht mogen geen eis zijn."
    r = env["anon"].post(f"/moderation/reviews/{last_token(env)}", json={"decision": "reject", "note": note})
    assert r.status_code == 200
    mine = env["employer"].get(f"/jobs/{job['id']}").json()["job"]
    assert mine["moderation_status"] == "rejected" and mine["moderation_note"] == note
    assert env["anon"].get(f"/jobs/{job['id']}").status_code == 404
    [mail] = employer_mails(env)
    assert mail.args[1] == "Je vacature moet worden aangepast: Barista"
    assert note in mail.args[3]
    company = run(env["db"].companies.find_one({"id": job["company_id"]}))
    assert not company.get("moderation_trusted")

    # A clean edit is reviewed again rather than going straight online.
    r = env["employer"].put(f"/employer/jobs/{job['id']}", json=job_payload())
    assert r.json()["moderation_status"] == "pending" and r.json()["moderation_note"] == ""
    assert env["anon"].get(f"/moderation/reviews/{last_token(env)}").json()["reason"] == "resubmitted"
    assert public_ids(env) == []


def test_fresh_placement_needs_an_online_vacancy(env):
    job = post_job(env)
    r = env["employer"].post(f"/employer/jobs/{job['id']}/fresh-checkout")
    assert r.status_code == 409 and "review" in r.json()["detail"]


# --- the review link --------------------------------------------------------------

def test_review_link_works_once(env):
    post_job(env)
    token = last_token(env)
    assert env["anon"].post(f"/moderation/reviews/{token}", json={"decision": "approve"}).status_code == 200
    again = env["anon"].post(f"/moderation/reviews/{token}", json={"decision": "reject", "note": "Toch niet goed."})
    opened = env["anon"].get(f"/moderation/reviews/{token}")
    for r in (again, opened):
        assert r.status_code == 410 and r.json()["detail"]["code"] == "review_used"
    assert len(public_ids(env)) == 1


def test_older_link_stops_working_when_the_vacancy_is_resubmitted(env):
    job = post_job(env)
    old = last_token(env)
    env["employer"].put(f"/employer/jobs/{job['id']}", json=job_payload(title="Host"))
    new = last_token(env)
    assert old != new
    assert env["anon"].get(f"/moderation/reviews/{old}").status_code == 410
    assert env["anon"].get(f"/moderation/reviews/{new}").status_code == 200


def test_expired_and_unknown_links(env):
    post_job(env)
    token = last_token(env)
    run(env["db"].moderation_reviews.update_many(
        {}, {"$set": {"expires_at": datetime.now(timezone.utc) - timedelta(minutes=1)}}))
    r = env["anon"].get(f"/moderation/reviews/{token}")
    assert r.status_code == 410 and r.json()["detail"]["code"] == "review_expired"
    r = env["anon"].get(f"/moderation/reviews/{'x' * 43}")
    assert r.status_code == 404 and r.json()["detail"]["code"] == "review_not_found"


def test_tokens_are_stored_hashed(env):
    post_job(env)
    token = last_token(env)
    review = run(env["db"].moderation_reviews.find_one({}))
    assert token not in str(review)


# --- reports from visitors --------------------------------------------------------

def test_visitor_can_report_an_online_vacancy(env):
    job_id = insert_job(env)
    r = env["anon"].post(f"/jobs/{job_id}/report", json={"reason": "discrimination", "message": "Asks for age"})
    assert r.status_code == 200, r.text
    # It stays online until a person decides.
    assert public_ids(env) == [job_id]
    [mail] = review_mails(env)
    assert "Report: discrimination — Asks for age" in mail.args[3]
    view = env["anon"].get(f"/moderation/reviews/{last_token(env)}").json()
    assert view["reason"] == "report"
    assert [(x["reason"], x["message"]) for x in view["reports"]] == [("discrimination", "Asks for age")]

    # A second report joins the waiting review instead of mailing again.
    env["anon"].post(f"/jobs/{job_id}/report", json={"reason": "scam"})
    assert len(review_mails(env)) == 1
    assert len(env["anon"].get(f"/moderation/reviews/{last_token(env)}").json()["reports"]) == 2


def test_report_that_is_dismissed_leaves_the_vacancy_online_quietly(env):
    job_id = insert_job(env)
    env["anon"].post(f"/jobs/{job_id}/report", json={"reason": "other"})
    env["anon"].post(f"/moderation/reviews/{last_token(env)}", json={"decision": "approve"})
    assert public_ids(env) == [job_id]
    assert employer_mails(env) == []


def test_report_that_is_upheld_takes_the_vacancy_offline(env):
    job_id = insert_job(env)
    env["anon"].post(f"/jobs/{job_id}/report", json={"reason": "discrimination"})
    note = "De tekst sluit kandidaten uit op afkomst."
    env["anon"].post(f"/moderation/reviews/{last_token(env)}", json={"decision": "reject", "note": note})
    assert public_ids(env) == []
    assert env["anon"].get(f"/jobs/{job_id}").status_code == 404
    assert len(employer_mails(env)) == 1


def test_report_validation(env):
    pending = post_job(env)
    assert env["anon"].post(f"/jobs/{pending['id']}/report", json={"reason": "scam"}).status_code == 404
    assert env["anon"].post("/jobs/nope/report", json={"reason": "scam"}).status_code == 404
    job_id = insert_job(env)
    assert env["anon"].post(f"/jobs/{job_id}/report", json={"reason": "boring"}).status_code == 422
    assert env["anon"].post(f"/jobs/{job_id}/report", json={"reason": "other", "message": "x" * 1001}).status_code == 422


def test_saved_list_drops_a_vacancy_taken_offline(env):
    job_id = insert_job(env)
    assert env["student"].post(f"/student/saved-jobs/{job_id}").status_code == 200
    assert [j["id"] for j in env["student"].get("/student/saved-jobs").json()] == [job_id]
    run(env["db"].jobs.update_one({"id": job_id}, {"$set": {"moderation_status": "rejected"}}))
    assert env["student"].get("/student/saved-jobs").json() == []


def test_unpublishing_a_waiting_vacancy_sends_no_new_review(env):
    job = post_job(env)
    r = env["employer"].put(f"/employer/jobs/{job['id']}", json=job_payload(published=False))
    assert r.json()["moderation_status"] == "pending"
    assert len(review_mails(env)) == 1


def test_deleting_a_vacancy_deletes_its_reports_and_review_links(env):
    job_id = insert_job(env)
    env["anon"].post(f"/jobs/{job_id}/report", json={"reason": "scam", "message": "Asks for a deposit"})
    assert env["employer"].delete(f"/employer/jobs/{job_id}").status_code == 200
    assert run(env["db"].job_reports.count_documents({})) == 0
    assert run(env["db"].moderation_reviews.count_documents({})) == 0
    # The record of what happened stays.
    assert run(env["db"].moderation_log.count_documents({"job_id": job_id})) == 2


def test_deleting_an_employer_account_deletes_its_reports(env):
    job_id = insert_job(env)
    env["anon"].post(f"/jobs/{job_id}/report", json={"reason": "other"})
    assert env["employer"].delete("/auth/account").status_code == 200
    assert run(env["db"].job_reports.count_documents({})) == 0
    assert run(env["db"].moderation_reviews.count_documents({})) == 0
