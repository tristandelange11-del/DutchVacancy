"""Vacancy moderation: equal treatment and fake vacancies.

Three layers (memory/SPEC.md, "Moderation"):
  1. The vacancy form asks for the sensitive facts as fixed choices (English level, work
     permit) and never for age, gender or nationality.
  2. `check_vacancy` flags phrases that often signal unequal treatment under Dutch law
     (age, gender, origin or nationality, religion, appearance, health, family situation),
     in Dutch and English. It only flags: "ons jonge bedrijf" is fine, so a person
     decides. Flagged vacancies wait for review instead of going online.
  3. A person reviews every employer's first vacancy, every flagged one and every
     reported one, through a single-use link mailed to the contact inbox. Each step is
     written to `moderation_log`.
"""

import hashlib
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable, Optional

from lib.email import app_url, is_test_address, send_email
from lib.mail_text import lang_of, text
from lib.site import localized_path
from models.schemas import utcnow

REVIEW_DAYS = 30

# Category → patterns (case-insensitive, matched on word boundaries). A match is a reason
# to look, never a verdict: the employer sees a hint and a person makes the call.
_PATTERNS: dict[str, list[str]] = {
    "age": [
        r"(?:max(?:imaal|imum)?\.?|tot|onder|jonger dan|niet ouder dan)\s*\d{2}\s*jaar",
        r"tussen\s+(?:de\s+)?\d{2}\s+en\s+\d{2}\s+jaar",
        r"\d{2}\s*(?:-|–|tot)\s*\d{2}\s*jaar",
        r"jong(?:e|ere)?\s+(?:team|collega'?s?|mensen|medewerkers?|talent|enthousiastelingen)",
        r"jeugdig(?:e)?",
        r"(?:under|below|younger than|no older than|max(?:imum)? age(?: of)?)\s*\d{2}",
        r"(?:aged|between)\s+\d{2}\s*(?:-|–|and|to)\s*\d{2}",
        r"young\s+(?:team|people|talent|professionals?|and dynamic)",
    ],
    "gender": [
        r"(?:medewerkster|verkoopster|serveerster|kapster|schoonmaakster|kokkin|assistente|secretaresse"
        r"|gastvrouw|verpleegster|oppasster)s?",
        r"(?:jongens|meiden|meisjes|dames|heren|mannen|vrouwen)",
        r"(?:female|male|girls?|ladies|gentlemen|women only|men only)",
    ],
    "origin": [
        r"native(?:\s+|-)(?:speakers?|english|dutch|level)",
        r"moedertaal",
        r"(?:mother tongue|first language)",
        r"nederlandse\s+(?:nationaliteit|afkomst|achtergrond|paspoort)",
        r"dutch\s+(?:nationals?|nationality|citizens?|passport|background|origin)",
        r"(?:alleen|uitsluitend)\s+(?:eu|europese)",
        r"(?:eu\s+(?:citizens?|nationals?|passport)\s+only|only\s+eu\s+(?:citizens?|nationals?))",
        r"(?:geen|no)\s+(?:buitenlanders|allochtonen|expats|foreigners|internationals)",
        r"(?:autochto(?:on|ne)|allochto(?:on|ne))",
        r"(?:accentloos|accentvrij|without (?:an )?accent|no accent)",
        r"(?:huidskleur|skin colou?r)",
    ],
    "religion": [
        r"(?:hoofddoek|headscarf|hijab|keppel)",
        r"(?:religie|religion|geloof|christelijke?|islamitische?|moslims?|muslims?|christians?|joodse?|jewish)",
    ],
    "appearance": [
        # Bare "uiterlijk" usually means "at the latest" ("reageer uiterlijk vrijdag").
        r"(?:representatie(?:f|ve)|verzorgd|goed|aantrekkelijk)\s+uiterlijk",
        r"(?:good-?looking|attractive|aantrekkelijke?|slank(?:e)?|slender)",
        r"(?:tattoo'?s|tatoeages?|piercings?)",
        r"(?:met foto|foto\s+(?:meesturen|bijvoegen|toevoegen)|(?:photo|picture)\s+(?:required|attached)"
        r"|send (?:us )?(?:a|your) (?:photo|picture))",
    ],
    "health": [
        r"(?:goede gezondheid|kerngezond|fit en gezond|geen beperkingen?|zonder beperkingen?)",
        r"(?:zwanger(?:schap)?|pregnan(?:t|cy))",
        r"(?:good health|no disabilit(?:y|ies)|physically fit)",
    ],
    "personal": [
        r"(?:geen kinderen|zonder kinderen|kinderloos|ongehuwd|burgerlijke staat)",
        r"(?:no children|childless|unmarried|marital status)",
    ],
}

_COMPILED = {
    category: [re.compile(rf"(?<!\w){p}(?!\w)", re.IGNORECASE) for p in patterns]
    for category, patterns in _PATTERNS.items()
}

CATEGORIES = tuple(_PATTERNS)
_CHECKED_FIELDS = ("title", "description", "schedule", "requirements", "perks")


def _texts(vacancy: dict[str, Any]) -> Iterable[tuple[str, str]]:
    for field in _CHECKED_FIELDS:
        value = vacancy.get(field)
        if isinstance(value, str):
            yield field, value
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, str):
                    yield field, item


def check_vacancy(vacancy: dict[str, Any]) -> list[dict[str, str]]:
    """Phrases in the vacancy's own text that deserve a second look, once each."""
    findings: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for field, value in _texts(vacancy):
        for category, patterns in _COMPILED.items():
            for pattern in patterns:
                for match in pattern.finditer(value):
                    phrase = " ".join(match.group(0).split())
                    key = (category, phrase.lower())
                    if key not in seen:
                        seen.add(key)
                        findings.append({"category": category, "phrase": phrase, "field": field})
    return findings


def moderation_address() -> str:
    """The inbox that gets review links: the same one as contact requests."""
    return os.getenv("CONTACT_NOTIFICATION_EMAIL", "").strip()


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def log(db, job_id: str, action: str, by: str, **details: Any) -> None:
    await db.moderation_log.insert_one({"job_id": job_id, "action": action, "by": by, "at": utcnow(), **details})


async def has_public_vacancy(db, company_id: str, except_id: str) -> bool:
    """Whether a person already let one of this company's vacancies through."""
    doc = await db.jobs.find_one({
        "company_id": company_id,
        "id": {"$ne": except_id},
        "published": True,
        "moderation_status": {"$nin": ["pending", "rejected"]},
    })
    return doc is not None


async def open_review(db, job: dict[str, Any], reason: str, findings: list[dict[str, str]],
                      report: Optional[dict[str, Any]] = None) -> bool:
    """Create a single-use review link for `job` and mail it to the moderation inbox.

    Returns whether the mail went out. The review exists either way, so a failed mail
    can be resent from the log instead of the vacancy being lost in limbo.
    """
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    await db.moderation_reviews.insert_one({
        "token_hash": _hash(token),
        "job_id": job["id"],
        "reason": reason,
        "findings": findings,
        "created_at": now,
        "expires_at": now + timedelta(days=REVIEW_DAYS),
        "used_at": None,
    })
    reports = await db.job_reports.count_documents({"job_id": job["id"]})
    to = moderation_address()
    sent = False
    if to:
        lines = [
            f"Vacancy: {job.get('title', '')} — {job.get('company_name', '')} ({job.get('city', '')})",
            f"Why: {_REASONS.get(reason, reason)}",
        ]
        if findings:
            lines.append("Flagged phrases: " + "; ".join(f"{f['phrase']} ({f['category']})" for f in findings))
        if report:
            lines.append(f"Report: {report['reason']}" + (f" — {report['message']}" if report.get("message") else ""))
        lines.append(f"Reports on this vacancy so far: {reports}")
        lines.append(f"The link works once and expires after {REVIEW_DAYS} days.")
        sent = await send_email(
            to,
            f"[Review] {job.get('title', '')} ({job.get('company_name', '')})",
            "A vacancy needs your review",
            "\n".join(lines),
            "Review vacancy",
            f"{app_url()}/review/{token}",
        )
    await log(db, job["id"], "review_requested", "system", reason=reason, findings=findings,
              mail="sent" if sent else ("failed" if to else "not_configured"))
    return sent


_REASONS = {
    "first_vacancy": "first vacancy of this employer",
    "flagged": "phrases that may signal unequal treatment",
    "report": "reported by a visitor",
    "resubmitted": "changed after it was waiting for review or refused",
}


async def find_review(db, token: str) -> Optional[dict[str, Any]]:
    return await db.moderation_reviews.find_one({"token_hash": _hash(token)})


async def close_reviews(db, job_id: str, decision: str) -> None:
    """A decision settles every open review link of the vacancy, so no stale link can undo it."""
    await db.moderation_reviews.update_many(
        {"job_id": job_id, "used_at": None},
        {"$set": {"used_at": datetime.now(timezone.utc), "decision": decision}},
    )


async def forget_vacancies(db, job_ids: list[str]) -> None:
    """Reports and review links go with a deleted vacancy; the log of decisions stays."""
    await db.job_reports.delete_many({"job_id": {"$in": job_ids}})
    await db.moderation_reviews.delete_many({"job_id": {"$in": job_ids}})


async def notify_employers(db, job: dict[str, Any], decision: str, note: str = "") -> None:
    """Tell the company's employer accounts that their vacancy went online or was refused."""
    employers = await db.users.find({"company_id": job["company_id"], "role": "employer"}).to_list(20)
    for employer in employers:
        if is_test_address(employer["email"]):
            continue
        lang = lang_of(employer)
        kw = {"job": job.get("title", "")}
        await send_email(
            employer["email"],
            text(f"moderation_{decision}_subject", lang, **kw),
            text(f"moderation_{decision}_title", lang, **kw),
            text(f"moderation_{decision}_body", lang, note=note, **kw),
            text(f"moderation_{decision}_action", lang),
            f"{app_url()}{localized_path('/employer/dashboard', lang)}",
            lang=lang,
        )
