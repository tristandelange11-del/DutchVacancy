"""The knowledge base's content model.

Articles are code, not database rows: every change goes through a pull request,
so the verification record (which claim rests on which official source, checked
when, for whom) lives next to the text it covers and is reviewed with it.

Nothing here is served as-is. `routers/kb.py` maps these objects onto the API
models in `models/schemas.py`, and leaves out everything internal (claims,
open questions, review signals, how a source was read).
"""

from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Literal, Optional

Status = Literal["draft", "in_review", "published"]


@dataclass(frozen=True)
class Text:
    """One piece of copy in both site languages. Keep the pair side by side so
    a change to one language is visibly a change to the other."""

    nl: str
    en: str


@dataclass(frozen=True)
class Source:
    id: str
    publisher: str  # the official body: IND, UWV, SVB, Rijksoverheid, Belastingdienst
    title: Text
    url: Text  # the same URL twice when the page only exists in Dutch
    checked_on: date  # when the page itself was opened and read, not a search snippet
    page_updated: Optional[str] = None  # the "last update" the page showed at that moment
    how_read: str = ""  # internal: e.g. which answers a page's situation tool needed
    en_available: bool = False  # does an English version of the page exist at url.en?


@dataclass(frozen=True)
class Claim:
    """A statement in an article that could be wrong, and why we believe it isn't."""

    id: str
    text: str  # the claim in plain Dutch, as the article makes it
    sources: tuple[str, ...]
    applies_to: str  # nationality / residence status / form of work it holds for
    checked_on: date
    open_questions: str = ""


@dataclass(frozen=True)
class Signal:
    """A known future change that makes a re-review necessary on or after `on`."""

    on: date
    note: str
    sources: tuple[str, ...] = ()


@dataclass(frozen=True)
class Section:
    title: Text
    paragraphs: tuple[Text, ...]


@dataclass(frozen=True)
class Contact:
    body: str  # who to go to
    label: Text  # for what
    url: Text


@dataclass(frozen=True)
class JobLink:
    label: Text
    query: str  # appended to /jobs? — only filters with a stated, known value


@dataclass(frozen=True)
class Article:
    slug: str
    order: int
    sensitive: bool  # permits, insurance, tax, labour law: needs a named reviewer
    status: Status
    title: Text
    summary: Text
    answer: tuple[Text, ...]
    applies_to: tuple[Text, ...]
    exceptions: tuple[Text, ...]
    next_steps: tuple[Text, ...]
    contacts: tuple[Contact, ...]
    sources: tuple[str, ...]
    claims: tuple[Claim, ...]
    details: tuple[Section, ...] = ()
    job_link: Optional[JobLink] = None
    employer_link: bool = False
    related: tuple[str, ...] = ()
    drafted_by: str = ""  # internal: who or what wrote the first draft
    author: Optional[str] = None  # a real, named person — shown on the page
    reviewer: Optional[str] = None  # the designated content owner who checked it
    reviewed_on: Optional[date] = None  # moves only after a real content review
    review_every_days: int = 182
    signals: tuple[Signal, ...] = ()
    open_questions: tuple[str, ...] = field(default_factory=tuple)

    def review_due(self) -> Optional[date]:
        if self.reviewed_on is None:
            return None
        return self.reviewed_on + timedelta(days=self.review_every_days)
