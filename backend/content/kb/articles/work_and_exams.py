from content.kb.model import Article, Claim, Contact, JobLink, Section, Text
from content.kb.sources import CHECKED

ARTICLE = Article(
    slug="work-and-exams",
    order=7,
    sensitive=True,
    status="draft",
    drafted_by="AI draft (Claude), sources read 2026-09-29; not yet reviewed by a person",
    title=Text(
        nl="Werk combineren met colleges en tentamens",
        en="Combining work with lectures and exams",
    ),
    summary=Text(
        nl="Plan je uren rond je rooster, weet hoe ver van tevoren je werkgever je moet oproepen, en houd je studievoortgang in de gaten.",
        en="Plan your hours around your timetable, know how much notice a call-in needs, and keep an eye on your study progress.",
    ),
    answer=(
        Text(
            nl="Maak afspraken over werktijden die je vooraf kunt plannen en geef je tentamenperiodes op tijd door aan je werkgever.",
            en="Agree on working times you can plan in advance and tell your employer about your exam periods in good time.",
        ),
        Text(
            nl="Heb je een verblijfsvergunning studie (van buiten de EU/EER en Zwitserland)? Houd je dan aan je keuze: maximaal 16 uur per week, of voltijd in juni, juli en augustus. En let op je studievoortgang: een voorwaarde voor je verblijfsvergunning is dat je elk studiejaar minimaal 50% van je studiepunten haalt.",
            en="Holding a student residence permit (from outside the EU/EEA and Switzerland)? Then stick to your choice: up to 16 hours a week, or full-time in June, July and August. And watch your study progress: a requirement of your residence permit is that you obtain at least 50% of your credits each study year.",
        ),
    ),
    applies_to=(
        Text(
            nl="Alle studenten met een baan naast hun studie. Het deel over uren en studievoortgang geldt voor studenten met een verblijfsvergunning studie aan een hbo-instelling of universiteit.",
            en="All students with a job alongside their studies. The part about hours and study progress applies to students with a student residence permit for higher professional education or university.",
        ),
    ),
    details=(
        Section(
            title=Text(nl="Oproepwerk en je rooster", en="On-call work and your timetable"),
            paragraphs=(
                Text(
                    nl="Werk je als oproepkracht? Dan moet je werkgever je minstens 4 kalenderdagen van tevoren oproepen. Word je later opgeroepen, dan hoef je niet te komen. In een cao kan die termijn korter zijn, tot minimaal 1 dag.",
                    en="Working on call? Then your employer must call you in at least 4 calendar days in advance. If you are called in later, you do not have to come. A collective agreement (cao) can shorten this to at least 1 day.",
                ),
            ),
        ),
        Section(
            title=Text(nl="Studievoortgang", en="Study progress"),
            paragraphs=(
                Text(
                    nl="Je onderwijsinstelling beoordeelt of je genoeg studiepunten hebt gehaald. Is dat niet zo en heb je geen goede reden, dan meldt de instelling dat bij de IND. De IND beoordeelt dan of je nog aan de voorwaarden voor je verblijfsvergunning voldoet.",
                    en="Your educational institution assesses whether you obtained enough credits. If not, and you have no good reason, the institution reports this to the IND. The IND then assesses whether you still meet the requirements for your residence permit.",
                ),
                Text(
                    nl="Vragen over je studievoortgang en hoe die wordt beoordeeld? Neem contact op met je onderwijsinstelling.",
                    en="Questions about your study progress and how it is assessed? Contact your educational institution.",
                ),
            ),
        ),
    ),
    exceptions=(
        Text(
            nl="Met een EU/EER- of Zwitserse nationaliteit mag je vrij werken; je verblijfsrecht als werkende of als student heeft eigen voorwaarden.",
            en="With an EU/EEA or Swiss nationality you may work freely; your right of residence as a worker or as a student has its own conditions.",
        ),
        Text(
            nl="Werk je als zelfstandige met een verblijfsvergunning studie? Dan geldt de urengrens niet, maar je moet wel blijven voldoen aan de voorwaarden van je verblijfsvergunning, zoals je studievoortgang.",
            en="Working as a self-employed person with a student residence permit? Then the hour limit does not apply, but you must keep meeting the requirements of your residence permit, such as your study progress.",
        ),
    ),
    next_steps=(
        Text(
            nl="Zet je rooster en tentamendata op een rij en deel ze zo vroeg mogelijk met je werkgever.",
            en="List your timetable and exam dates and share them with your employer as early as possible.",
        ),
        Text(
            nl="Spreek vaste dagen af, of een oproeptermijn die bij je rooster past.",
            en="Agree on fixed days, or a call-in notice that fits your timetable.",
        ),
        Text(
            nl="Loop je achter met studiepunten? Neem op tijd contact op met je onderwijsinstelling.",
            en="Falling behind on credits? Contact your educational institution in good time.",
        ),
    ),
    contacts=(
        Contact(
            body="IND",
            label=Text(nl="Voorwaarden van de verblijfsvergunning studie", en="Requirements of the student residence permit"),
            url=Text(
                nl="https://ind.nl/nl/verblijfsvergunningen/studie/verblijfsvergunning-studie-hbo-of-universiteit",
                en="https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education",
            ),
        ),
        Contact(
            body="Rijksoverheid",
            label=Text(nl="Oproepcontracten en de oproeptermijn", en="On-call contracts and call-in notice"),
            url=Text(
                nl="https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/welke-contracten-zijn-er-voor-oproepkrachten",
                en="https://www.rijksoverheid.nl/vraag-en-antwoord/arbeidsovereenkomst-en-cao/welke-contracten-zijn-er-voor-oproepkrachten",
            ),
        ),
    ),
    sources=("ind-studie", "rvo-oproepcontracten", "ind-eu"),
    claims=(
        Claim(
            id="hours-choice",
            text="Met een verblijfsvergunning studie kies je tussen maximaal 16 uur per week of voltijd in juni, juli en augustus.",
            sources=("ind-studie",),
            applies_to="Niet-EU/EER/Zwitserse nationaliteit met verblijfsvergunning studie hbo/wo, werk in loondienst",
            checked_on=CHECKED,
        ),
        Claim(
            id="progress-50",
            text="Voorwaarde verblijfsvergunning studie: elk studiejaar minimaal 50% van de studiepunten; bij onvoldoende voortgang zonder goede reden meldt de instelling dit bij de IND, die de voorwaarden opnieuw beoordeelt.",
            sources=("ind-studie",),
            applies_to="Houders van een verblijfsvergunning studie hbo/wo",
            checked_on=CHECKED,
        ),
        Claim(
            id="call-in-notice",
            text="Oproep minstens 4 kalenderdagen vooraf; later hoef je niet te komen; cao kan verkorten tot minimaal 1 dag.",
            sources=("rvo-oproepcontracten",),
            applies_to="Oproepkrachten",
            checked_on=CHECKED,
        ),
        Claim(
            id="eu-free-work",
            text="Met een EU/EER- of Zwitserse nationaliteit mag je vrij werken; verblijf langer dan 3 maanden heeft eigen voorwaarden voor werkenden en studenten.",
            sources=("ind-eu",),
            applies_to="EU/EER- en Zwitserse nationaliteit",
            checked_on=CHECKED,
        ),
        Claim(
            id="self-employed-conditions",
            text="Als zelfstandige met verblijfsvergunning studie geldt de urengrens niet, maar je moet aan de voorwaarden van de vergunning blijven voldoen.",
            sources=("ind-studie",),
            applies_to="Zelfstandigen met verblijfsvergunning studie hbo/wo",
            checked_on=CHECKED,
        ),
    ),
    job_link=JobLink(
        label=Text(nl="Bekijk vacatures waarvoor alleen Engels nodig is", en="See vacancies that only require English"),
        query="english_level=english_only",
    ),
    related=("employment-contract", "start-working"),
)
