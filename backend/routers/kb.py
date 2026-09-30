"""Knowledge base: read-only articles from content/kb.

Production serves only articles that passed the publication gate. With
KB_SHOW_DRAFTS=1 (staging) drafts are served too, marked `live: false`, so the
content owner can review them in place — the frontend keeps those noindex.
"""

from fastapi import APIRouter, HTTPException

from content.kb import get_visible, is_live, visible_articles
from content.kb.model import Article, Text
from content.kb.sources import SOURCES
from models.schemas import (
    KbArticle,
    KbArticleSummary,
    KbContact,
    KbJobLink,
    KbSection,
    KbSource,
    LocalizedText,
)

router = APIRouter(tags=["knowledge-base"])


def _t(text: Text) -> LocalizedText:
    return LocalizedText(en=text.en, nl=text.nl)


def _summary(article: Article) -> KbArticleSummary:
    return KbArticleSummary(
        slug=article.slug,
        title=_t(article.title),
        summary=_t(article.summary),
        status=article.status,
        live=is_live(article),
        sensitive=article.sensitive,
        reviewed_on=article.reviewed_on,
        sources_checked_on=min(SOURCES[s].checked_on for s in article.sources),
    )


def _full(article: Article) -> KbArticle:
    visible = {a.slug for a in visible_articles()}
    return KbArticle(
        **_summary(article).model_dump(),
        answer=[_t(x) for x in article.answer],
        applies_to=[_t(x) for x in article.applies_to],
        exceptions=[_t(x) for x in article.exceptions],
        next_steps=[_t(x) for x in article.next_steps],
        details=[
            KbSection(title=_t(s.title), paragraphs=[_t(p) for p in s.paragraphs])
            for s in article.details
        ],
        contacts=[KbContact(body=c.body, label=_t(c.label), url=_t(c.url)) for c in article.contacts],
        job_link=(
            KbJobLink(label=_t(article.job_link.label), query=article.job_link.query)
            if article.job_link
            else None
        ),
        employer_link=article.employer_link,
        # Never link to an article this environment would answer with a 404.
        related=[_summary(get_visible(slug)) for slug in article.related if slug in visible],
        sources=[
            KbSource(
                publisher=SOURCES[s].publisher,
                title=_t(SOURCES[s].title),
                url=_t(SOURCES[s].url),
                en_available=SOURCES[s].en_available,
                checked_on=SOURCES[s].checked_on,
            )
            for s in article.sources
        ],
        author=article.author,
        reviewer=article.reviewer,
    )


@router.get("/kb", response_model=list[KbArticleSummary])
async def list_articles() -> list[KbArticleSummary]:
    return [_summary(a) for a in visible_articles()]


@router.get("/kb/{slug}", response_model=KbArticle)
async def get_article(slug: str) -> KbArticle:
    article = get_visible(slug)
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return _full(article)
