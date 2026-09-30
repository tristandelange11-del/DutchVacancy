from content.kb.model import Article, Claim, Contact, JobLink, Section, Text
from content.kb.sources import CHECKED

ARTICLE = Article(
    slug="documents-to-start",
    order=4,
    sensitive=True,
    status="draft",
    drafted_by="AI draft (Claude), sources read 2026-09-29; not yet reviewed by a person",
    title=Text(
        nl="Welke documenten en gegevens heb je nodig om te beginnen?",
        en="Which documents and details do you need to start?",
    ),
    summary=Text(
        nl="Identiteitsbewijs, BSN, het formulier voor de loonheffingskorting en — van buiten de EU/EER en Zwitserland — je verblijfsvergunning en de TWV van je werkgever.",
        en="ID, BSN, the payroll tax credit form and — from outside the EU/EEA and Switzerland — your residence permit and your employer's TWV.",
    ),
    answer=(
        Text(
            nl="Wat je nodig hebt, hangt af van je nationaliteit en het soort werk. Voor werk in loondienst zijn dit de belangrijkste stukken: een geldig paspoort of identiteitsbewijs, je burgerservicenummer (BSN) en het formulier waarmee je je werkgever laat weten of die loonheffingskorting moet toepassen.",
            en="What you need depends on your nationality and the kind of work. For work as an employee, these are the key items: a valid passport or identity card, your citizen service number (BSN) and the form that tells your employer whether to apply the payroll tax credit (loonheffingskorting).",
        ),
        Text(
            nl="Kom je van buiten de EU/EER en Zwitserland? Dan heb je ook je verblijfsvergunning nodig, en moet je werkgever een werkvergunning (TWV) voor je hebben voordat je begint.",
            en="From outside the EU/EEA and Switzerland? Then you also need your residence permit, and your employer must have a work permit (TWV) for you before you start.",
        ),
    ),
    applies_to=(
        Text(
            nl="Studenten die in Nederland in loondienst gaan werken, bijvoorbeeld in een bijbaan.",
            en="Students who are going to work as an employee in the Netherlands, for example in a side job.",
        ),
    ),
    details=(
        Section(
            title=Text(nl="BSN en inschrijving bij de gemeente", en="BSN and registering with the municipality"),
            paragraphs=(
                Text(
                    nl="Blijf je langer dan 4 maanden in Nederland? Dan schrijf je je binnen 5 dagen na aankomst in bij de gemeente waar je woont. Na de inschrijving krijg je een BSN. Inschrijven is gratis.",
                    en="Staying in the Netherlands for longer than 4 months? Then register with the municipality where you live within 5 days of arrival. After registering you get a BSN. Registration is free.",
                ),
                Text(
                    nl="Je BSN heb je nodig voor contact met de overheid, bijvoorbeeld voor belastingzaken en zorg.",
                    en="You need your BSN for contact with the government, for example for tax matters and healthcare.",
                ),
            ),
        ),
        Section(
            title=Text(nl="Loonheffingskorting", en="Payroll tax credit"),
            paragraphs=(
                Text(
                    nl="Als je werkt, heb je recht op korting op je belasting: de loonheffingskorting. Je geeft op een formulier aan of je werkgever die moet toepassen. Studenten gebruiken daarvoor meestal het formulier 'Model opgaaf gegevens voor de loonheffingen (studenten- en scholierenregeling)'. Dat krijg je meestal van je werkgever.",
                    en="When you work, you are entitled to a reduction of your tax: the payroll tax credit. On a form you tell your employer whether to apply it. Students usually use the form 'Model opgaaf gegevens voor de loonheffingen (studenten- en scholierenregeling)'. You usually get it from your employer.",
                ),
                Text(
                    nl="Werk je tegelijk bij meer dan 1 werkgever? Laat dan slechts 1 werkgever de loonheffingskorting toepassen. Anders moet je achteraf waarschijnlijk belasting terugbetalen.",
                    en="Working for more than 1 employer at the same time? Then let only 1 employer apply the payroll tax credit. Otherwise you will probably have to pay tax back afterwards.",
                ),
            ),
        ),
        Section(
            title=Text(nl="Je loon ontvangen", en="Getting paid"),
            paragraphs=(
                Text(
                    nl="Werk je met een TWV? Dan stort je werkgever je salaris iedere maand op je bankrekening; dat is een voorwaarde van UWV. Een rekening open je bij een bank.",
                    en="Working with a TWV? Then your employer pays your salary into your bank account every month; this is one of UWV's conditions. You open an account with a bank.",
                ),
            ),
        ),
        Section(
            title=Text(nl="Wat je van je werkgever krijgt", en="What your employer gives you"),
            paragraphs=(
                Text(
                    nl="Je werkgever moet je binnen 1 week na je start schriftelijk informeren over onder meer je werkplek, je functie, je startdatum, je uren en je loon. Binnen 1 maand volgen onder meer je vakantiegeld, vakantiedagen en opzegtermijn. Bewaar deze informatie.",
                    en="Within 1 week of your start, your employer must tell you in writing about, among other things, where you work, your role, your start date, your hours and your pay. Within 1 month follow, among other things, your holiday pay, holiday days and notice period. Keep this information.",
                ),
            ),
        ),
        Section(
            title=Text(nl="DigiD", en="DigiD"),
            paragraphs=(
                Text(
                    nl="Met DigiD regel je zaken met de overheid online, bijvoorbeeld met de Belastingdienst. Je vraagt DigiD aan via digid.nl.",
                    en="With DigiD you handle government matters online, for example with the Tax Administration. You apply for DigiD at digid.nl.",
                ),
            ),
        ),
    ),
    exceptions=(
        Text(
            nl="Blijf je korter dan 4 maanden in Nederland? Dan kun je je inschrijven als niet-ingezetene. Ook dan krijg je een BSN.",
            en="Staying in the Netherlands for less than 4 months? Then you can register as a non-resident. You also get a BSN that way.",
        ),
        Text(
            nl="Stage die bij je opleiding hoort: je sluit een stageovereenkomst met je werkgever en je onderwijsinstelling. Een TWV is dan niet nodig.",
            en="An internship that is part of your study programme: you sign an internship agreement with your employer and your educational institution. No TWV is needed then.",
        ),
        Text(
            nl="Werk je als zelfstandige met een verblijfsvergunning studie? Dan schrijf je je in bij de Kamer van Koophandel (KvK) en betaal je zelf belasting.",
            en="Working as a self-employed person with a student residence permit? Then you register with the Chamber of Commerce (KvK) and pay tax yourself.",
        ),
    ),
    next_steps=(
        Text(
            nl="Maak een afspraak bij je gemeente om je in te schrijven (binnen 5 dagen na aankomst als je hier langer dan 4 maanden blijft).",
            en="Make an appointment with your municipality to register (within 5 days of arrival if you stay longer than 4 months).",
        ),
        Text(
            nl="Van buiten de EU/EER en Zwitserland? Vraag je werkgever of de TWV is verleend voordat je begint.",
            en="From outside the EU/EEA and Switzerland? Ask your employer whether the TWV has been granted before you start.",
        ),
        Text(
            nl="Vul het formulier voor de loonheffingskorting in en kies bij meerdere banen tegelijk 1 werkgever.",
            en="Fill in the payroll tax credit form and, with several jobs at once, choose 1 employer.",
        ),
        Text(
            nl="Controleer of je een Nederlandse zorgverzekering nodig hebt.",
            en="Check whether you need Dutch health insurance.",
        ),
    ),
    contacts=(
        Contact(
            body="Gemeente",
            label=Text(nl="Inschrijven en je BSN krijgen", en="Registering and getting your BSN"),
            url=Text(
                nl="https://www.rijksoverheid.nl/vraag-en-antwoord/privacy-en-persoonsgegevens/wanneer-in-brp-inschrijven",
                en="https://www.rijksoverheid.nl/vraag-en-antwoord/privacy-en-persoonsgegevens/wanneer-in-brp-inschrijven",
            ),
        ),
        Contact(
            body="Belastingdienst",
            label=Text(nl="Loonheffingskorting met een bijbaan", en="Payroll tax credit with a side job"),
            url=Text(
                nl="https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/loonheffingskorting-met-een-bijbaan",
                en="https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/loonheffingskorting-met-een-bijbaan",
            ),
        ),
    ),
    sources=(
        "rvo-buitenlandse-werknemer",
        "ind-studie",
        "rvo-brp",
        "rvo-bsn",
        "bd-lhk-bijbaan",
        "uwv-twv-voorwaarden",
        "rvo-regelen-wonen",
        "rvo-arbeidsovereenkomst",
        "uwv-stage",
    ),
    claims=(
        Claim(
            id="id-document",
            text="Met een EU/EER- of Zwitserse nationaliteit heb je een geldig paspoort of identiteitsbewijs nodig om hier te werken.",
            sources=("rvo-buitenlandse-werknemer",),
            applies_to="EU/EER- en Zwitserse nationaliteit",
            checked_on=CHECKED,
        ),
        Claim(
            id="permit-and-twv",
            text="Met een verblijfsvergunning studie mag je in loondienst werken als je werkgever een TWV voor je heeft.",
            sources=("ind-studie",),
            applies_to="Niet-EU/EER/Zwitserse nationaliteit met verblijfsvergunning studie hbo/wo",
            checked_on=CHECKED,
        ),
        Claim(
            id="brp-bsn",
            text="Langer dan 4 maanden: binnen 5 dagen na aankomst inschrijven bij de gemeente, gratis, daarna een BSN; korter: inschrijving als niet-ingezetene, ook met BSN.",
            sources=("rvo-brp",),
            applies_to="Iedereen die in Nederland komt wonen of verblijven",
            checked_on=CHECKED,
        ),
        Claim(
            id="bsn-use",
            text="Het BSN heb je nodig voor contact met de overheid, bijvoorbeeld voor zorg en belastingzaken.",
            sources=("rvo-bsn",),
            applies_to="Iedereen met een BSN",
            checked_on=CHECKED,
            open_questions="Een officiële bron die zegt dat de werkgever je BSN nodig heeft is niet gelezen; het artikel zegt dat daarom niet.",
        ),
        Claim(
            id="lhk-form",
            text="Loonheffingskorting vraag je aan bij je werkgever met het formulier 'Model opgaaf gegevens voor de loonheffingen (studenten- en scholierenregeling)', dat je meestal van je werkgever krijgt; bij meerdere werkgevers tegelijk bij 1 werkgever.",
            sources=("bd-lhk-bijbaan",),
            applies_to="Studenten in loondienst",
            checked_on=CHECKED,
        ),
        Claim(
            id="salary-bank",
            text="Bij een TWV stort de werkgever het salaris iedere maand op de bankrekening van de werknemer.",
            sources=("uwv-twv-voorwaarden",),
            applies_to="Werknemers met een TWV",
            checked_on=CHECKED,
            open_questions="Of werkgevers in het algemeen een Nederlandse rekening eisen is niet gecontroleerd; het artikel zegt dat niet.",
        ),
        Claim(
            id="bank-and-digid",
            text="Een bankrekening open je bij een bank; DigiD vraag je aan via digid.nl en gebruik je voor zaken met de overheid, zoals de Belastingdienst.",
            sources=("rvo-regelen-wonen",),
            applies_to="Nieuwe inwoners van Nederland",
            checked_on=CHECKED,
        ),
        Claim(
            id="written-info",
            text="De werkgever informeert je binnen 1 week schriftelijk over o.a. werkplek, functie, startdatum, uren en loon, en binnen 1 maand over o.a. vakantiegeld, vakantiedagen en opzegtermijn.",
            sources=("rvo-arbeidsovereenkomst",),
            applies_to="Werknemers met een arbeidsovereenkomst",
            checked_on=CHECKED,
        ),
        Claim(
            id="internship-self-employed",
            text="Stage die bij de opleiding hoort: stageovereenkomst, geen TWV. Zelfstandige met verblijfsvergunning studie: KvK-inschrijving en belasting.",
            sources=("uwv-stage", "ind-studie"),
            applies_to="Stagiairs en zelfstandigen met verblijfsvergunning studie",
            checked_on=CHECKED,
        ),
    ),
    job_link=JobLink(
        label=Text(nl="Bekijk vacatures waarvoor alleen Engels nodig is", en="See vacancies that only require English"),
        query="english_level=english_only",
    ),
    related=("start-working", "employment-contract", "health-insurance"),
    open_questions=(
        "Welke documenten een gemeente bij inschrijving vraagt, verschilt per gemeente en is niet gecontroleerd; het artikel noemt ze daarom niet.",
    ),
)
