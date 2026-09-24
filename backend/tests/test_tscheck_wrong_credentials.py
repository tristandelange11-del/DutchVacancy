"""Correct and incorrect passwords on a fresh isolated account."""


def test_wrong_password_rejected(client, account_factory):
    account = account_factory()
    r = client.post(
        "/auth/login",
        json={"email": account["email"], "password": "WrongPassword999!"},
    )
    assert r.status_code == 401, r.text
    assert "invalid email or password" in r.json()["detail"].lower()


def test_correct_password_accepted(client, account_factory):
    account = account_factory()
    r = client.post(
        "/auth/login",
        json={"email": account["email"], "password": account["password"]},
    )
    assert r.status_code == 200, r.text
    assert r.json()["email"] == account["email"]
