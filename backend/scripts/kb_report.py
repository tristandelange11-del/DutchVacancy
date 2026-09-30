"""Knowledge base verification report and source-change detector.

    python scripts/kb_report.py                  # write docs/launch/kennisbank-verificatie.md
    python scripts/kb_report.py --check-sources  # compare official pages with the recorded version
    python scripts/kb_report.py --record         # record the current version after a human re-read

A changed fingerprint is a signal to re-read a page, not proof that a rule
changed (pages also change for menus or news blocks). An unchanged fingerprint
is no guarantee either — hence the periodic review date on every article.
Exit code 1 means something needs a person: a changed or unreadable source, an
overdue review, or a passed review signal on a live article.
"""

import argparse
import hashlib
import json
import re
import sys
import urllib.request
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from content.kb import ARTICLES, is_live, publication_problems, review_warnings  # noqa: E402
from content.kb.sources import SOURCES  # noqa: E402

REPORT = BACKEND.parent / "docs" / "launch" / "kennisbank-verificatie.md"
FINGERPRINTS = BACKEND / "content" / "kb" / "fingerprints.json"
UPDATED = re.compile(r"(Laatste update|Last update|Laatst gewijzigd|Laatst bijgewerkt)\s*:?\s*([0-9]{1,2} [A-Za-z]+ [0-9]{4})")


class _MainText(HTMLParser):
    """Visible text, preferring <main> and skipping navigation and scripts."""

    SKIP = {"script", "style", "noscript", "svg", "nav", "header", "footer", "form"}

    def __init__(self):
        super().__init__()
        self.skip = 0
        self.in_main = 0
        self.all: list[str] = []
        self.main: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self.skip += 1
        if tag == "main":
            self.in_main += 1

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.skip:
            self.skip -= 1
        if tag == "main" and self.in_main:
            self.in_main -= 1

    def handle_data(self, data):
        if self.skip:
            return
        self.all.append(data)
        if self.in_main:
            self.main.append(data)


def page_signature(url: str) -> dict:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; DutchVacancy source check)",
            "Accept-Language": "nl,en;q=0.8",
        },
    )
    raw = urllib.request.urlopen(request, timeout=30).read().decode("utf-8", "replace")
    parser = _MainText()
    parser.feed(raw)
    text = " ".join("".join(parser.main or parser.all).split())
    marker = UPDATED.search(text)
    return {
        "fingerprint": hashlib.sha256(text.encode()).hexdigest()[:16],
        "page_updated": marker.group(2) if marker else None,
    }


def source_urls(source) -> list[str]:
    return list(dict.fromkeys([source.url.nl, source.url.en]))


def check_sources(record: bool) -> int:
    stored = json.loads(FINGERPRINTS.read_text()) if FINGERPRINTS.exists() else {}
    current: dict[str, dict] = {}
    needs_attention = 0
    for source in SOURCES.values():
        for url in source_urls(source):
            try:
                sig = page_signature(url)
            except Exception as exc:  # network errors, 403s: report, never crash the run
                print(f"UNREADABLE  {source.id}  {url}  ({exc.__class__.__name__}: {exc}) — re-read by hand")
                needs_attention += 0 if url in stored and stored[url].get("manual") else 1
                current[url] = {"manual": True}
                continue
            current[url] = sig
            before = stored.get(url)
            if before is None or before.get("manual"):
                print(f"NEW         {source.id}  {url}")
            elif before.get("fingerprint") != sig["fingerprint"]:
                needs_attention += 1
                print(
                    f"CHANGED     {source.id}  {url}  "
                    f"(page date {before.get('page_updated')} -> {sig['page_updated']}) — re-read the page"
                )
            else:
                print(f"unchanged   {source.id}  {url}")
    if record:
        FINGERPRINTS.write_text(json.dumps(current, indent=2, sort_keys=True) + "\n")
        print(f"Recorded {len(current)} page fingerprints in {FINGERPRINTS.relative_to(BACKEND.parent)}")
        return 0
    for article in ARTICLES:
        if is_live(article):
            for warning in review_warnings(article):
                needs_attention += 1
                print(f"REVIEW      {article.slug}: {warning}")
    return 1 if needs_attention else 0


def _source_ref(source_id: str) -> str:
    s = SOURCES[source_id]
    return f"[{s.publisher}: {s.title.nl}]({s.url.nl})"


def write_report(today: date) -> None:
    lines = [
        "# Kennisbank — verificatieregister",
        "",
        f"_Gegenereerd op {today.isoformat()} met `python backend/scripts/kb_report.py`. "
        "Niet met de hand bewerken: pas de artikelen in `backend/content/kb/` aan en genereer opnieuw._",
        "",
        "Een AI-concept is geen geverifieerde bron. Elke bewering hieronder is gecontroleerd door de "
        "officiële bronpagina zelf te openen en te lezen (niet via een zoekresultaat). Publicatie op "
        "productie gebeurt pas als de publicatiepoort groen is: status `published`, een echte auteur of "
        "redacteur en — bij gevoelige artikelen — een aangewezen inhoudelijk eigenaar die het artikel "
        "heeft beoordeeld.",
        "",
        "## Overzicht",
        "",
        "| Artikel | Gevoelig | Status | Auteur | Beoordelaar | Beoordeeld op | Live op productie | Blokkades |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for a in ARTICLES:
        problems = publication_problems(a, today)
        lines.append(
            f"| {a.title.nl} (`/guide/{a.slug}`) | {'ja' if a.sensitive else 'nee'} | {a.status} | "
            f"{a.author or '—'} | {a.reviewer or '—'} | {a.reviewed_on or '—'} | "
            f"{'ja' if not problems else 'nee'} | {'; '.join(problems) or '—'} |"
        )
    for a in ARTICLES:
        lines += [
            "",
            f"## {a.title.nl}",
            "",
            f"- Pad: `/guide/{a.slug}` · gevoelig: {'ja' if a.sensitive else 'nee'} · status: {a.status}",
            f"- Eerste versie: {a.drafted_by or '—'}",
            f"- Periodieke controle: elke {a.review_every_days} dagen"
            + (f", volgende uiterlijk {a.review_due().isoformat()}" if a.review_due() else " (start na eerste beoordeling)"),
        ]
        if a.signals:
            lines.append("- Bekende wijzigingen die een nieuwe controle vragen:")
            lines += [f"  - {s.on.isoformat()}: {s.note}" for s in a.signals]
        if a.open_questions:
            lines.append("- Open vragen / bewust weggelaten:")
            lines += [f"  - {q}" for q in a.open_questions]
        if a.claims:
            lines += [
                "",
                "| Bewering | Bron(nen) | Geldt voor | Gecontroleerd | Onzekerheid |",
                "|---|---|---|---|---|",
            ]
            for c in a.claims:
                lines.append(
                    f"| {c.text} | {'<br>'.join(_source_ref(s) for s in c.sources)} | {c.applies_to} | "
                    f"{c.checked_on.isoformat()} | {c.open_questions or '—'} |"
                )
    lines += [
        "",
        "## Bronnen",
        "",
        "| Id | Instantie | Pagina | Gelezen op | Paginadatum | Hoe gelezen |",
        "|---|---|---|---|---|---|",
    ]
    for s in SOURCES.values():
        lines.append(
            f"| `{s.id}` | {s.publisher} | [{s.title.nl}]({s.url.nl}) | {s.checked_on.isoformat()} | "
            f"{s.page_updated or '—'} | {s.how_read or 'Volledig gelezen.'} |"
        )
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(lines) + "\n")
    print(f"Wrote {REPORT.relative_to(BACKEND.parent)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check-sources", action="store_true", help="compare official pages with the recorded version")
    parser.add_argument("--record", action="store_true", help="record current page versions (after a human re-read)")
    parser.add_argument("--today", type=date.fromisoformat, default=None, help="report date (default: today)")
    args = parser.parse_args()
    if args.check_sources or args.record:
        return check_sources(record=args.record)
    write_report(args.today or date.today())
    return 0


if __name__ == "__main__":
    sys.exit(main())
