"""Language-prefixed site paths — the backend mirror of frontend/src/lib/paths.ts.

SITE_ROOT_LANG is served at "/", the other language under its prefix ("/en/jobs").
Keep it equal to ROOT_LANG in the frontend; emails and the sitemap depend on it.
"""

from typing import Optional

SITE_ROOT_LANG = "nl"
PREFIXED_LANG = "en" if SITE_ROOT_LANG == "nl" else "nl"
SITE_LANGS = (SITE_ROOT_LANG, PREFIXED_LANG)


def localized_path(path: str, lang: Optional[str]) -> str:
    """'/jobs' in the given language: '/jobs' or '/en/jobs'. Unknown languages get the root one."""
    if lang != PREFIXED_LANG:
        return path
    return f"/{PREFIXED_LANG}" if path == "/" else f"/{PREFIXED_LANG}{path}"
