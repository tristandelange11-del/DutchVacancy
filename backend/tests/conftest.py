"""Isolated route tests: real FastAPI routes, in-memory Mongo substitute, mocked email.

No staging accounts or externally hosted backend are accessed. MongoDB deployment
and index behaviour still require separate integration validation.
"""

import os
import sys
import importlib
import secrets
import uuid
from pathlib import Path
from unittest.mock import AsyncMock

import httpx
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
# Always use an isolated database, regardless of developer environment settings.
os.environ["MONGO_URL"] = "mongodb://127.0.0.1:1"
os.environ["DB_NAME"] = "dutchvacancy_test"

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8001")
API_URL = f"{BACKEND_URL}/api"


def api_url(path: str = "") -> str:
    """Absolute URL for an /api route: api_url("/status") -> http://localhost:8001/api/status."""
    return f"{API_URL}{path}"


@pytest.fixture(scope="session")
def backend_url() -> str:
    return BACKEND_URL


@pytest.fixture
def client(monkeypatch):
    """Sync httpx client rooted at /api — the default for endpoint tests.

    Example:
        def test_status(client):
            assert client.get("/status").status_code == 200
    """
    from server import app
    test_db = AsyncMongoMockClient(tz_aware=True)["test_" + uuid.uuid4().hex]
    for name in ("server", "lib.db", "lib.auth", "routers.auth", "routers.jobs",
                 "routers.employer", "routers.uploads", "routers.seo", "routers.payments"):
        module = importlib.import_module(name)
        if hasattr(module, "db"):
            monkeypatch.setattr(module, "db", test_db)
    monkeypatch.setattr("routers.auth.send_email", AsyncMock(return_value=True))
    # No real external mail is allowed in route tests.
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    monkeypatch.delenv("CONTACT_NOTIFICATION_EMAIL", raising=False)
    c = TestClient(app, base_url="https://testserver/api/")
    yield c
    c.close()


@pytest_asyncio.fixture
async def aclient(client):
    """Async variant, for tests that also await motor/backend helpers directly."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=client.app), base_url="https://testserver/api/", trust_env=False) as c:
        yield c


# --- app-specific fixtures below this line ---

@pytest.fixture
def account_factory(client):
    def create(role="student"):
        payload = {"name": "Test User", "email": f"test-{uuid.uuid4().hex}@example.com",
                   "password": secrets.token_urlsafe(24) + "Aa1!", "role": role}
        if role == "employer":
            payload.update(company_name="Test Company", company_city="Amsterdam")
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 200, response.text
        client.cookies.clear()
        return payload
    return create
