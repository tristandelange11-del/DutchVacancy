# Onderhoudsplan

**Eigenaren wachten op jouw keuze.** Waar "voorstel: Tristan" staat, ben jij nu de enige die het kan doen.
Wijs een vervanger aan voor vakanties.

| Taak | Hoe vaak | Eigenaar | Wat er automatisch gebeurt | Wat een mens moet doen |
|---|---|---|---|---|
| Sollicitaties opvolgen waarvan de werkgeversmelding mislukte | elke werkdag | voorstel: Tristan (zie `opvolging.md`) | opvolgbericht naar de opvolgmailbox met de verzendstatus | bij "Employer notification: failed" de werkgever zelf benaderen |
| Werkgeversaanvragen en contactberichten beantwoorden | elke werkdag | voorstel: Tristan | mail naar `CONTACT_NOTIFICATION_EMAIL`, bericht bewaard in de database | beantwoorden binnen de vastgelegde reactietijd |
| Vacatures actueel houden | wekelijks | voorstel: Tristan | een vacature sluit vanzelf op de sluitingsdatum (maximaal 180 dagen vooruit), verdwijnt uit de lijsten en de sitemap en neemt geen sollicitaties meer aan | werkgevers met vacatures die bijna sluiten vragen of ze moeten verlengen; vacatures waarvan de werkgever niet meer reageert vroegtijdig laten sluiten |
| Kennisbank: periodieke inhoudelijke controle | elk artikel uiterlijk 182 dagen na de laatste beoordeling | inhoudelijk eigenaar (nog aan te wijzen) | `kb_report.py` zet de volgende datum in het register | bronnen opnieuw lezen, tekst bijwerken, `reviewed_on` pas ná een echte controle aanpassen |
| Kennisbank: bronwijzigingen | wekelijks (maandag) | inhoudelijk eigenaar | `kb-sources.yml` vergelijkt alle bronpagina's; rood = kijken | de gewijzigde pagina lezen, artikel zo nodig aanpassen, `kb_report.py --record` en committen |
| Kennisbank: bekende wetswijzigingen | op de datum | inhoudelijk eigenaar | vastgelegd als signaal in het artikel | 31-12-2026 uitzendkrachten, 01-01-2027 nieuw minimumloon, 01-01-2028 oproepcontracten (wet "meer zekerheid flexwerkers") |
| SVB-bronpagina | bij elke kennisbankcontrole | inhoudelijk eigenaar | geen: de SVB-site weigert scripts | handmatig lezen |
| Privacyverklaring en voorwaarden | jaarlijks en bij elke nieuwe dienst of gegevensstroom | voorstel: Tristan (+ jurist) | — | tekst en datum "laatst bijgewerkt" aanpassen |
| Foutmeldingen | wekelijks, en direct bij een melding | voorstel: Tristan | Sentry mailt bij nieuwe fouten (als meldingen aanstaan) | fout beoordelen; Claude kan helpen oplossen |
| Metingen en maandrapport | maandelijks | voorstel: Tristan | Plausible verzamelt | rapport invullen volgens `meetplan.md` |
| Back-ups | dagelijks automatisch; controle maandelijks | voorstel: Tristan | `backup-production.yml` draait elke nacht om 01:17 UTC | maandelijks nagaan of de laatste run groen is; eens per kwartaal een proefterugzetting |
| Updates van software en afhankelijkheden | maandelijks | Claude op verzoek | CI draait alle tests bij elke wijziging | updates laten doorvoeren via een PR |
| Testaccounts op staging opruimen | na testrondes | Claude op verzoek | — | vragen om opruimen; nooit `seed.py` op staging of productie |
| Geheimen (API-sleutels) | bij elk vermoeden van uitlekken, anders jaarlijks | voorstel: Tristan | — | vervangen in de dienst en in GitHub Secrets |
