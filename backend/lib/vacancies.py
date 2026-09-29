"""When a vacancy counts as open — one definition for listings, stats, sitemap and applying.

A vacancy is open while it is published and its closing date (`valid_through`) lies in
the future. Vacancies created before closing dates existed have none; they are treated
as closing LEGACY_LISTING_DAYS after creation rather than staying open forever.
"""

from datetime import datetime, timedelta
from typing import Any, Optional

from models.schemas import as_utc

LEGACY_LISTING_DAYS = 60
MAX_LISTING_DAYS = 180


def closes_at(doc: dict[str, Any]) -> Optional[datetime]:
    if doc.get("valid_through"):
        return as_utc(doc["valid_through"])
    created = doc.get("created_at")
    return as_utc(created) + timedelta(days=LEGACY_LISTING_DAYS) if created else None


def is_open(doc: dict[str, Any], now: datetime) -> bool:
    end = closes_at(doc)
    return bool(doc.get("published")) and end is not None and end > now


def open_query(now: datetime) -> dict[str, Any]:
    """Mongo filter matching exactly the documents `is_open` accepts."""
    return {
        "published": True,
        "$or": [
            {"valid_through": {"$gt": now}},
            {"valid_through": None, "created_at": {"$gt": now - timedelta(days=LEGACY_LISTING_DAYS)}},
        ],
    }
