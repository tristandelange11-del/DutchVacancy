"""Role separation criterion (server side): student cannot hit employer endpoints and
employers cannot hit student-only endpoints (403 not a state change).

Note: httpx's stdlib-based cookie jar does not honor the app's Secure-cookie session
for the bare host "localhost" over plain http (a known http.cookiejar quirk), so the
session token is captured from the login response and forwarded explicitly via the
Cookie header instead of relying on the client's automatic jar.
"""


def login_cookie(client, email: str, password: str) -> str:
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    token = r.cookies.get("dv_session")
    assert token
    return f"dv_session={token}"


def test_student_forbidden_from_employer_endpoint(client, account_factory):
    account = account_factory("student")
    cookie = login_cookie(client, account["email"], account["password"])
    r = client.get("/employer/jobs", headers={"Cookie": cookie})
    assert r.status_code == 403, r.text


def test_employer_forbidden_from_student_endpoint(client, account_factory):
    account = account_factory("employer")
    cookie = login_cookie(client, account["email"], account["password"])
    r = client.get("/student/applications", headers={"Cookie": cookie})
    assert r.status_code == 403, r.text
