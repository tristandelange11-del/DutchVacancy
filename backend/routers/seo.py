"""Crawler-facing endpoints: sitemap.xml and robots.txt.

Both live on api_router (so they are served at /api/seo/*), and the Vite dev
server proxies the canonical crawler paths /sitemap.xml and /robots.txt onto
them, which is what Google actually fetches.
"""

import os
from datetime import datetime, timezone
from xml.sax.saxutils import escape

from fastapi import APIRouter, Request, Response

from content.kb import ARTICLES, is_live
from lib.db import db
from lib.site import SITE_LANGS, SITE_ROOT_LANG, localized_path
from lib.vacancies import open_query

router = APIRouter(tags=["seo"])

# Public, indexable routes. Dashboards, auth and employer tools stay out of the
# sitemap on purpose — they are gated or personal, never search results.
STATIC_PATHS: list[tuple[str, str, str]] = [
    ("/", "1.0", "daily"),
    ("/jobs", "0.9", "daily"),
    ("/how-it-works", "0.7", "monthly"),
    ("/guide", "0.7", "monthly"),
    ("/employers", "0.7", "monthly"),
    ("/about", "0.5", "yearly"),
    ("/contact", "0.5", "yearly"),
    ("/privacy", "0.3", "yearly"),
    ("/terms", "0.3", "yearly"),
]


def base_url(request: Request) -> str:
    """The host the crawler actually reached us on.

    Preferred over APP_URL, which can hold a stale preview hostname; the proxy's
    forwarded headers are the truth for canonical URLs.
    """
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    if host:
        proto = request.headers.get("x-forwarded-proto") or (
            "http" if host.startswith("localhost") else "https"
        )
        return f"{proto}://{host.split(',')[0].strip()}"
    return os.environ.get("APP_URL", "").rstrip("/")


@router.get("/seo/robots.txt", response_class=Response)
async def robots_txt(request: Request) -> Response:
    body = "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            *[
                f"Disallow: {localized_path(p, lang)}"
                for lang in SITE_LANGS
                for p in ("/login", "/register", "/student/", "/employer/")
            ],
            "Disallow: /api/",
            "",
            f"Sitemap: {base_url(request)}/sitemap.xml",
            "",
        ]
    )
    return Response(content=body, media_type="text/plain; charset=utf-8")


@router.get("/seo/sitemap.xml", response_class=Response)
async def sitemap_xml(request: Request) -> Response:
    root = base_url(request)
    # Closed vacancies drop out of the sitemap the moment they close.
    jobs = (
        await db.jobs.find(open_query(datetime.now(timezone.utc)), {"id": 1, "created_at": 1})
        .sort("created_at", -1)
        .to_list(1000)
    )

    # (path, lastmod, changefreq, priority) — each listed once per language below.
    pages: list[tuple[str, str, str, str]] = [(path, "", freq, prio) for path, prio, freq in STATIC_PATHS]
    # Only reviewed, live articles — never drafts, not even where drafts are shown.
    for article in ARTICLES:
        if is_live(article):
            pages.append((f"/guide/{article.slug}", article.reviewed_on.isoformat(), "monthly", "0.7"))
    for job in jobs:
        created = job.get("created_at")
        lastmod = created.date().isoformat() if hasattr(created, "date") else ""
        pages.append((f"/jobs/{job['id']}", lastmod, "weekly", "0.8"))

    urls: list[str] = []
    for path, lastmod, freq, priority in pages:
        # Every language version names all versions, itself included (Google's hreflang rules).
        alternates = "".join(
            f'<xhtml:link rel="alternate" hreflang="{hreflang}" href="{escape(root + localized_path(path, lang))}"/>'
            for hreflang, lang in [*((l, l) for l in SITE_LANGS), ("x-default", SITE_ROOT_LANG)]
        )
        for lang in SITE_LANGS:
            urls.append(
                f"<url><loc>{escape(root + localized_path(path, lang))}</loc>"
                + (f"<lastmod>{lastmod}</lastmod>" if lastmod else "")
                + f"<changefreq>{freq}</changefreq><priority>{priority}</priority>{alternates}</url>"
            )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
        + "".join(urls)
        + "</urlset>"
    )
    return Response(content=xml, media_type="application/xml")
