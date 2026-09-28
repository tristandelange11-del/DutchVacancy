"""Minimal RFC 5545 (iCalendar) .ics builder for interview invites.

No external dependency: one VEVENT, always in UTC (a bare "Z" suffix), so every
calendar app — Outlook, Apple Calendar, Google Calendar — converts it to the
viewer's own time zone without needing a VTIMEZONE block.
"""

from datetime import datetime, timedelta, timezone

DEFAULT_DURATION_MINUTES = 45


def _escape(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
    )


def _fold(line: str) -> str:
    """RFC 5545 3.1: lines over 75 octets wrap, continuation lines start with a space."""
    if len(line.encode("utf-8")) <= 75:
        return line
    parts = []
    rest, limit = line, 75
    while len(rest.encode("utf-8")) > limit:
        cut = limit
        while len(rest[:cut].encode("utf-8")) > limit:
            cut -= 1
        parts.append(rest[:cut])
        rest = rest[cut:]
        limit = 74  # continuation lines lose one octet to the leading space
    parts.append(rest)
    return "\r\n ".join(parts)


def build_ics(
    *,
    uid: str,
    summary: str,
    description: str,
    location: str,
    start: datetime,
    duration_minutes: int = DEFAULT_DURATION_MINUTES,
) -> bytes:
    """A single-event iCalendar file. `start` must already be timezone-aware."""
    start_utc = start.astimezone(timezone.utc)
    end_utc = start_utc + timedelta(minutes=duration_minutes)

    def fmt(dt: datetime) -> str:
        return dt.strftime("%Y%m%dT%H%M%SZ")

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DutchVacancy//Interview Scheduling//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{fmt(datetime.now(timezone.utc))}",
        f"DTSTART:{fmt(start_utc)}",
        f"DTEND:{fmt(end_utc)}",
        f"SUMMARY:{_escape(summary)}",
        f"DESCRIPTION:{_escape(description)}",
        f"LOCATION:{_escape(location)}",
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
    return ("\r\n".join(_fold(line) for line in lines) + "\r\n").encode("utf-8")
