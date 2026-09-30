"""Knowledge base registry and publication gate.

An article reaches production only when `publication_problems()` is empty:
published status, a named author, and — for sensitive articles — a named
reviewer and a real review date that is not older than any claim check.
Drafts are only served where KB_SHOW_DRAFTS=1 (staging, local).
"""

import os
from datetime import date
from typing import Optional
from urllib.parse import urlparse

from content.kb.articles import (
    documents_to_start,
    employment_contract,
    health_insurance,
    jobs_without_dutch,
    start_working,
    twv_work_permit,
    work_and_exams,
)
from content.kb.model import Article
from content.kb.sources import OFFICIAL_DOMAINS, SOURCES

ARTICLES: tuple[Article, ...] = tuple(
    sorted(
        (
            start_working.ARTICLE,
            twv_work_permit.ARTICLE,
            health_insurance.ARTICLE,
            documents_to_start.ARTICLE,
            employment_contract.ARTICLE,
            jobs_without_dutch.ARTICLE,
            work_and_exams.ARTICLE,
        ),
        key=lambda a: a.order,
    )
)
BY_SLUG: dict[str, Article] = {a.slug: a for a in ARTICLES}

# Contacts may point at an official body's own site that is not itself used as
# a source (e.g. toeslagen.nl for applying).
CONTACT_DOMAINS = OFFICIAL_DOMAINS + ("toeslagen.nl",)


def is_official(url: str, domains: tuple[str, ...] = OFFICIAL_DOMAINS) -> bool:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    return parsed.scheme == "https" and any(host == d or host.endswith("." + d) for d in domains)


def show_drafts() -> bool:
    return os.environ.get("KB_SHOW_DRAFTS", "").strip() == "1"


def publication_problems(article: Article, today: Optional[date] = None) -> list[str]:
    """Why this article may not be live on production. Empty means it may."""
    today = today or date.today()
    problems: list[str] = []
    if article.status != "published":
        problems.append(f"status is '{article.status}', not 'published'")
    if not (article.author or "").strip():
        problems.append("no named author or editor")
    if article.sensitive and not (article.reviewer or "").strip():
        problems.append("sensitive article without a designated content reviewer")
    if article.reviewed_on is None:
        problems.append("no content review date")
    else:
        if article.reviewed_on > today:
            problems.append("review date lies in the future")
        latest_check = max((c.checked_on for c in article.claims), default=None)
        if latest_check and article.reviewed_on < latest_check:
            problems.append("a claim was re-checked after the last content review")
    return problems


def review_warnings(article: Article, today: Optional[date] = None) -> list[str]:
    """Signals that a published article needs another look. Not a gate."""
    today = today or date.today()
    warnings: list[str] = []
    due = article.review_due()
    if due and today > due:
        warnings.append(f"periodic review overdue since {due.isoformat()}")
    for signal in article.signals:
        if signal.on <= today and (article.reviewed_on is None or article.reviewed_on < signal.on):
            warnings.append(f"{signal.on.isoformat()}: {signal.note}")
    return warnings


def is_live(article: Article) -> bool:
    return not publication_problems(article)


def visible_articles() -> list[Article]:
    """What this environment serves: live articles, plus drafts where allowed."""
    if show_drafts():
        return list(ARTICLES)
    return [a for a in ARTICLES if is_live(a)]


def get_visible(slug: str) -> Optional[Article]:
    article = BY_SLUG.get(slug)
    if article is None:
        return None
    if show_drafts() or is_live(article):
        return article
    return None


def structural_problems(article: Article) -> list[str]:
    """Content that is broken regardless of status — enforced by the test suite."""
    problems: list[str] = []

    def both(label: str, text) -> None:
        if not text.nl.strip() or not text.en.strip():
            problems.append(f"{label}: missing a language")

    both("title", article.title)
    both("summary", article.summary)
    for field in ("answer", "applies_to", "next_steps"):
        items = getattr(article, field)
        if not items:
            problems.append(f"{field}: empty")
        for i, text in enumerate(items):
            both(f"{field}[{i}]", text)
    for i, text in enumerate(article.exceptions):
        both(f"exceptions[{i}]", text)
    for section in article.details:
        both("details title", section.title)
        for i, text in enumerate(section.paragraphs):
            both(f"details '{section.title.nl}'[{i}]", text)
    if not article.contacts:
        problems.append("no official body for the next step")
    for contact in article.contacts:
        both(f"contact {contact.body}", contact.label)
        for url in (contact.url.nl, contact.url.en):
            if not is_official(url, CONTACT_DOMAINS):
                problems.append(f"contact {contact.body}: not an official https URL: {url}")
    if not article.sources:
        problems.append("no official sources")
    for source_id in article.sources:
        if source_id not in SOURCES:
            problems.append(f"unknown source '{source_id}'")
    if article.sensitive and not article.claims:
        problems.append("sensitive article without a claims register")
    for claim in article.claims:
        if not claim.sources:
            problems.append(f"claim '{claim.id}' has no source")
        for source_id in claim.sources:
            if source_id not in article.sources:
                problems.append(f"claim '{claim.id}' cites '{source_id}', which the article does not show")
    for slug in article.related:
        if slug not in BY_SLUG or slug == article.slug:
            problems.append(f"related article '{slug}' does not exist")
    if article.job_link and not article.job_link.query:
        problems.append("job link without a filter")
    return problems
