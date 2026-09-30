from datetime import date

from content.kb.model import Article, Claim, Contact, JobLink, Section, Signal, Text
from content.kb.sources import CHECKED

# Content review by the owner: read on staging and approved on 2026-09-30.
REVIEWED = date(2026, 9, 30)

ARTICLE = Article(
    slug="employment-contract",
    order=5,
    sensitive=True,
    status="published",
    drafted_by="AI draft (Claude), sources read 2026-09-29; reviewed and approved by the owner (Tristan de Lange) on 2026-09-30",
    author="Tristan de Lange",
    reviewer="Tristan de Lange",
    reviewed_on=REVIEWED,
    title=Text(
        nl="Een arbeidsovereenkomst begrijpen: uren, loon en afspraken",
        en="Understanding an employment contract: hours, pay and agreements",
    ),
    summary=Text(
        nl="Wat je werkgever schriftelijk moet vastleggen, waar je recht op hebt qua loon en vakantiegeld, en hoe oproepcontracten werken.",
        en="What your employer must put in writing, what you are entitled to in pay and holiday pay, and how on-call contracts work.",
    ),
    answer=(
        Text(
            nl="Werk je in loondienst, dan heb je een arbeidsovereenkomst, ook als die alleen mondeling is afgesproken. Je werkgever moet je binnen 1 week na je start onder meer schriftelijk laten weten waar je werkt, wat je functie is, hoeveel uur je werkt en wat je verdient. Binnen 1 maand volgen onder meer je vakantiegeld, vakantiedagen en opzegtermijn.",
            en="If you work as an employee, you have an employment contract, even if it was only agreed verbally. Within 1 week of your start, your employer must tell you in writing, among other things, where you work, what your role is, how many hours you work and what you earn. Within 1 month follow, among other things, your holiday pay, holiday days and notice period.",
        ),
        Text(
            nl="Vanaf 21 jaar heb je recht op minimaal het wettelijk minimumloon; ben je jonger, dan geldt het minimumjeugdloon. Je vakantiegeld is minimaal 8% van je brutoloon.",
            en="From age 21 you are entitled to at least the statutory minimum wage; if you are younger, the youth minimum wage applies. Your holiday pay is at least 8% of your gross wage.",
        ),
    ),
    applies_to=(
        Text(
            nl="Iedereen die in Nederland in loondienst werkt, dus ook studenten met een bijbaan.",
            en="Everyone who works as an employee in the Netherlands, including students with a side job.",
        ),
        Text(
            nl="Heb je een verblijfsvergunning studie (van buiten de EU/EER en Zwitserland)? Dan gelden daarnaast de regels voor de TWV en de urengrens.",
            en="Holding a student residence permit (from outside the EU/EEA and Switzerland)? Then the rules for the TWV and the hour limit apply as well.",
        ),
    ),
    details=(
        Section(
            title=Text(nl="Loon", en="Pay"),
            paragraphs=(
                Text(
                    nl="Sinds 2024 is het minimumloon een bedrag per uur. Het hangt af van je leeftijd. De actuele bedragen staan op Rijksoverheid.nl; ze veranderen meestal twee keer per jaar.",
                    en="Since 2024 the minimum wage has been an hourly amount. It depends on your age. The current amounts are on Rijksoverheid.nl; they usually change twice a year.",
                ),
                Text(
                    nl="Je krijgt in elk geval een loonstrook bij je eerste loonbetaling, en daarna als er iets verandert in je loon of de loonheffingen. Een loonstrook elke maand is niet verplicht. Op de loonstrook staan onder meer je brutoloon, je uren, het minimumloon dat voor jou geldt en of je een oproepovereenkomst hebt.",
                    en="You always get a payslip with your first wage payment, and after that when something changes in your pay or payroll taxes. A payslip every month is not compulsory. The payslip shows, among other things, your gross wage, your hours, the minimum wage that applies to you and whether you have an on-call contract.",
                ),
                Text(
                    nl="Vakantiegeld is minimaal 8% van je brutojaarloon van het afgelopen jaar. Je werkgever betaalt het minstens 1 keer per jaar uit.",
                    en="Holiday pay is at least 8% of your gross annual wage over the past year. Your employer pays it out at least once a year.",
                ),
            ),
        ),
        Section(
            title=Text(nl="Oproepcontracten", en="On-call contracts"),
            paragraphs=(
                Text(
                    nl="Er zijn 3 soorten: een oproepcontract met voorovereenkomst, een nulurencontract en een min-maxcontract.",
                    en="There are 3 kinds: an on-call contract with a preliminary agreement, a zero-hours contract and a min-max contract.",
                ),
                Text(
                    nl="Je werkgever moet je minstens 4 kalenderdagen van tevoren oproepen, schriftelijk of elektronisch (bijvoorbeeld e-mail of WhatsApp). Word je later opgeroepen, dan hoef je niet te komen. Zegt je werkgever binnen 4 dagen af of verandert die de tijden, dan heb je recht op loon over de uren waarvoor je was opgeroepen. In een cao kan de oproeptermijn korter zijn, tot minimaal 1 dag.",
                    en="Your employer must call you in at least 4 calendar days in advance, in writing or electronically (for example email or WhatsApp). If you are called in later, you do not have to come. If your employer cancels within 4 days or changes the times, you are entitled to pay for the hours you were called in for. A collective agreement (cao) can shorten the notice to at least 1 day.",
                ),
                Text(
                    nl="Heb je een contract van minder dan 15 uur per week zonder afspraken over werktijden, of geen vaste afspraak over je uren (zoals een nulurencontract of min-maxcontract)? Dan krijg je per oproep minimaal 3 uur uitbetaald, ook als je korter werkt.",
                    en="Do you have a contract of fewer than 15 hours a week without agreed working times, or no fixed agreement on your hours (such as a zero-hours or min-max contract)? Then each call-in pays at least 3 hours, even if you work less.",
                ),
                Text(
                    nl="Werk je een jaar als oproepkracht en blijf je in dienst? Dan moet je werkgever je binnen een maand een vast aantal uren aanbieden, minimaal het gemiddelde van de afgelopen 12 maanden. Je mag dat aanbod weigeren.",
                    en="After a year as an on-call worker, if you stay employed, your employer must offer you a fixed number of hours within a month — at least your average over the past 12 months. You may turn the offer down.",
                ),
            ),
        ),
        Section(
            title=Text(nl="Wat er gaat veranderen", en="What is going to change"),
            paragraphs=(
                Text(
                    nl="De wet 'meer zekerheid flexwerkers' is op 7 juli 2026 aangenomen. Per 1 januari 2028 worden nulurencontracten vervangen door contracten met een minimum- en maximumaantal uren. Voor bijbanen van mensen met een andere hoofdactiviteit, zoals studenten, komt een uitzondering. Uitzendkrachten krijgen vanaf 31 december 2026 minimaal gelijkwaardige arbeidsvoorwaarden als werknemers die gewoon in dienst zijn. We werken dit artikel bij als de nieuwe regels ingaan.",
                    en="The 'more certainty for flex workers' act was passed on 7 July 2026. From 1 January 2028, zero-hours contracts will be replaced by contracts with a minimum and maximum number of hours. Side jobs of people with another main activity, such as students, get an exception. From 31 December 2026, agency workers get terms of employment at least equivalent to those of regular employees. We will update this article when the new rules take effect.",
                ),
            ),
        ),
    ),
    exceptions=(
        Text(
            nl="Stage: bij een echte stage staat leren centraal en heb je geen recht op het minimumloon; een stagevergoeding is niet verplicht. Doe je gewoon werk, dan is het geen stage maar een arbeidsovereenkomst, met recht op het minimumloon.",
            en="Internship: in a genuine internship the focus is on learning and you are not entitled to the minimum wage; an internship allowance is not compulsory. If you do regular work, it is not an internship but an employment contract, with the right to the minimum wage.",
        ),
        Text(
            nl="Geen duidelijke afspraken? Werk je 3 maanden lang elke week, of minimaal 20 uur per maand, voor dezelfde werkgever, dan mag je ervan uitgaan dat je een arbeidsovereenkomst hebt.",
            en="No clear agreement? If you work for the same employer every week for 3 months, or at least 20 hours a month, you may assume you have an employment contract.",
        ),
        Text(
            nl="Een cao kan afwijkende afspraken bevatten, bijvoorbeeld over de oproeptermijn of het vakantiegeld. Vraag je werkgever of er een cao geldt.",
            en="A collective agreement (cao) can contain different arrangements, for example on the call-in notice or holiday pay. Ask your employer whether a cao applies.",
        ),
    ),
    next_steps=(
        Text(
            nl="Controleer of je binnen 1 week de schriftelijke informatie over je werk, uren en loon hebt gekregen.",
            en="Check that you received the written information about your work, hours and pay within 1 week.",
        ),
        Text(
            nl="Vergelijk je loonstrook met het minimumloon voor jouw leeftijd.",
            en="Compare your payslip with the minimum wage for your age.",
        ),
        Text(
            nl="Werk je tegelijk bij meer werkgevers? Laat slechts 1 werkgever de loonheffingskorting toepassen. Had je in een jaar meerdere banen, doe dan aangifte: misschien krijg je belasting terug.",
            en="Working for several employers at the same time? Let only 1 of them apply the payroll tax credit. Had several jobs in a year? File a tax return: you may get tax back.",
        ),
        Text(
            nl="Krijg je minder dan het minimumloon? Meld dat bij de Nederlandse Arbeidsinspectie.",
            en="Paid less than the minimum wage? Report it to the Netherlands Labour Authority.",
        ),
    ),
    contacts=(
        Contact(
            body="Rijksoverheid",
            label=Text(nl="Actuele bedragen van het minimumloon", en="Current minimum wage amounts"),
            url=Text(
                nl="https://www.rijksoverheid.nl/themas/werk/minimumloon/bedragen-minimumloon/bedragen-minimumloon-2026",
                en="https://www.rijksoverheid.nl/themas/werk/minimumloon/bedragen-minimumloon/bedragen-minimumloon-2026",
            ),
        ),
        Contact(
            body="Belastingdienst",
            label=Text(nl="Loonheffingskorting en meerdere banen", en="Payroll tax credit and several jobs"),
            url=Text(
                nl="https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/ik-heb-verschillende-banen",
                en="https://www.belastingdienst.nl/wps/wcm/connect/nl/jongeren/content/ik-heb-verschillende-banen",
            ),
        ),
        Contact(
            body="Nederlandse Arbeidsinspectie",
            label=Text(nl="Onderbetaling melden (via Rijksoverheid)", en="Report underpayment (via Rijksoverheid)"),
            url=Text(
                nl="https://www.rijksoverheid.nl/onderwerpen/minimumloon/vraag-en-antwoord/minimumloon-stage",
                en="https://www.rijksoverheid.nl/onderwerpen/minimumloon/vraag-en-antwoord/minimumloon-stage",
            ),
        ),
    ),
    sources=(
        "rvo-arbeidsovereenkomst",
        "rvo-minimumloon",
        "rvo-minimumloon-bedragen",
        "rvo-loonstrook",
        "rvo-vakantiegeld",
        "rvo-oproepcontracten",
        "rvo-oproep-3uur",
        "rvo-flexwet",
        "rvo-stage-minimumloon",
        "bd-lhk-bijbaan",
        "bd-verschillende-banen",
        "ind-studie",
    ),
    claims=(
        Claim(
            id="oral-or-written",
            text="Een arbeidsovereenkomst kan schriftelijk of mondeling worden gesloten.",
            sources=("rvo-arbeidsovereenkomst",),
            applies_to="Werknemers",
            checked_on=CHECKED,
        ),
        Claim(
            id="written-info-1w-1m",
            text="Binnen 1 week schriftelijk: o.a. werkplek, functie, startdatum, uren, loon; binnen 1 maand: o.a. vakantietoeslag, vakantiedagen, opzegtermijn.",
            sources=("rvo-arbeidsovereenkomst",),
            applies_to="Werknemers",
            checked_on=CHECKED,
        ),
        Claim(
            id="presumption",
            text="3 maanden elke week of minimaal 20 uur per maand voor dezelfde werkgever: je mag uitgaan van een arbeidsovereenkomst.",
            sources=("rvo-arbeidsovereenkomst",),
            applies_to="Werkenden zonder duidelijk vastgelegde arbeidsrelatie",
            checked_on=CHECKED,
        ),
        Claim(
            id="minimum-wage",
            text="Vanaf 21 jaar het wettelijk minimumloon, jonger het minimumjeugdloon; sinds 2024 per uur, naar leeftijd.",
            sources=("rvo-minimumloon", "rvo-minimumloon-bedragen"),
            applies_to="Werknemers vanaf 15 jaar",
            checked_on=CHECKED,
        ),
        Claim(
            id="twice-a-year",
            text="De minimumloonbedragen veranderen meestal twee keer per jaar.",
            sources=("rvo-minimumloon-bedragen",),
            applies_to="Iedereen",
            checked_on=CHECKED,
            open_questions="De bronpagina toont bedragen per 1 januari en per 1 juli 2026; 'meestal twee keer per jaar' is daaruit afgeleid. Laat de beoordelaar bevestigen of schrappen.",
        ),
        Claim(
            id="payslip",
            text="Loonstrook bij de eerste loonbetaling en bij wijziging van loon of loonheffingen; maandelijks is niet verplicht; vermeldt o.a. brutoloon, uren, geldend minimumloon, oproepovereenkomst ja/nee.",
            sources=("rvo-loonstrook",),
            applies_to="Werknemers",
            checked_on=CHECKED,
        ),
        Claim(
            id="holiday-pay",
            text="Vakantiegeld minimaal 8% van het brutojaarsalaris van het afgelopen jaar, minstens 1 keer per jaar uitbetaald; cao kan afwijken bij minstens 108% van het minimumloon.",
            sources=("rvo-vakantiegeld",),
            applies_to="Werknemers",
            checked_on=CHECKED,
        ),
        Claim(
            id="on-call-types-notice",
            text="3 soorten oproepcontracten; oproep minstens 4 kalenderdagen vooraf, schriftelijk of elektronisch; later hoef je niet te komen; afzegging binnen 4 dagen geeft recht op loon; cao kan verkorten tot minimaal 1 dag.",
            sources=("rvo-oproepcontracten",),
            applies_to="Oproepkrachten",
            checked_on=CHECKED,
        ),
        Claim(
            id="three-hours",
            text="Minimaal 3 uur loon per oproep bij een contract < 15 uur zonder afspraken over werktijden, of zonder vaste urenafspraak.",
            sources=("rvo-oproep-3uur",),
            applies_to="Oproepkrachten",
            checked_on=CHECKED,
        ),
        Claim(
            id="fixed-hours-offer",
            text="Na 1 jaar oproepcontract: aanbod vaste uren binnen een maand, minimaal het gemiddelde over 12 maanden; weigeren mag.",
            sources=("rvo-oproepcontracten",),
            applies_to="Oproepkrachten die na 1 jaar in dienst blijven",
            checked_on=CHECKED,
        ),
        Claim(
            id="flex-law",
            text="Wet meer zekerheid flexwerkers aangenomen 7 juli 2026: per 1 januari 2028 bandbreedtecontract i.p.v. nulurencontract, uitzondering voor bijbanen van o.a. studenten; uitzendkrachten gelijkwaardige voorwaarden per 31 december 2026.",
            sources=("rvo-flexwet",),
            applies_to="Flexwerkers, oproepkrachten, uitzendkrachten",
            checked_on=CHECKED,
            open_questions="De precieze voorwaarden van de uitzondering voor studenten staan niet in het nieuwsbericht; herbeoordelen zodra Rijksoverheid er uitleg over publiceert.",
        ),
        Claim(
            id="internship-wage",
            text="Bij een echte stage geen recht op minimumloon en geen verplichte stagevergoeding; gewoon werk = arbeidsovereenkomst met minimumloon; onderbetaling melden bij de Nederlandse Arbeidsinspectie.",
            sources=("rvo-stage-minimumloon",),
            applies_to="Stagiairs",
            checked_on=CHECKED,
        ),
        Claim(
            id="tax-credit-several-jobs",
            text="Bij meerdere werkgevers tegelijk loonheffingskorting bij 1 werkgever; bij banen na elkaar krijg je mogelijk belasting terug via aangifte.",
            sources=("bd-lhk-bijbaan", "bd-verschillende-banen"),
            applies_to="Werknemers met meerdere banen",
            checked_on=CHECKED,
        ),
        Claim(
            id="permit-rules-apply",
            text="Met een verblijfsvergunning studie gelden daarnaast de TWV en de urengrens.",
            sources=("ind-studie",),
            applies_to="Niet-EU/EER/Zwitserse nationaliteit met verblijfsvergunning studie hbo/wo",
            checked_on=CHECKED,
        ),
    ),
    signals=(
        Signal(
            on=date(2026, 12, 31),
            note="Gelijkwaardige arbeidsvoorwaarden voor uitzendkrachten treden in werking.",
            sources=("rvo-flexwet",),
        ),
        Signal(
            on=date(2027, 1, 1),
            note="Nieuwe minimumloonbedragen en een hoger minimumjeugdloon; controleer de link naar de bedragenpagina (die heet nu 'Bedragen minimumloon 2026').",
            sources=("rvo-minimumloon", "rvo-minimumloon-bedragen"),
        ),
        Signal(
            on=date(2028, 1, 1),
            note="Nulurencontracten vervangen door bandbreedtecontracten (met uitzondering voor studenten met een bijbaan).",
            sources=("rvo-flexwet",),
        ),
    ),
    job_link=JobLink(
        label=Text(nl="Bekijk vacatures waarvoor alleen Engels nodig is", en="See vacancies that only require English"),
        query="english_level=english_only",
    ),
    employer_link=True,
    related=("documents-to-start", "twv-work-permit", "work-and-exams"),
)
