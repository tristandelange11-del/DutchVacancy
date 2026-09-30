from datetime import date

from content.kb.model import Article, Claim, Contact, JobLink, Section, Text
from content.kb.sources import CHECKED

# Content review by the owner: read on staging and approved on 2026-09-30.
REVIEWED = date(2026, 9, 30)

ARTICLE = Article(
    slug="jobs-without-dutch",
    order=6,
    # Practical advice about using the site; the only legal statement (TWV) is
    # covered by its own claim and the TWV article.
    sensitive=False,
    status="published",
    drafted_by="AI draft (Claude), 2026-09-29; reviewed and approved by the owner (Tristan de Lange) on 2026-09-30",
    author="Tristan de Lange",
    reviewer="Tristan de Lange",
    reviewed_on=REVIEWED,
    title=Text(
        nl="Bijbanen vinden wanneer je nog geen Nederlands spreekt",
        en="Finding a side job when you do not speak Dutch yet",
    ),
    summary=Text(
        nl="Zoek gericht naar vacatures waarvan de werkgever zegt dat Engels genoeg is, en controleer de rest van de voorwaarden voordat je solliciteert.",
        en="Search specifically for vacancies where the employer says English is enough, and check the other conditions before you apply.",
    ),
    answer=(
        Text(
            nl="Zoek gericht naar vacatures waarbij de werkgever heeft aangegeven dat Nederlands niet nodig is. Op DutchVacancy geeft de werkgever bij elke vacature de taaleis op: 'Alleen Engels', 'Basis Nederlands welkom' of 'Nederlands vereist'. Met het filter 'Alleen Engels' zie je alleen vacatures waarvoor volgens de werkgever Engels genoeg is.",
            en="Search specifically for vacancies where the employer has stated that Dutch is not needed. On DutchVacancy the employer states the language requirement for every vacancy: 'English only', 'Basic Dutch welcome' or 'Dutch required'. With the 'English only' filter you only see vacancies where, according to the employer, English is enough.",
        ),
    ),
    applies_to=(
        Text(
            nl="Studenten die (nog) geen of weinig Nederlands spreken en een bijbaan zoeken.",
            en="Students who speak no or little Dutch (yet) and are looking for a side job.",
        ),
    ),
    details=(
        Section(
            title=Text(nl="Lees de hele vacature", en="Read the whole vacancy"),
            paragraphs=(
                Text(
                    nl="Naast de taaleis en de sluitingsdatum staan bij een vacature, als de werkgever ze heeft opgegeven: de uren, het rooster, het loon met de eenheid (per uur of per maand), het soort contract en de startdatum. Staat iets er niet bij, vraag het dan na voordat je een afspraak maakt.",
                    en="Besides the language requirement and the closing date, a vacancy shows — if the employer provided them — the hours, the schedule, the pay with its unit (per hour or per month), the type of contract and the start date. If something is missing, ask about it before you commit.",
                ),
                Text(
                    nl="Je profiel en cv gaan mee met elke sollicitatie. Schrijf ze in het Engels als je op Engelstalige vacatures reageert.",
                    en="Your profile and CV are sent with every application. Write them in English when you apply to English-language vacancies.",
                ),
            ),
        ),
    ),
    exceptions=(
        Text(
            nl="Bij 'Basis Nederlands welkom' is een beetje Nederlands welkom; bij 'Nederlands vereist' heb je Nederlands nodig. Twijfel je over het niveau, vraag het dan aan de werkgever.",
            en="'Basic Dutch welcome' means some Dutch is welcome; 'Dutch required' means you need Dutch. Unsure about the level? Ask the employer.",
        ),
        Text(
            nl="Kom je van buiten de EU/EER en Zwitserland en heb je een verblijfsvergunning studie? Dan heeft je werkgever ook voor een Engelstalige bijbaan een TWV nodig.",
            en="From outside the EU/EEA and Switzerland with a student residence permit? Then your employer needs a TWV for an English-language side job too.",
        ),
    ),
    next_steps=(
        Text(
            nl="Filter de vacatures op 'Alleen Engels'.",
            en="Filter the vacancies on 'English only'.",
        ),
        Text(
            nl="Controleer uren, loon en contractvorm in de vacature; vraag na wat er niet staat.",
            en="Check the hours, pay and contract type in the vacancy; ask about anything that is not stated.",
        ),
        Text(
            nl="Van buiten de EU/EER en Zwitserland? Kijk of de werkgever aangeeft een TWV aan te vragen, en lees wanneer een TWV nodig is.",
            en="From outside the EU/EEA and Switzerland? Check whether the employer states it will apply for a TWV, and read when a TWV is needed.",
        ),
    ),
    contacts=(
        Contact(
            body="UWV",
            label=Text(nl="De werkvergunning (TWV) voor werkstudenten", en="The work permit (TWV) for working students"),
            url=Text(
                nl="https://www.uwv.nl/nl/werkvergunning/werkstudent",
                en="https://www.uwv.nl/nl/werkvergunning/werkstudent",
            ),
        ),
    ),
    sources=("ind-studie", "uwv-werkstudent"),
    claims=(
        Claim(
            id="twv-also-english",
            text="Met een verblijfsvergunning studie heeft de werkgever voor werk in loondienst een TWV nodig, ongeacht de werktaal.",
            sources=("ind-studie", "uwv-werkstudent"),
            applies_to="Niet-EU/EER/Zwitserse nationaliteit met verblijfsvergunning studie hbo/wo",
            checked_on=CHECKED,
        ),
    ),
    job_link=JobLink(
        label=Text(nl="Bekijk vacatures waarvoor alleen Engels nodig is", en="See vacancies that only require English"),
        query="english_level=english_only",
    ),
    related=("twv-work-permit", "start-working"),
)
