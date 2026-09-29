"""Shared rate limiter: in-memory, IP-keyed — fine for a single uvicorn worker (see
backend/Dockerfile's --workers 1); a multi-worker/multi-instance deploy would need a
shared backend (e.g. Redis) instead, since each process would otherwise count separately.

Disabled during tests via DISABLE_RATE_LIMITS (set in tests/conftest.py before `server`
is imported): the in-memory bucket is shared for the life of the process, so unrelated
test cases would otherwise trip each other's limits.
"""

import os

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, enabled=not os.environ.get("DISABLE_RATE_LIMITS"))
