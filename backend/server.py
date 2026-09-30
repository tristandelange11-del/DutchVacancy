import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Error monitoring: must init before the app itself so the FastAPI integration
# auto-instruments (enabled automatically once `fastapi` is importable). No-ops
# without a DSN, so local dev and any environment that hasn't set one is unaffected.
import sentry_sdk  # noqa: E402

SENTRY_OPTIONS = dict(
    environment=os.environ.get('SENTRY_ENVIRONMENT', 'development'),
    # Error monitoring only — tracing/profiling were deliberately left off at
    # setup (this app's traffic doesn't need it yet, and it's extra volume/cost).
    traces_sample_rate=0.0,
    # No user IP or cookies. Stated explicitly even though it is the default.
    send_default_pii=False,
    # send_default_pii does NOT stop request bodies: the FastAPI integration attaches
    # JSON bodies to error events by default. Never send them — they hold names,
    # email addresses, motivations and messages.
    max_request_body_size='never',
)

_sentry_dsn = os.environ.get('SENTRY_DSN', '').strip()
if _sentry_dsn:
    sentry_sdk.init(dsn=_sentry_dsn, **SENTRY_OPTIONS)

# MongoDB connection
from lib.db import client, db, ensure_indexes
from lib.ratelimit import limiter


# Startup runs before the yield, shutdown after it. Add your own setup/teardown here.
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())  # background: a big index build must not block boot
    yield
    client.close()


# Create the main app without a prefix
app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def _rate_limited(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many attempts. Please wait a moment and try again."},
    )


# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


@api_router.get("/config")
async def public_config():
    """Expose feature availability without exposing secret values."""
    return {
        "payments_enabled": bool(
            os.environ.get("STRIPE_SECRET_KEY", "").strip()
            and os.environ.get("STRIPE_WEBHOOK_SECRET", "").strip()
        )
    }

# Feature routers
from routers.auth import router as auth_router  # noqa: E402
from routers.employer import router as employer_router  # noqa: E402
from routers.jobs import router as jobs_router  # noqa: E402
from routers.uploads import router as uploads_router  # noqa: E402
from routers.seo import router as seo_router  # noqa: E402
from routers.payments import router as payments_router  # noqa: E402
from routers.interviews import router as interviews_router  # noqa: E402
from routers.kb import router as kb_router  # noqa: E402

api_router.include_router(seo_router)
api_router.include_router(kb_router)
api_router.include_router(payments_router)
api_router.include_router(auth_router)
api_router.include_router(jobs_router)
api_router.include_router(employer_router)
api_router.include_router(interviews_router)
api_router.include_router(uploads_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in os.environ.get(
        'CORS_ORIGINS', os.environ.get('APP_URL', 'http://localhost:5173')
    ).split(',') if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
