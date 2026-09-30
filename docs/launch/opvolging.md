# Opvolging van sollicitaties en werkgeversaanvragen

**Status: vastgelegd op 30-09-2026.** Tristan volgt alles op, binnen 3 werkdagen. Dat staat nu ook op de
site: de contactpagina en de bevestiging van het werkgeversformulier (`frontend/src/config/operations.ts`).

| Wat | Wie volgt op | Via welke mailbox | Reactietijd | Vervanger bij afwezigheid |
|---|---|---|---|---|
| Werkgeversaanvragen (`/employers`-formulier) | Tristan | `info@dutchvacancy.nl` | binnen 3 werkdagen | _nog aan te wijzen_ |
| Algemene contactberichten (`/contact`) | Tristan | `info@dutchvacancy.nl` | binnen 3 werkdagen | _nog aan te wijzen_ |
| Sollicitaties waarvan de werkgeversmelding mislukte | Tristan | `info@dutchvacancy.nl` | binnen 3 werkdagen | _nog aan te wijzen_ |
| Verzoeken over persoonsgegevens (AVG) | Tristan | `info@dutchvacancy.nl` | maximaal 1 maand (wettelijk) | _nog aan te wijzen_ |

Tip: zet bij vakantie een automatisch antwoord in de mailbox, of wijs een vervanger aan. Anders is
"binnen 3 werkdagen" een belofte die je niet kunt nakomen.

## Hoe de meldingen nu lopen

- **Werkgeversaanvragen en contactberichten** worden opgeslagen in de database (`contact_messages`) en
  gemaild naar `CONTACT_NOTIFICATION_EMAIL`. De onderwerpregel is "DutchVacancy employer request: <bedrijf>"
  of "DutchVacancy contact message". Met *Beantwoorden* antwoord je direct aan de afzender.
- **Sollicitaties** gaan per e-mail naar de werkgeversaccounts van het bedrijf. De kandidaat krijgt een
  bevestiging. De opvolgmailbox krijgt een kort opvolgbericht: sollicitatienummer, vacature, bedrijf en of de
  meldingen zijn verzonden. Er staan geen kandidaatgegevens, motivatie of cv in. Het adres is
  `APPLICATION_OPS_EMAIL`, of anders `CONTACT_NOTIFICATION_EMAIL`. Staat er in dat bericht
  "Employer notification: failed", neem dan zelf contact op met de werkgever.
- Mislukte contactmeldingen blijven bewaard met status `failed`. `backend/retry_contact_notifications.py`
  verstuurt ze opnieuw.
- Testadressen (`example.com`, `*.test` enz.) krijgen nooit mail. Echte werkgevers en kandidaten ontvangen
  dus niets van testsollicitaties. Het opvolgbericht aan de eigen opvolgmailbox gaat wel, zodat je de
  opvolging kunt testen.

## Wat nu is ingesteld

- De GitHub-variabele `CONTACT_NOTIFICATION_EMAIL` is **niet** gezet. Staging en productie gebruiken daardoor
  de standaardwaarde **`info@dutchvacancy.nl`** (zie `deploy-staging.yml` en `deploy-production.yml`).
- **Bevestigd op 30-09-2026:** een testaanvraag via het werkgeversformulier op staging kwam binnen in de
  mailbox `info@dutchvacancy.nl` (TransIP-webmail). Het onderwerp was
  "DutchVacancy employer request: Test bedrijf", en afzender, bedrijf en bericht stonden erin.
  De mailbox werkt en de eigenaar leest hem.
- Wie en hoe snel: vastgelegd, zie de tabel bovenaan. Aanrader: zet `CONTACT_NOTIFICATION_EMAIL` toch expliciet in GitHub, zodat het adres niet van een
  standaardwaarde afhangt.

## Zo leg je het vast

1. Zorg dat de gekozen mailbox bestaat (TransIP → E-mail) en stuur er een testbericht naartoe.
2. GitHub → *Settings → Secrets and variables → Actions → Variables* → `CONTACT_NOTIFICATION_EMAIL` = dat adres.
   Voor een aparte sollicitatie-mailbox is een extra variabele nodig in `compose.*.yml` en de deploy-workflows
   (`APPLICATION_OPS_EMAIL`). Vraag Claude dat toe te voegen.
3. Vul de tabel hierboven in en zet de haalbare reactietijd in `frontend/src/config/operations.ts`
   (bijvoorbeeld `2`). Pas dan toont de contactpagina "binnen 2 werkdagen".
4. Test op staging: verstuur een werkgeversaanvraag met een `@example.com`-afzender en controleer dat hij in
   de mailbox aankomt.
