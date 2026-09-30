"""Knowledge base: content integrity, the publication gate, and draft visibility.

The gate is the point of this file: an article can only be served on production
(and listed in the sitemap) once it is published, has a named author and, when
sensitive, a named reviewer with a review date no older than its claim checks.
"""

import dataclasses
from datetime import date, timedelta

import pytest

import content.kb as kb
from content.kb import (
    ARTICLES,
    BY_SLUG,
    is_official,
    publication_problems,
    review_warnings,
    structural_problems,
)
from content.kb.model import Signal
from content.kb.sources import SOURCES

TODAY = date(2026, 10, 1)


def reviewed(article, **overrides):
    """The article as it would look after a real review — the only way to go live."""
    latest = max(c.checked_on for c in article.claims) if article.claims else TODAY
    values = dict(status="published", author="Jane Editor", reviewer="Content Owner", reviewed_on=latest)
    values.update(overrides)
    return dataclasses.replace(article, **values)


@pytest.fixture
def production(monkeypatch):
    monkeypatch.delenv("KB_SHOW_DRAFTS", raising=False)


@pytest.fixture
def staging(monkeypatch):
    monkeypatch.setenv("KB_SHOW_DRAFTS", "1")


def use_articles(monkeypatch, articles):
    monkeypatch.setattr(kb, "ARTICLES", tuple(articles))
    monkeypatch.setattr(kb, "BY_SLUG", {a.slug: a for a in articles})
    monkeypatch.setattr("routers.seo.ARTICLES", tuple(articles))


# ---------- content integrity ----------

@pytest.mark.parametrize("article", ARTICLES, ids=lambda a: a.slug)
def test_article_is_structurally_complete(article):
    assert structural_problems(article) == []


def test_all_seven_requested_articles_exist_with_unique_slugs():
    assert len(ARTICLES) == 7
    assert len({a.slug for a in ARTICLES}) == 7
    assert len({a.order for a in ARTICLES}) == 7


def test_every_source_is_an_official_https_page():
    for source in SOURCES.values():
        assert is_official(source.url.nl), source.id
        assert is_official(source.url.en), source.id


def test_official_domain_check_rejects_lookalikes():
    assert is_official("https://www.uwv.nl/nl/werkvergunning")
    assert not is_official("http://www.uwv.nl/nl/werkvergunning")
    assert not is_official("https://uwv.nl.example.com/")
    assert not is_official("https://notuwv.nl/")


def test_every_published_article_passes_the_gate():
    """CI gate: flipping status to 'published' without a real review fails the build."""
    for article in ARTICLES:
        if article.status == "published":
            assert publication_problems(article) == [], article.slug


def test_no_article_is_live_before_a_named_reviewer_exists():
    # Today no content owner has been designated, so nothing may be live yet.
    assert all(publication_problems(a) for a in ARTICLES)


# ---------- the gate itself ----------

def test_gate_blocks_drafts_and_missing_people():
    article = BY_SLUG["twv-work-permit"]
    assert "status is 'draft', not 'published'" in publication_problems(article, TODAY)
    assert publication_problems(reviewed(article), TODAY) == []
    assert "no named author or editor" in publication_problems(reviewed(article, author=" "), TODAY)
    assert "sensitive article without a designated content reviewer" in publication_problems(
        reviewed(article, reviewer=None), TODAY
    )
    assert "no content review date" in publication_problems(reviewed(article, reviewed_on=None), TODAY)


def test_gate_requires_a_review_after_the_latest_claim_check():
    article = reviewed(BY_SLUG["health-insurance"])
    stale = dataclasses.replace(article, reviewed_on=article.reviewed_on - timedelta(days=1))
    assert "a claim was re-checked after the last content review" in publication_problems(stale, TODAY)
    future = dataclasses.replace(article, reviewed_on=TODAY + timedelta(days=1))
    assert "review date lies in the future" in publication_problems(future, TODAY)


def test_non_sensitive_article_needs_an_author_but_no_reviewer():
    article = BY_SLUG["jobs-without-dutch"]
    assert not article.sensitive
    assert publication_problems(reviewed(article, reviewer=None), TODAY) == []
    assert "no named author or editor" in publication_problems(reviewed(article, author=None), TODAY)


def test_review_warnings_flag_overdue_reviews_and_known_law_changes():
    article = reviewed(BY_SLUG["employment-contract"], reviewed_on=date(2026, 10, 1))
    assert review_warnings(article, date(2026, 10, 2)) == []
    later = review_warnings(article, date(2027, 1, 2))
    assert any("2026-12-31" in w for w in later) and any("2027-01-01" in w for w in later)
    assert any("overdue" in w for w in review_warnings(article, date(2027, 6, 1)))
    # A re-review after the signal date clears it.
    rereviewed = dataclasses.replace(article, reviewed_on=date(2027, 1, 2), signals=(Signal(on=date(2027, 1, 1), note="x"),))
    assert review_warnings(rereviewed, date(2027, 1, 3)) == []


# ---------- what each environment serves ----------

def test_production_serves_no_drafts(client, production):
    assert client.get("/kb").json() == []
    assert client.get("/kb/start-working").status_code == 404
    assert "/guide/" not in client.get("/seo/sitemap.xml").text


def test_staging_serves_drafts_marked_as_not_live(client, staging):
    listing = client.get("/kb").json()
    assert [a["slug"] for a in listing] == [a.slug for a in ARTICLES]
    assert all(a["live"] is False and a["reviewed_on"] is None for a in listing)

    article = client.get("/kb/twv-work-permit").json()
    assert article["status"] == "draft"
    assert article["sources"] and all(s["url"]["nl"].startswith("https://") for s in article["sources"])
    assert article["contacts"] and article["job_link"]["query"] == "permit_support=twv_provided"
    assert {r["slug"] for r in article["related"]} == {"start-working", "employment-contract"}
    # Drafts never reach the sitemap, even where they are shown.
    assert "/guide/" not in client.get("/seo/sitemap.xml").text


def test_internal_verification_record_is_never_served(client, staging):
    body = client.get("/kb/health-insurance").text
    for internal in ("claims", "open_questions", "how_read", "drafted_by", "signals", "applies_to\":\"Buitenlandse"):
        assert internal not in body


def test_a_reviewed_article_goes_live_on_production(client, production, monkeypatch):
    live = reviewed(BY_SLUG["start-working"])
    others = [a for a in ARTICLES if a.slug != "start-working"]
    use_articles(monkeypatch, [live, *others])

    listing = client.get("/kb").json()
    assert [a["slug"] for a in listing] == ["start-working"]
    assert listing[0]["live"] is True and listing[0]["reviewed_on"] == live.reviewed_on.isoformat()

    article = client.get("/kb/start-working").json()
    assert article["author"] == "Jane Editor" and article["reviewer"] == "Content Owner"
    # Related drafts are hidden on production instead of linking to a 404.
    assert article["related"] == []
    assert client.get("/kb/twv-work-permit").status_code == 404
    assert "/guide/start-working" in client.get("/seo/sitemap.xml").text
