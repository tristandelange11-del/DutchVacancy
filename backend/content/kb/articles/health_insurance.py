from content.kb.model import Article, Claim, Contact, JobLink, Section, Text
from content.kb.sources import CHECKED

ARTICLE = Article(
    slug="health-insurance",
    order=3,
    sensitive=True,
    status="draft",
    drafted_by="AI draft (Claude), sources read 2026-09-29; not yet reviewed by a person",
    title=Text(
        nl="Wat betekent werken naast je studie voor je zorgverzekering?",
        en="What does working alongside your studies mean for your health insurance?",
    ),
    summary=Text(
        nl="Ben je alleen voor je studie in Nederland, dan is een Nederlandse zorgverzekering meestal niet nodig. Met een betaalde bijbaan kan dat veranderen.",
        en="If you are in the Netherlands only to study, Dutch health insurance is usually not needed. A paid side job can change that.",
    ),
    answer=(
        Text(
            nl="Ben je als buitenlandse student alleen voor je studie in Nederland? Dan hoef je volgens de SVB meestal geen Nederlandse zorgverzekering af te sluiten.",
            en="Are you in the Netherlands as an international student only for your studies? Then according to the SVB you usually do not need to take out Dutch health insurance.",
        ),
        Text(
            nl="Heb je een betaalde bijbaan? Dan kun je wel verzekerd zijn voor de Wet langdurige zorg (Wlz) en moet je een Nederlandse zorgverzekering afsluiten. Of dat voor jou geldt, hangt af van je situatie. De SVB kan dat voor je onderzoeken.",
            en="Do you have a paid side job? Then you may be insured under the Long-term Care Act (Wlz), and you must take out Dutch health insurance. Whether this applies to you depends on your situation. The SVB can assess it for you.",
        ),
    ),
    applies_to=(
        Text(
            nl="Buitenlandse studenten in Nederland die betaald werk (gaan) doen, zoals een bijbaan.",
            en="International students in the Netherlands who do, or are about to do, paid work such as a side job.",
        ),
    ),
    details=(
        Section(
            title=Text(nl="Als je moet: hoe snel?", en="If you have to: how soon?"),
            paragraphs=(
                Text(
                    nl="Volgens Rijksoverheid ben je verplicht een Nederlandse zorgverzekering af te sluiten zodra je in Nederland werkt, als je een Nederlandse werkgever hebt, op vaste basis voor die werkgever werkt en loonbelasting betaalt.",
                    en="According to the Dutch government, you must take out Dutch health insurance as soon as you work in the Netherlands if you have a Dutch employer, work for that employer on a regular basis and pay wage tax.",
                ),
                Text(
                    nl="Je hebt 4 maanden de tijd om een zorgverzekering af te sluiten. Sluit je later af, dan ben je in de tussentijd onverzekerd en betaal je zorgkosten zelf.",
                    en="You have 4 months to take out health insurance. If you take it out later, you are uninsured in the meantime and pay medical costs yourself.",
                ),
                Text(
                    nl="Sta je ingeschreven bij een gemeente maar nog niet bij een zorgverzekeraar? Dan krijg je een brief van het CAK. Wacht je te lang, dan riskeer je een boete.",
                    en="Registered with a municipality but not yet with a health insurer? Then you receive a letter from the CAK. If you wait too long, you risk a fine.",
                ),
            ),
        ),
    ),
    exceptions=(
        Text(
            nl="Werk je voor een buitenlandse werkgever? Dan mag je je verzekering uit je land van herkomst soms houden. Daar gelden regels voor; de SVB legt ze uit.",
            en="Working for a foreign employer? Then you may sometimes keep your insurance from your home country. Rules apply; the SVB explains them.",
        ),
        Text(
            nl="Stage met een vergoeding (regels sinds 1 september 2025): woon je in de EU/EER, Zwitserland of een verdragsland, dan ben je verzekerd voor de Wlz als je verzekerd bent voor een of meer werknemersverzekeringen, zoals de Ziektewet. Woon je daarbuiten, dan ben je verzekerd voor de Wlz als je vergoeding minstens even hoog is als het Nederlandse minimumloon. Een onkostenvergoeding telt mee.",
            en="An internship with an allowance (rules since 1 September 2025): if you live in the EU/EEA, Switzerland or a treaty country, you are insured under the Wlz if you are insured for one or more employee insurances, such as the Sickness Benefits Act. If you live elsewhere, you are insured under the Wlz if your allowance is at least the Dutch minimum wage. An expense allowance counts too.",
        ),
        Text(
            nl="Werk je als zelfstandige met een verblijfsvergunning studie? Volgens de IND moet je misschien ook een Nederlandse zorgverzekering regelen.",
            en="Working as a self-employed person with a student residence permit? According to the IND you may also need Dutch health insurance.",
        ),
        Text(
            nl="Studeer je hier met een EU/EER- of Zwitserse nationaliteit en werk je niet? Voor je verblijf is een buitenlandse zorgverzekering met dekking in Nederland dan ook voldoende, volgens de IND.",
            en="Studying here with an EU/EEA or Swiss nationality and not working? For your stay, a foreign health insurance with cover in the Netherlands is then also sufficient, according to the IND.",
        ),
    ),
    next_steps=(
        Text(
            nl="Ga je betaald werken? Controleer je situatie bij de SVB. Twijfel je, vraag dan een onderzoek Wlz aan.",
            en="Starting paid work? Check your situation with the SVB. In doubt? Request a Wlz assessment.",
        ),
        Text(
            nl="Moet je een Nederlandse zorgverzekering afsluiten? Doe het op tijd: je hebt 4 maanden.",
            en="Do you need Dutch health insurance? Arrange it in time: you have 4 months.",
        ),
        Text(
            nl="Heb je een Nederlandse zorgverzekering en weinig inkomen? Check bij Dienst Toeslagen of je zorgtoeslag kunt krijgen.",
            en="Do you have Dutch health insurance and a low income? Check with the Benefits Agency (Dienst Toeslagen) whether you can get a healthcare allowance (zorgtoeslag).",
        ),
    ),
    contacts=(
        Contact(
            body="SVB",
            label=Text(nl="Ben je verzekerd? Vraag een onderzoek Wlz aan", en="Are you insured? Request a Wlz assessment"),
            url=Text(
                nl="https://www.svb.nl/nl/wlz/wanneer-verzekerd-voor-de-wlz/u-studeert-of-loopt-stage",
                en="https://www.svb.nl/nl/wlz/wanneer-verzekerd-voor-de-wlz/u-studeert-of-loopt-stage",
            ),
        ),
        Contact(
            body="Dienst Toeslagen",
            label=Text(nl="Zorgtoeslag berekenen en aanvragen", en="Calculate and apply for the healthcare allowance"),
            url=Text(nl="https://www.toeslagen.nl", en="https://www.toeslagen.nl"),
        ),
    ),
    sources=(
        "svb-wlz-studie",
        "rvo-zorg-werken",
        "rvo-zorg-verplicht",
        "ind-studie",
        "ind-eu",
    ),
    claims=(
        Claim(
            id="study-only-usually-not",
            text="Buitenlandse studenten die alleen voor hun studie in Nederland zijn, hoeven meestal geen Nederlandse zorgverzekering af te sluiten.",
            sources=("svb-wlz-studie",),
            applies_to="Buitenlandse studenten zonder betaald werk in Nederland",
            checked_on=CHECKED,
            open_questions="De SVB schrijft 'meestal'; het artikel belooft daarom niets en verwijst naar het onderzoek Wlz.",
        ),
        Claim(
            id="side-job-may-need",
            text="Met een betaalde bijbaan kun je verzekerd zijn voor de Wlz en moet je dan een zorgverzekering afsluiten.",
            sources=("svb-wlz-studie",),
            applies_to="Buitenlandse studenten met betaald werk in Nederland",
            checked_on=CHECKED,
        ),
        Claim(
            id="depends-on-origin",
            text="Hoe buitenlandse studenten zich verzekeren, hangt af van waar ze vandaan komen en wat ze naast hun studie doen.",
            sources=("rvo-zorg-verplicht",),
            applies_to="Buitenlandse studenten",
            checked_on=CHECKED,
        ),
        Claim(
            id="obligation-when-working",
            text="Wie in Nederland werkt, is verplicht een Nederlandse zorgverzekering af te sluiten bij een Nederlandse werkgever, werk op vaste basis en betaling van loonbelasting.",
            sources=("rvo-zorg-werken",),
            applies_to="Werknemers in Nederland",
            checked_on=CHECKED,
            open_questions="De bronpagina geeft drie opsommingstekens na 'als:'; of alle drie tegelijk moeten gelden staat er niet expliciet. Het artikel noemt ze samen, zoals de bron.",
        ),
        Claim(
            id="four-months",
            text="Je hebt 4 maanden om een zorgverzekering af te sluiten; later afsluiten betekent onverzekerd zijn in de tussentijd en zorgkosten zelf betalen.",
            sources=("rvo-zorg-werken",),
            applies_to="Wie verplicht is een zorgverzekering af te sluiten",
            checked_on=CHECKED,
            open_questions="Het startmoment van de 4 maanden staat niet expliciet op de bronpagina; het artikel noemt daarom geen startmoment.",
        ),
        Claim(
            id="cak-fine",
            text="Wie wel bij de gemeente maar niet bij een zorgverzekeraar is ingeschreven, krijgt een brief van het CAK en riskeert een boete bij te lang wachten.",
            sources=("rvo-zorg-werken",),
            applies_to="Ingeschrevenen in de BRP zonder zorgverzekering",
            checked_on=CHECKED,
        ),
        Claim(
            id="foreign-employer",
            text="Met een buitenlandse werkgever mag je je verzekering uit je land van herkomst houden; daar gelden regels voor.",
            sources=("rvo-zorg-werken",),
            applies_to="Werknemers van een buitenlandse werkgever",
            checked_on=CHECKED,
        ),
        Claim(
            id="internship-2025",
            text="Stage met vergoeding sinds 1 september 2025: EU/EER/Zwitserland/verdragsland → Wlz-verzekerd bij werknemersverzekering; daarbuiten → Wlz-verzekerd als vergoeding ≥ minimumloon; onkostenvergoeding telt mee.",
            sources=("svb-wlz-studie",),
            applies_to="Stagiairs met een stagevergoeding",
            checked_on=CHECKED,
            open_questions="De SVB-pagina zegt voor stagiairs alleen dat je Wlz-verzekerd bent, niet expliciet dat je dan een zorgverzekering moet afsluiten; het artikel trekt die conclusie daarom niet.",
        ),
        Claim(
            id="self-employed-maybe",
            text="Zelfstandigen met een verblijfsvergunning studie moeten misschien ook een Nederlandse zorgverzekering regelen.",
            sources=("ind-studie",),
            applies_to="Zelfstandigen met verblijfsvergunning studie",
            checked_on=CHECKED,
        ),
        Claim(
            id="eu-student-foreign-cover",
            text="Voor verblijf als EU/EER/Zwitserse student is een buitenlandse zorgverzekering met dekking in Nederland ook voldoende.",
            sources=("ind-eu",),
            applies_to="EU/EER/Zwitserse studenten (verblijfsvoorwaarde, niet de verzekeringsplicht bij werk)",
            checked_on=CHECKED,
        ),
        Claim(
            id="zorgtoeslag",
            text="Met weinig inkomen kun je zorgtoeslag aanvragen; zorgtoeslag hoort bij een Nederlandse zorgverzekering.",
            sources=("rvo-zorg-werken",),
            applies_to="Verzekerden met een Nederlandse zorgverzekering en laag inkomen",
            checked_on=CHECKED,
            open_questions="De voorwaarden voor zorgtoeslag (bijv. voor houders van een verblijfsvergunning studie) zijn niet gecontroleerd; het artikel zegt alleen 'check of je het kunt krijgen'.",
        ),
    ),
    job_link=JobLink(
        label=Text(nl="Bekijk vacatures waarvoor alleen Engels nodig is", en="See vacancies that only require English"),
        query="english_level=english_only",
    ),
    related=("start-working", "documents-to-start"),
    open_questions=(
        "De verwijzing naar Nuffic op Rijksoverheid.nl is niet gevolgd; alleen SVB, Rijksoverheid en IND zijn gebruikt.",
    ),
)
