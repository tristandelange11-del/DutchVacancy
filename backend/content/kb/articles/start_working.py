from content.kb.model import Article, Claim, Contact, JobLink, Text
from content.kb.sources import CHECKED

ARTICLE = Article(
    slug="start-working",
    order=1,
    sensitive=True,
    status="draft",
    drafted_by="AI draft (Claude), sources read 2026-09-29; not yet reviewed by a person",
    title=Text(
        nl="Werken naast je studie: waar begin je?",
        en="Working alongside your studies: where do you start?",
    ),
    summary=Text(
        nl="Of en hoeveel je mag werken, hangt vooral af van je nationaliteit en je verblijfsvergunning. Dit zijn de eerste stappen.",
        en="Whether and how much you may work depends mainly on your nationality and your residence permit. These are the first steps.",
    ),
    answer=(
        Text(
            nl="Heb je de nationaliteit van een land van de EU, de EER of Zwitserland? Dan mag je in Nederland werken zonder werkvergunning. Je hebt wel een geldig paspoort of identiteitsbewijs nodig.",
            en="Do you have the nationality of an EU or EEA country or Switzerland? Then you may work in the Netherlands without a work permit. You do need a valid passport or identity card.",
        ),
        Text(
            nl="Heb je een andere nationaliteit en een verblijfsvergunning voor studie? Dan mag je in loondienst werken als je werkgever een werkvergunning (TWV) voor je heeft. Je moet dan kiezen: maximaal 16 uur per week, of voltijd in de maanden juni, juli en augustus.",
            en="Do you have another nationality and a student residence permit? Then you may work as an employee if your employer has a work permit (TWV) for you. You must then choose: up to 16 hours a week, or full-time in June, July and August.",
        ),
    ),
    applies_to=(
        Text(
            nl="Studenten die in Nederland studeren en naast hun studie willen werken.",
            en="Students who study in the Netherlands and want to work alongside their studies.",
        ),
        Text(
            nl="De regels voor studenten van buiten de EU/EER en Zwitserland zijn gecontroleerd voor de verblijfsvergunning studie aan een hbo-instelling of universiteit. Heb je een andere verblijfsvergunning, dan kunnen andere regels gelden.",
            en="The rules for students from outside the EU/EEA and Switzerland were checked for the student residence permit for higher professional education or university. If you hold a different residence permit, other rules may apply.",
        ),
    ),
    exceptions=(
        Text(
            nl="Stage die bij je opleiding hoort: daarvoor is geen TWV nodig. Je werkgever sluit wel een stageovereenkomst met jou en je onderwijsinstelling.",
            en="An internship that is part of your study programme does not need a TWV. Your employer does make an internship agreement with you and your educational institution.",
        ),
        Text(
            nl="Werken als zelfstandige: met een verblijfsvergunning studie heb je daarvoor geen TWV nodig en geldt de urengrens niet, zolang je blijft voldoen aan de voorwaarden van je verblijfsvergunning. Je moet je wel inschrijven bij de Kamer van Koophandel (KvK) en belasting betalen.",
            en="Working as a self-employed person: with a student residence permit you do not need a TWV for this and the hour limit does not apply, as long as you keep meeting the requirements of your permit. You do have to register with the Chamber of Commerce (KvK) and pay tax.",
        ),
        Text(
            nl="Ben je afgestudeerd en heb je een verblijfsvergunning zoekjaar hoogopgeleiden? Dan mag je vrij werken en heeft je werkgever geen TWV nodig.",
            en="Graduated and holding a residence permit for the orientation year? Then you may work freely and your employer does not need a TWV.",
        ),
    ),
    next_steps=(
        Text(
            nl="Kijk op de achterkant van je verblijfsvergunning: daar staat of je mag werken.",
            en="Look at the back of your residence permit: it states whether you may work.",
        ),
        Text(
            nl="Kom je van buiten de EU/EER en Zwitserland? Spreek met je werkgever af dat die de TWV aanvraagt voordat je begint. Zonder TWV mag je niet in loondienst werken.",
            en="From outside the EU/EEA and Switzerland? Agree with your employer that they apply for the TWV before you start. Without a TWV you may not work as an employee.",
        ),
        Text(
            nl="Blijf je langer dan 4 maanden in Nederland? Schrijf je dan binnen 5 dagen na aankomst in bij je gemeente. Daarna krijg je een burgerservicenummer (BSN).",
            en="Staying in the Netherlands for longer than 4 months? Register with your municipality within 5 days of arrival. You then receive a citizen service number (BSN).",
        ),
        Text(
            nl="Ga je betaald werken? Controleer bij de SVB of je een Nederlandse zorgverzekering moet afsluiten.",
            en="Starting paid work? Check with the SVB whether you need to take out Dutch health insurance.",
        ),
    ),
    contacts=(
        Contact(
            body="IND",
            label=Text(nl="Vragen over je verblijfsvergunning", en="Questions about your residence permit"),
            url=Text(
                nl="https://ind.nl/nl/verblijfsvergunningen/studie/verblijfsvergunning-studie-hbo-of-universiteit",
                en="https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education",
            ),
        ),
        Contact(
            body="UWV",
            label=Text(nl="De werkvergunning (TWV) — je werkgever vraagt die aan", en="The work permit (TWV) — your employer applies"),
            url=Text(
                nl="https://www.uwv.nl/nl/werkvergunning/werkstudent",
                en="https://www.uwv.nl/nl/werkvergunning/werkstudent",
            ),
        ),
        Contact(
            body="SVB",
            label=Text(nl="Ben je verzekerd? Vraag een onderzoek Wlz aan", en="Are you insured? Request a Wlz assessment"),
            url=Text(
                nl="https://www.svb.nl/nl/wlz/wanneer-verzekerd-voor-de-wlz/u-studeert-of-loopt-stage",
                en="https://www.svb.nl/nl/wlz/wanneer-verzekerd-voor-de-wlz/u-studeert-of-loopt-stage",
            ),
        ),
    ),
    sources=(
        "rvo-buitenlandse-werknemer",
        "ind-eu",
        "ind-studie",
        "uwv-werkstudent",
        "uwv-stage",
        "ind-zoekjaar",
        "rvo-brp",
        "svb-wlz-studie",
    ),
    claims=(
        Claim(
            id="eu-free",
            text="Met de nationaliteit van een EU/EER-land of Zwitserland mag je in Nederland werken zonder werkvergunning; je hebt wel een geldig paspoort of identiteitsbewijs nodig.",
            sources=("rvo-buitenlandse-werknemer", "ind-eu"),
            applies_to="EU/EER- en Zwitserse nationaliteit",
            checked_on=CHECKED,
        ),
        Claim(
            id="study-permit-twv-choice",
            text="Met een verblijfsvergunning studie mag je in loondienst werken als je werkgever een TWV voor je heeft; je moet kiezen tussen maximaal 16 uur per week of voltijd in juni, juli en augustus.",
            sources=("ind-studie", "uwv-werkstudent"),
            applies_to="Niet-EU/EER/Zwitserse nationaliteit met verblijfsvergunning studie hbo/wo, werk in loondienst",
            checked_on=CHECKED,
            open_questions="De IND-pagina zegt 'u moet kiezen' maar niet per welke periode (studiejaar of kalenderjaar); het artikel noemt daarom geen periode.",
        ),
        Claim(
            id="permit-back",
            text="Op de achterkant van de verblijfsvergunning staat of je mag werken.",
            sources=("ind-studie",),
            applies_to="Houders van een verblijfsvergunning studie",
            checked_on=CHECKED,
        ),
        Claim(
            id="internship-no-twv",
            text="Voor een stage die bij je Nederlandse opleiding hoort is geen TWV nodig; werkgever, stagiair en onderwijsinstelling sluiten een stageovereenkomst.",
            sources=("ind-studie", "uwv-stage"),
            applies_to="Studenten met verblijfsvergunning studie, stage als onderdeel van de opleiding",
            checked_on=CHECKED,
        ),
        Claim(
            id="self-employed",
            text="Als zelfstandige heb je met een verblijfsvergunning studie geen TWV nodig en mag je zoveel werken als je wilt, zolang je aan de voorwaarden van de vergunning voldoet; inschrijving bij de KvK en belasting betalen zijn verplicht.",
            sources=("ind-studie",),
            applies_to="Zelfstandigen met verblijfsvergunning studie hbo/wo",
            checked_on=CHECKED,
        ),
        Claim(
            id="orientation-year-free",
            text="Met een verblijfsvergunning zoekjaar hoogopgeleiden mag je vrij werken; de werkgever heeft geen TWV nodig.",
            sources=("ind-zoekjaar",),
            applies_to="Houders van een verblijfsvergunning zoekjaar hoogopgeleiden",
            checked_on=CHECKED,
        ),
        Claim(
            id="brp-5-days",
            text="Wie langer dan 4 maanden in Nederland komt wonen, schrijft zich binnen 5 dagen na aankomst in bij de gemeente en krijgt daarna een BSN.",
            sources=("rvo-brp",),
            applies_to="Iedereen die langer dan 4 maanden in Nederland woont",
            checked_on=CHECKED,
        ),
        Claim(
            id="work-insurance-check",
            text="Wie een betaalde bijbaan heeft, kan verzekerd zijn voor de Wlz en moet dan een zorgverzekering afsluiten; de SVB beoordeelt dit per situatie.",
            sources=("svb-wlz-studie",),
            applies_to="Buitenlandse studenten in Nederland met betaald werk",
            checked_on=CHECKED,
        ),
    ),
    job_link=JobLink(
        label=Text(nl="Bekijk vacatures waarvoor alleen Engels nodig is", en="See vacancies that only require English"),
        query="english_level=english_only",
    ),
    employer_link=True,
    related=("twv-work-permit", "health-insurance", "documents-to-start"),
    open_questions=(
        "Uitzonderingen voor specifieke nationaliteiten (bijvoorbeeld op grond van verdragen) zijn niet onderzocht.",
        "Regels voor een verblijfsvergunning studie mbo of voortgezet onderwijs zijn niet gecontroleerd.",
    ),
)
