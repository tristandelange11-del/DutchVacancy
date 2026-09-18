"""Wrong credentials criterion: bad password on seeded demo account is rejected with 401."""


def test_wrong_password_rejected(client):
    r = client.post(
        "/auth/login",
        json={"email": "student@dutchvacancy.nl", "password": "WrongPassword999!"},
    )
    assert r.status_code == 401, r.text
    assert "invalid email or password" in r.json()["detail"].lower()


def test_correct_password_accepted(client):
    r = client.post(
        "/auth/login",
        json={"email": "student@dutchvacancy.nl", "password": "Student123!"},
    )
    assert r.status_code == 200, r.text
    assert r.json()["email"] == "student@dutchvacancy.nl"
