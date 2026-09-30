"""Official sources the knowledge base relies on.

Every entry was opened and read in full on `checked_on` — not taken from a
search-result summary. Re-check a source by reading it again, updating
`checked_on`/`page_updated`, and running `python scripts/kb_report.py --record`
so the change detector starts from the new version.
"""

from datetime import date

from content.kb.model import Source, Text

CHECKED = date(2026, 9, 29)

_SOURCES = [
    Source(
        id="ind-studie",
        publisher="IND",
        title=Text(
            nl="Verblijfsvergunning studie hbo of universiteit",
            en="Student residence permit for university or higher professional education",
        ),
        url=Text(
            nl="https://ind.nl/nl/verblijfsvergunningen/studie/verblijfsvergunning-studie-hbo-of-universiteit",
            en="https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education",
        ),
        checked_on=CHECKED,
        page_updated="NL 17 september 2026 / EN 21 September 2026",
        how_read=(
            "Both language versions read through the page's own situation tool "
            "(nationality Indian, no valid and no expired Dutch permit), tabs "
            "'Voorwaarden' and 'De verblijfsvergunning'. Other non-EU nationalities "
            "were not run through the tool separately."
        ),
        en_available=True,
    ),
    Source(
        id="ind-zoekjaar",
        publisher="IND",
        title=Text(
            nl="Verblijfsvergunning zoekjaar hoogopgeleiden",
            en="Residence permit for orientation year",
        ),
        url=Text(
            nl="https://ind.nl/nl/verblijfsvergunningen/werken/verblijfsvergunning-zoekjaar-hoogopgeleiden",
            en="https://ind.nl/en/residence-permits/work/residence-permit-for-orientation-year",
        ),
        checked_on=CHECKED,
        page_updated="EN 16 September 2026",
        how_read=(
            "English version read through the situation tool (nationality Indian, "
            "holds a valid Dutch permit). The Dutch version was not read separately."
        ),
        en_available=True,
    ),
    Source(
        id="ind-eu",
        publisher="IND",
        title=Text(
            nl="Verblijven in Nederland als burger van de EU, EER of Zwitserland",
            en="Staying in the Netherlands as an EU, EEA or Swiss citizen",
        ),
        url=Text(
            nl="https://ind.nl/nl/verblijfsvergunningen/eu-eer-en-zwitserland/verblijven-in-nederland-als-burger-van-de-eu-eer-of-zwitserland",
            en="https://ind.nl/en/residence-permits/eu-eea-or-swiss-citizens/staying-in-the-netherlands-as-an-eu-eea-or-swiss-citizen",
        ),
        checked_on=CHECKED,
        page_updated="EN 10 July 2026",
        how_read="English version read in full; the Dutch version was not read separately.",
        en_available=True,
    ),
    Source(
        id="uwv-werkstudent",
        publisher="UWV",
        title=Text(nl="Werkvergunning werkstudent", en="Work permit for a working student"),
        url=Text(
            nl="https://www.uwv.nl/nl/werkvergunning/werkstudent",
            en="https://www.uwv.nl/nl/werkvergunning/werkstudent",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="uwv-twv-aanvragen",
        publisher="UWV",
        title=Text(nl="Tewerkstellingsvergunning aanvragen", en="Applying for a TWV work permit"),
        url=Text(
            nl="https://www.uwv.nl/nl/werkvergunning/twv-aanvragen",
            en="https://www.uwv.nl/nl/werkvergunning/twv-aanvragen",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="uwv-twv-voorwaarden",
        publisher="UWV",
        title=Text(nl="Voorwaarden tewerkstellingsvergunning", en="Conditions for a TWV work permit"),
        url=Text(
            nl="https://www.uwv.nl/nl/werkvergunning/twv-voorwaarden",
            en="https://www.uwv.nl/nl/werkvergunning/twv-voorwaarden",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="uwv-stage",
        publisher="UWV",
        title=Text(nl="Werkvergunning stage", en="Work permit for an internship"),
        url=Text(
            nl="https://www.uwv.nl/nl/werkvergunning/stage",
            en="https://www.uwv.nl/nl/werkvergunning/stage",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-buitenlandse-werknemer",
        publisher="Rijksoverheid",
        title=Text(
            nl="Mag ik als buitenlandse werknemer in Nederland werken?",
            en="May I work in the Netherlands as a foreign employee?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/onderwerpen/buitenlandse-werknemers/vraag-en-antwoord/mag-ik-als-buitenlandse-werknemer-in-nederland-werken",
            en="https://www.rijksoverheid.nl/onderwerpen/buitenlandse-werknemers/vraag-en-antwoord/mag-ik-als-buitenlandse-werknemer-in-nederland-werken",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="svb-wlz-studie",
        publisher="SVB",
        title=Text(
            nl="Wet langdurige zorg: u studeert of loopt stage",
            en="Long-term Care Act (Wlz): studying or doing an internship",
        ),
        url=Text(
            nl="https://www.svb.nl/nl/wlz/wanneer-verzekerd-voor-de-wlz/u-studeert-of-loopt-stage",
            en="https://www.svb.nl/nl/wlz/wanneer-verzekerd-voor-de-wlz/u-studeert-of-loopt-stage",
        ),
        checked_on=CHECKED,
        how_read=(
            "Read in a browser, situation 'U studeert of loopt stage in Nederland'. "
            "The SVB site refuses scripted requests, so the change detector cannot "
            "check this page — re-read it by hand at every review."
        ),
    ),
    Source(
        id="rvo-zorg-werken",
        publisher="Rijksoverheid",
        title=Text(
            nl="Moet ik een zorgverzekering afsluiten als ik in Nederland ga werken?",
            en="Do I need health insurance if I start working in the Netherlands?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/onderwerpen/immigratie-naar-nederland/vraag-en-antwoord/moet-ik-een-zorgverzekering-afsluiten-als-ik-in-nederland-ga-werken",
            en="https://www.rijksoverheid.nl/onderwerpen/immigratie-naar-nederland/vraag-en-antwoord/moet-ik-een-zorgverzekering-afsluiten-als-ik-in-nederland-ga-werken",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-zorg-verplicht",
        publisher="Rijksoverheid",
        title=Text(nl="Is een zorgverzekering verplicht?", en="Is health insurance compulsory?"),
        url=Text(
            nl="https://www.rijksoverheid.nl/onderwerpen/zorgverzekering/vraag-en-antwoord/ben-ik-verplicht-een-zorgverzekering-af-te-sluiten",
            en="https://www.rijksoverheid.nl/onderwerpen/zorgverzekering/vraag-en-antwoord/ben-ik-verplicht-een-zorgverzekering-af-te-sluiten",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-brp",
        publisher="Rijksoverheid",
        title=Text(
            nl="Wanneer moet ik mij in de Basisregistratie Personen (BRP) laten inschrijven als ingezetene?",
            en="When must I register as a resident in the Personal Records Database (BRP)?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/vraag-en-antwoord/privacy-en-persoonsgegevens/wanneer-in-brp-inschrijven",
            en="https://www.rijksoverheid.nl/vraag-en-antwoord/privacy-en-persoonsgegevens/wanneer-in-brp-inschrijven",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-bsn",
        publisher="Rijksoverheid",
        title=Text(
            nl="Hoe kom ik aan een burgerservicenummer (bsn)?",
            en="How do I get a citizen service number (BSN)?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/vraag-en-antwoord/privacy-en-persoonsgegevens/hoe-kom-ik-aan-een-burgerservicenummer-bsn",
            en="https://www.rijksoverheid.nl/vraag-en-antwoord/privacy-en-persoonsgegevens/hoe-kom-ik-aan-een-burgerservicenummer-bsn",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-regelen-wonen",
        publisher="Rijksoverheid",
        title=Text(
            nl="Wat moet ik regelen als ik in Nederland kom wonen?",
            en="What do I need to arrange when I come to live in the Netherlands?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/vraag-en-antwoord/immigratie-naar-nederland/wat-moet-ik-regelen-als-ik-in-nederland-kom-wonen",
            en="https://www.rijksoverheid.nl/vraag-en-antwoord/immigratie-naar-nederland/wat-moet-ik-regelen-als-ik-in-nederland-kom-wonen",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-minimumloon",
        publisher="Rijksoverheid",
        title=Text(nl="Minimumloon", en="Minimum wage"),
        url=Text(
            nl="https://www.rijksoverheid.nl/onderwerpen/minimumloon",
            en="https://www.rijksoverheid.nl/onderwerpen/minimumloon",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-minimumloon-bedragen",
        publisher="Rijksoverheid",
        title=Text(nl="Bedragen minimumloon 2026", en="Minimum wage amounts 2026"),
        url=Text(
            nl="https://www.rijksoverheid.nl/themas/werk/minimumloon/bedragen-minimumloon/bedragen-minimumloon-2026",
            en="https://www.rijksoverheid.nl/themas/werk/minimumloon/bedragen-minimumloon/bedragen-minimumloon-2026",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-vakantiegeld",
        publisher="Rijksoverheid",
        title=Text(nl="Hoe hoog is mijn vakantiegeld?", en="How much holiday pay do I get?"),
        url=Text(
            nl="https://www.rijksoverheid.nl/onderwerpen/vakantiedagen-en-vakantiegeld/vraag-en-antwoord/hoe-hoog-is-mijn-vakantiegeld",
            en="https://www.rijksoverheid.nl/onderwerpen/vakantiedagen-en-vakantiegeld/vraag-en-antwoord/hoe-hoog-is-mijn-vakantiegeld",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-loonstrook",
        publisher="Rijksoverheid",
        title=Text(nl="Wat staat er op mijn loonstrook?", en="What is on my payslip?"),
        url=Text(
            nl="https://www.rijksoverheid.nl/onderwerpen/arbeidsovereenkomst-en-cao/vraag-en-antwoord/wat-staat-er-op-mijn-loonstrook",
            en="https://www.rijksoverheid.nl/onderwerpen/arbeidsovereenkomst-en-cao/vraag-en-antwoord/wat-staat-er-op-mijn-loonstrook",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-arbeidsovereenkomst",
        publisher="Rijksoverheid",
        title=Text(
            nl="Wat staat er in een arbeidsovereenkomst?",
            en="What is in an employment contract?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/wat-staat-er-in-een-arbeidsovereenkomst",
            en="https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/wat-staat-er-in-een-arbeidsovereenkomst",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-oproepcontracten",
        publisher="Rijksoverheid",
        title=Text(
            nl="Welke contracten zijn er voor oproepkrachten?",
            en="Which contracts exist for on-call workers?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/welke-contracten-zijn-er-voor-oproepkrachten",
            en="https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/welke-contracten-zijn-er-voor-oproepkrachten",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-oproep-3uur",
        publisher="Rijksoverheid",
        title=Text(
            nl="In welke situatie krijg ik minimaal 3 uur loon uitbetaald terwijl ik minder heb gewerkt?",
            en="When am I paid for at least 3 hours although I worked less?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/onderwerpen/arbeidsovereenkomst-en-cao/vraag-en-antwoord/krijg-ik-als-oproepkracht-ook-loon-als-ik-maar-1-of-2-uur-heb-gewerkt",
            en="https://www.rijksoverheid.nl/onderwerpen/arbeidsovereenkomst-en-cao/vraag-en-antwoord/krijg-ik-als-oproepkracht-ook-loon-als-ik-maar-1-of-2-uur-heb-gewerkt",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-flexwet",
        publisher="Rijksoverheid",
        title=Text(
            nl="Meer zekerheid voor mensen met een flexcontract (nieuwsbericht, 7 juli 2026)",
            en="More certainty for people on flexible contracts (news item, 7 July 2026)",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/actueel/nieuws/2026/07/08/meer-zekerheid-voor-mensen-met-een-flexcontract",
            en="https://www.rijksoverheid.nl/actueel/nieuws/2026/07/08/meer-zekerheid-voor-mensen-met-een-flexcontract",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="rvo-stage-minimumloon",
        publisher="Rijksoverheid",
        title=Text(
            nl="Heb ik recht op het minimumloon als ik stage loop?",
            en="Am I entitled to the minimum wage during an internship?",
        ),
        url=Text(
            nl="https://www.rijksoverheid.nl/onderwerpen/minimumloon/vraag-en-antwoord/minimumloon-stage",
            en="https://www.rijksoverheid.nl/onderwerpen/minimumloon/vraag-en-antwoord/minimumloon-stage",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="bd-lhk-bijbaan",
        publisher="Belastingdienst",
        title=Text(nl="Loonheffingskorting met een bijbaan", en="Payroll tax credit with a side job"),
        url=Text(
            nl="https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/loonheffingskorting-met-een-bijbaan",
            en="https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/loonheffingskorting-met-een-bijbaan",
        ),
        checked_on=CHECKED,
    ),
    Source(
        id="bd-verschillende-banen",
        publisher="Belastingdienst",
        title=Text(nl="Ik heb verschillende banen", en="I have several jobs"),
        url=Text(
            nl="https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/ik-heb-verschillende-banen",
            en="https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/ik-heb-verschillende-banen",
        ),
        checked_on=CHECKED,
    ),
]

SOURCES: dict[str, Source] = {s.id: s for s in _SOURCES}

# Only these publishers' own domains count as an official source.
OFFICIAL_DOMAINS = (
    "ind.nl",
    "uwv.nl",
    "svb.nl",
    "rijksoverheid.nl",
    "belastingdienst.nl",
    "government.nl",
)
