from content.kb.model import Article, Claim, Contact, JobLink, Section, Text
from content.kb.sources import CHECKED

ARTICLE = Article(
    slug="twv-work-permit",
    order=2,
    sensitive=True,
    status="draft",
    drafted_by="AI draft (Claude), sources read 2026-09-29; not yet reviewed by a person",
    title=Text(nl="Wanneer is een TWV nodig?", en="When do you need a TWV work permit?"),
    summary=Text(
        nl="De tewerkstellingsvergunning (TWV) is de werkvergunning die je werkgever bij UWV aanvraagt. Voor wie is die nodig, en voor wie niet?",
        en="The TWV is the work permit your employer applies for at UWV. Who needs one, and who does not?",
    ),
    answer=(
        Text(
            nl="Heb je een verblijfsvergunning voor studie en wil je naast je studie in loondienst werken? Dan moet je werkgever een tewerkstellingsvergunning (TWV) voor je hebben. Die vraagt je werkgever aan bij UWV, niet jijzelf.",
            en="Do you hold a student residence permit and want to work as an employee alongside your studies? Then your employer must have a work permit (in Dutch: tewerkstellingsvergunning, TWV) for you. Your employer applies for it at UWV, not you.",
        ),
        Text(
            nl="Met de nationaliteit van een EU/EER-land of Zwitserland is geen TWV nodig.",
            en="With the nationality of an EU or EEA country or Switzerland, no TWV is needed.",
        ),
    ),
    applies_to=(
        Text(
            nl="Studenten met een nationaliteit van buiten de EU/EER en Zwitserland, met een verblijfsvergunning studie aan een hbo-instelling of universiteit, die in loondienst willen werken.",
            en="Students with a nationality from outside the EU/EEA and Switzerland, holding a student residence permit for higher professional education or university, who want to work as an employee.",
        ),
        Text(
            nl="Werkgevers die zo'n student in dienst willen nemen.",
            en="Employers who want to hire such a student.",
        ),
    ),
    details=(
        Section(
            title=Text(nl="Wat de TWV voor een werkstudent inhoudt", en="What the TWV for a working student means"),
            paragraphs=(
                Text(
                    nl="Het werk is een bijbaan naast je studie. Je werkt maximaal 16 uur per week, of voltijd in juni, juli en augustus. Volgens de IND moet je tussen die twee kiezen.",
                    en="The work is a side job alongside your studies. You work up to 16 hours a week, or full-time in June, July and August. According to the IND, you must choose between the two.",
                ),
                Text(
                    nl="De TWV voor een werkstudent is maximaal 1 jaar geldig.",
                    en="The TWV for a working student is valid for at most 1 year.",
                ),
                Text(
                    nl="Het loon moet marktconform zijn.",
                    en="The pay must be in line with the market (marktconform).",
                ),
            ),
        ),
        Section(
            title=Text(nl="Hoe je werkgever de TWV aanvraagt", en="How your employer applies"),
            paragraphs=(
                Text(
                    nl="De werkgever vraagt de TWV aan via het werkgeversportaal van UWV en logt daar in met eHerkenning. Voor een werkstudent hoeft de werkgever geen documenten mee te sturen.",
                    en="The employer applies through UWV's employer portal and logs in with eHerkenning. For a working student, the employer does not need to send documents with the application.",
                ),
                Text(
                    nl="UWV beslist binnen 5 weken na de aanvraag. Mist UWV nog informatie, dan belt of schrijft UWV de werkgever en neemt pas een beslissing als alles binnen is.",
                    en="UWV decides within 5 weeks of the application. If information is missing, UWV calls or writes to the employer and only decides once everything has been received.",
                ),
                Text(
                    nl="Heeft je werkgever al een TWV voor je, maar ga je ander werk doen of verloopt de TWV binnenkort? Dan vraagt je werkgever een nieuwe aan.",
                    en="Does your employer already have a TWV for you, but will you do different work or is the TWV about to expire? Then your employer applies for a new one.",
                ),
            ),
        ),
        Section(
            title=Text(nl="Wat er gebeurt als het niet klopt", en="What happens if it is not right"),
            paragraphs=(
                Text(
                    nl="De Nederlandse Arbeidsinspectie controleert of je werkgever een TWV heeft en of je niet meer werkt dan toegestaan. Werk je zonder TWV of meer dan toegestaan? Dan meldt de Arbeidsinspectie dit bij de IND en krijgt je werkgever een boete. De IND neemt dan contact op met je onderwijsinstelling.",
                    en="The Netherlands Labour Authority checks whether your employer has a TWV and whether you work more than allowed. Working without a TWV or more than allowed? Then the Labour Authority reports this to the IND and fines your employer. The IND then contacts your educational institution.",
                ),
            ),
        ),
    ),
    exceptions=(
        Text(
            nl="Stage die bij je Nederlandse opleiding hoort: geen TWV nodig. Wel een stageovereenkomst tussen werkgever, jou en je onderwijsinstelling.",
            en="An internship that is part of your Dutch study programme: no TWV needed. There must be an internship agreement between the employer, you and your educational institution.",
        ),
        Text(
            nl="Werken als zelfstandige met een verblijfsvergunning studie: geen TWV nodig. Wel inschrijven bij de KvK en belasting betalen.",
            en="Working as a self-employed person with a student residence permit: no TWV needed. You do register with the KvK and pay tax.",
        ),
        Text(
            nl="Verblijfsvergunning zoekjaar hoogopgeleiden: je mag vrij werken, zonder TWV.",
            en="Residence permit for the orientation year: you may work freely, without a TWV.",
        ),
    ),
    next_steps=(
        Text(
            nl="Vraag je werkgever vóór je eerste werkdag of de TWV is verleend. Begin niet eerder.",
            en="Ask your employer before your first working day whether the TWV has been granted. Do not start earlier.",
        ),
        Text(
            nl="Houd je aan je keuze: maximaal 16 uur per week, of voltijd in juni, juli en augustus.",
            en="Stick to your choice: up to 16 hours a week, or full-time in June, July and August.",
        ),
        Text(
            nl="Werkgever? Vraag de TWV aan via het werkgeversportaal van UWV. Houd rekening met een beslistermijn van 5 weken.",
            en="Employer? Apply through UWV's employer portal and allow for a decision period of 5 weeks.",
        ),
    ),
    contacts=(
        Contact(
            body="UWV",
            label=Text(nl="Voorwaarden en aanvraag van de TWV voor een werkstudent", en="Conditions and application of the TWV for a working student"),
            url=Text(
                nl="https://www.uwv.nl/nl/werkvergunning/werkstudent",
                en="https://www.uwv.nl/nl/werkvergunning/werkstudent",
            ),
        ),
        Contact(
            body="IND",
            label=Text(nl="Wat je verblijfsvergunning studie toestaat", en="What your student residence permit allows"),
            url=Text(
                nl="https://ind.nl/nl/verblijfsvergunningen/studie/verblijfsvergunning-studie-hbo-of-universiteit",
                en="https://ind.nl/en/residence-permits/study/student-residence-permit-for-university-or-higher-professional-education",
            ),
        ),
    ),
    sources=(
        "uwv-werkstudent",
        "uwv-twv-aanvragen",
        "ind-studie",
        "rvo-buitenlandse-werknemer",
        "ind-eu",
        "uwv-stage",
        "ind-zoekjaar",
    ),
    claims=(
        Claim(
            id="employer-applies",
            text="De werkgever vraagt de TWV aan bij UWV, via het werkgeversportaal met eHerkenning.",
            sources=("uwv-twv-aanvragen",),
            applies_to="Werkgevers van werknemers van buiten de EU/EER en Zwitserland",
            checked_on=CHECKED,
        ),
        Claim(
            id="study-permit-needs-twv",
            text="Met een verblijfsvergunning studie mag je alleen in loondienst werken als je werkgever een TWV voor je heeft.",
            sources=("ind-studie",),
            applies_to="Niet-EU/EER/Zwitserse nationaliteit met verblijfsvergunning studie hbo/wo",
            checked_on=CHECKED,
        ),
        Claim(
            id="eu-no-twv",
            text="Voor de nationaliteit van een EU/EER-land of Zwitserland is geen TWV nodig.",
            sources=("rvo-buitenlandse-werknemer", "ind-eu"),
            applies_to="EU/EER- en Zwitserse nationaliteit",
            checked_on=CHECKED,
        ),
        Claim(
            id="werkstudent-conditions",
            text="TWV werkstudent: bijbaan naast de studie, maximaal 16 uur per week of voltijd in juni, juli en augustus, marktconform loon, maximaal 1 jaar geldig, geen documenten nodig bij de aanvraag.",
            sources=("uwv-werkstudent",),
            applies_to="Werkstudenten met verblijfsvergunning studie",
            checked_on=CHECKED,
        ),
        Claim(
            id="must-choose",
            text="Je moet kiezen tussen maximaal 16 uur per week en voltijd in juni, juli en augustus.",
            sources=("ind-studie",),
            applies_to="Niet-EU/EER/Zwitserse nationaliteit met verblijfsvergunning studie hbo/wo",
            checked_on=CHECKED,
            open_questions="De periode waarvoor de keuze geldt, staat niet op de bronpagina.",
        ),
        Claim(
            id="decision-5-weeks",
            text="UWV beslist binnen 5 weken; ontbreekt informatie, dan pas na ontvangst van alle informatie.",
            sources=("uwv-twv-aanvragen",),
            applies_to="Alle TWV-aanvragen",
            checked_on=CHECKED,
        ),
        Claim(
            id="new-twv",
            text="Voor ander werk, of als de TWV binnenkort verloopt, vraagt de werkgever een nieuwe TWV aan.",
            sources=("uwv-twv-aanvragen",),
            applies_to="Werkgevers met een bestaande TWV",
            checked_on=CHECKED,
        ),
        Claim(
            id="enforcement",
            text="De Arbeidsinspectie controleert TWV en uren; bij overtreding melding aan de IND, boete voor de werkgever en contact van de IND met de onderwijsinstelling.",
            sources=("ind-studie",),
            applies_to="Werkstudenten met verblijfsvergunning studie en hun werkgevers",
            checked_on=CHECKED,
        ),
        Claim(
            id="exceptions",
            text="Geen TWV nodig voor een stage die bij de opleiding hoort, voor werk als zelfstandige met verblijfsvergunning studie, en met een verblijfsvergunning zoekjaar hoogopgeleiden.",
            sources=("ind-studie", "uwv-stage", "ind-zoekjaar"),
            applies_to="Zie per uitzondering",
            checked_on=CHECKED,
        ),
    ),
    job_link=JobLink(
        label=Text(
            nl="Bekijk vacatures waarbij de werkgever aangeeft een TWV aan te vragen",
            en="See vacancies where the employer states it will apply for a TWV",
        ),
        query="permit_support=twv_provided",
    ),
    employer_link=True,
    related=("start-working", "employment-contract"),
    open_questions=(
        "Of een TWV-aanvraag kosten meebrengt voor de werkgever is niet gecontroleerd; het artikel zegt daarom niets over kosten.",
        "Uitzonderingen voor specifieke nationaliteiten zijn niet onderzocht.",
    ),
)
