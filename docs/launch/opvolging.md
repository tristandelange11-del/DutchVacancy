# Opvolging van sollicitaties en werkgeversaanvragen

**Status: wacht op informatie.** Leg hieronder vast wie opvolgt en welke reactietijd écht haalbaar is.
Zolang dat niet is ingevuld, belooft de site geen reactietijd (`frontend/src/config/operations.ts`
staat op `null`).

## In te vullen door de eigenaar

| Wat | Wie volgt op | Via welke mailbox | Haalbare reactietijd (werkdagen) | Vervanger bij afwezigheid |
|---|---|---|---|---|
| Werkgeversaanvragen (`/employers`-formulier) | _nog invullen_ | _nog invullen_ | _nog invullen_ | _nog invullen_ |
| Algemene contactberichten (`/contact`) | _nog invullen_ | _nog invullen_ | _nog invullen_ | _nog invullen_ |
| Sollicitaties waarvan de werkgeversmelding mislukte | _nog invullen_ | _nog invullen_ | _nog invullen_ | _nog invullen_ |
| Verzoeken over persoonsgegevens (AVG) | _nog invullen_ | _nog invullen_ | maximaal 1 maand (wettelijk) | _nog invullen_ |

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
  mailbox `info@dutchvacancy.nl` (TransIP-webmail, in de inbox, niet in spam). Het onderwerp was
  "DutchVacancy employer request: Test bedrijf", en afzender, bedrijf en bericht stonden erin.
  De mailbox werkt en de eigenaar leest hem.
- Nog open: **wie** opvolgt, met vervanger, en welke reactietijd haalbaar is. Zie de tabel bovenaan.
  Aanrader: zet `CONTACT_NOTIFICATION_EMAIL` toch expliciet in GitHub, zodat het adres niet van een
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
