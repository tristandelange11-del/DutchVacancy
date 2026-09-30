"""Error reports must never carry what visitors typed into a form."""

import asyncio

import sentry_sdk
from sentry_sdk.integrations.starlette import StarletteRequestExtractor
from starlette.requests import Request


def _json_request(body: bytes) -> Request:
    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/contact",
        "headers": [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode())],
        "query_string": b"",
    }
    return Request(scope, receive)


def test_request_bodies_are_never_attached_to_error_reports():
    from server import SENTRY_OPTIONS

    assert SENTRY_OPTIONS["send_default_pii"] is False
    assert SENTRY_OPTIONS["max_request_body_size"] == "never"

    body = b'{"name": "Jane", "email": "jane@example.com", "message": "private"}'
    sentry_sdk.init(dsn="https://public@example.invalid/1", default_integrations=False, **SENTRY_OPTIONS)
    try:
        info = asyncio.run(StarletteRequestExtractor(_json_request(body)).extract_request_info())
    finally:
        sentry_sdk.init(dsn=None)
    assert "jane@example.com" not in repr(info)
    assert "private" not in repr(info)
