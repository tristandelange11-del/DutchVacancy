"""Crawler-facing endpoints: sitemap.xml and robots.txt.

Both live on api_router (so they are served at /api/seo/*), and the Vite dev
server proxies the canonical crawler paths /sitemap.xml and /robots.txt onto
them, which is what Google actually fetches.
"""

import os
from xml.sax.saxutils import escape

from fastapi import APIRouter, Request, Response

from lib.db import db

router = APIRouter(tags=["seo"])

# Public, indexable routes. Dashboards, auth and employer tools stay out of the
# sitemap on purpose — they are gated or personal, never search results.
STATIC_PATHS: list[tuple[str, str, str]] = [
    ("/", "1.0", "daily"),
    ("/jobs", "0.9", "daily"),
    ("/how-it-works", "0.7", "monthly"),
    ("/guide", "0.7", "monthly"),
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
            "Disallow: /login",
            "Disallow: /register",
            "Disallow: /student/",
            "Disallow: /employer/",
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
    jobs = (
        await db.jobs.find({"published": True}, {"id": 1, "created_at": 1})
        .sort("created_at", -1)
        .to_list(1000)
    )

    urls: list[str] = []
    for path, priority, freq in STATIC_PATHS:
        urls.append(
            f"<url><loc>{escape(root + path)}</loc>"
            f"<changefreq>{freq}</changefreq><priority>{priority}</priority></url>"
        )
    for job in jobs:
        created = job.get("created_at")
        lastmod = (
            f"<lastmod>{created.date().isoformat()}</lastmod>"
            if hasattr(created, "date")
            else ""
        )
        urls.append(
            f"<url><loc>{escape(root + '/jobs/' + job['id'])}</loc>{lastmod}"
            "<changefreq>weekly</changefreq><priority>0.8</priority></url>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + "".join(urls)
        + "</urlset>"
    )
    return Response(content=xml, media_type="application/xml")
