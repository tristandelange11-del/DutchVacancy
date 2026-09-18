"""Signup validation criterion: duplicate email rejected, employer without company name rejected."""

import uuid


def unique_email(prefix: str) -> str:
    return f"tscheck-{prefix}-{uuid.uuid4().hex[:8]}@example.com"


def test_duplicate_email_rejected(client):
    email = unique_email("dup")
    payload = {
        "name": "TSCheck Dup User",
        "email": email,
        "password": "Password123!",
        "role": "student",
    }
    r1 = client.post("/auth/register", json=payload)
    assert r1.status_code == 200, r1.text
    client.cookies.clear()

    r2 = client.post("/auth/register", json=payload)
    assert r2.status_code == 409, r2.text
    assert "already exists" in r2.json()["detail"].lower()


def test_employer_missing_company_name_rejected(client):
    email = unique_email("nocompany")
    payload = {
        "name": "TSCheck Employer",
        "email": email,
        "password": "Password123!",
        "role": "employer",
        "company_name": "",
        "company_city": "Amsterdam",
    }
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 422, r.text

    # confirm no account was created
    login = client.post("/auth/login", json={"email": email, "password": "Password123!"})
    assert login.status_code == 401, login.text
