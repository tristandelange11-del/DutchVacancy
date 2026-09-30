# Livegang-checklist

`dutchvacancy.nl` gaat pas live na jouw uitdrukkelijke akkoord. Deze lijst zegt wat er vóór en direct na
de livegang moet kloppen. "Wie" staat voor wie het doet: **jij** (Tristan), of **Claude** op jouw verzoek.

## A. Vóór de livegang: instellingen

| # | Wat | Wie | Hoe controleer je het |
|---|---|---|---|
| A1 | PR's #12 t/m #15 gemerged en op staging gezet | jij (merge), Claude (deploy) | staging toont de kennisbank en de werkgeverspagina |
| A2 | `frontend/src/config/business.json`: juridische naam, correspondentieadres, KvK-nummer, contactadres | jij → Claude | `scripts/check-production-readiness.mjs` slaagt; de privacy- en voorwaardenpagina tonen geen conceptmelding meer |
| A3 | Opvolgmailbox bestaat en wordt gelezen (**gedaan**: `info@dutchvacancy.nl`, getest 30-09-2026); GitHub-variabele `CONTACT_NOTIFICATION_EMAIL` expliciet gezet (aanrader) | jij | zie `opvolging.md` |
| A4 | Haalbare reactietijd vastgelegd (of bewust geen) | jij → Claude | `config/operations.ts` |
| A5 | Geheimen die in de chat stonden vervangen: Resend-sleutel en GitHub-token | jij | oude sleutel ingetrokken in Resend en GitHub; nieuwe sleutel in GitHub Secrets |
| A6 | Privacyverklaring en voorwaarden juridisch laten nakijken; verwerkersovereenkomsten met TransIP, Resend, Sentry, Plausible (en Stripe als je betalingen aanzet); nagaan waar elke dienst gegevens verwerkt, en buiten de EU zo nodig vermelden | jij (of een jurist) | schriftelijk akkoord |
| A7 | Kennisbank beoordeeld (**gedaan** 30-09-2026 door Tristan de Lange; 7 artikelen gepubliceerd) | jij | `docs/launch/kennisbank-verificatie.md` → "Live op productie: ja" |
| A8 | Echte vacatures geplaatst door echte werkgevers, elk met taaleis en sluitingsdatum | jij | homepage-teller "Actuele studentenvacatures" > 0 op productie |
| A9 | Taalstructuur akkoord: Nederlands op `/`, Engels op `/en/` (gebouwd in #15) | jij | de broncode van elke pagina bevat `hreflang`-links; de sitemap noemt beide versies |
| A10 | Stripe alleen met live-sleutels ná verificatie. Tot die tijd blijft betalen uit (`/api/config` → `payments_enabled: false`) | jij | `/api/config` |
| A11 | Back-ups: een externe kopie plus een proefterugzetting (de nachtelijke back-up staat nu alleen op de VPS) | jij + Claude | `verify-private-backup.yml` geslaagd |
| A12 | Productieproxy: een Caddy-site voor `dutchvacancy.nl` en `www.dutchvacancy.nl` naar `127.0.0.1:8180`, **zonder** wachtwoord en **zonder** `X-Robots-Tag: noindex` (alleen staging houdt die) | Claude | `curl -I https://dutchvacancy.nl` heeft geen `x-robots-tag` |
| A13 | DNS: A-record van `dutchvacancy.nl` (en `www`) van de WordPress-server naar de VPS | jij (TransIP) | na wijziging: `dig +short dutchvacancy.nl` geeft het VPS-adres |
| A14 | Oude WordPress-URL's met bezoekers of links naar een passende nieuwe pagina laten doorverwijzen (301) | Claude, na jouw lijst | Search Console of de oude sitemap laat zien welke URL's bestaan |
| A15 | Plausible-doelen en eigenschappen aangemaakt (`meetplan.md`) | jij | doelen zichtbaar in Plausible |

## B. Direct na de livegang (dag 0)

1. `https://dutchvacancy.nl` laadt. `http://` en `www` sturen door naar dezelfde site.
2. `https://dutchvacancy.nl/robots.txt` staat indexeren toe en noemt de sitemap.
   `https://dutchvacancy.nl/sitemap.xml` bevat alleen open vacatures, vaste pagina's en beoordeelde artikelen.
3. `curl -I https://dutchvacancy.nl/` en `curl -I https://dutchvacancy.nl/en` hebben geen `x-robots-tag`. De broncode van `/jobs` bevat
   `<meta name="robots" content="index, follow">`.
4. Search Console: domein bevestigen, sitemap indienen, een vacature-URL inspecteren met "Live URL testen".
5. [Rich Results Test](https://search.google.com/test/rich-results) op een open vacature: JobPosting geldig,
   zonder fouten. Een gesloten vacature en een niet-bestaande pagina tonen `noindex`.
6. **Sollicitatieroute met eigen testgegevens, zonder echte werkgevers te raken.** Maak een testwerkgever
   met je eigen adres (bijvoorbeeld `jouwnaam+werkgever@gmail.com`) met één testvacature. Solliciteer met
   een tweede eigen adres (`jouwnaam+student@gmail.com`). Controleer: bevestigingsmail student, melding
   werkgever, opvolgbericht in de opvolgmailbox, en gespreksuitnodiging plus bevestiging met agenda-bijlage.
   Verwijder daarna de testvacature en beide accounts.
7. Werkgeversformulier op `/employers` invullen met een eigen adres: komt de mail binnen in de opvolgmailbox?
8. Plausible: je eigen bezoek verschijnt. Na stap 6 en 7 staan `Apply Complete` en `Employer Request` bij Goals.
9. Sentry: geen nieuwe fouten met omgeving `production`.

## C. Na de eerste week en maand

- Search Console → *Pagina's*: let op "Soft 404", "Dubbele pagina zonder canonieke versie" en
  "Gecrawld – momenteel niet geïndexeerd". Kijk bij *Verbeteringen → Vacatures* naar fouten.
- Vacatures die sloten, verdwijnen uit de sitemap en tonen geen JobPosting-data meer. Controleer er één.
- De wekelijkse broncontrole van de kennisbank (`kb-sources.yml`) draait groen, of iemand heeft de melding opgevolgd.
- Maandrapport volgens `meetplan.md`.

## Indexing API (onderzocht, nog niet ingezet)

Bron: Google Search Central, Indexing API Quickstart en "Requesting approval and quota", gelezen op 29-09-2026.

- De API is alleen bedoeld voor pagina's met **JobPosting** (of BroadcastEvent) en past dus bij onze
  vacaturepagina's. Een melding laat Google een pagina sneller opnieuw crawlen dan via de sitemap.
  Google raadt aan de sitemap daarnaast te houden.
- Nodig: een Google Cloud-project met de Indexing API aan, een serviceaccount, en dat serviceaccount als
  eigenaar in Search Console. Standaardquotum is 200 meldingen per dag voor testen. Voor echt gebruik
  vraag je goedkeuring en extra quotum aan via een formulier van Google.
- Gebruik: `URL_UPDATED` bij een nieuwe of gewijzigde vacature, en ook bij sluiten. Wij halen dan de
  JobPosting-data weg en zetten de pagina op noindex, en dat is één van de drie manieren die Google
  toestaat om een vacature te laten verlopen. `URL_DELETED` pas als een pagina echt weg is (404/410).
- **Advies:** pas inzetten als er regelmatig echte vacatures bij komen en Search Console loopt. Het staat bij
  de latere uitbreidingen. Tot die tijd volstaan de sitemap (met `lastmod`) en het weghalen van
  JobPosting-data bij sluiten.
- Geen belofte: de API versnelt het crawlen, maar garandeert geen indexering of positie.
