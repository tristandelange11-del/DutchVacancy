# Meetplan

Doel: vóór de eerste campagne betrouwbaar kunnen zien waar bezoekers vandaan komen en wat ze doen, zonder
persoonsgegevens naar een analysetool te sturen.

## Wat er technisch klaarstaat

- **Plausible Analytics** laadt alleen op `dutchvacancy.nl` en `www.dutchvacancy.nl` (`frontend/src/lib/analytics.ts`).
  Staging, previews, lokale ontwikkeling en de e2e-tests tellen dus nooit mee.
- Plausible werkt zonder cookies. Daarom is er geen cookiebanner. De privacyverklaring noemt Plausible en zegt
  wat er wel en niet naartoe gaat.
- **Bron van het verkeer** (verwijzende site, zoekmachine, UTM-tags) registreert Plausible zelf bij elk bezoek.
  Daar is geen code voor nodig.

## Gebeurtenissen (custom events)

| Gebeurtenis | Wanneer precies | Eigenschappen | Waar in de code |
|---|---|---|---|
| `Article View` | Een kennisbankartikel is geladen | `slug` | `pages/GuideArticle.tsx` |
| `Article Job Click` | Klik op de vacatureknop in een artikel | `slug` | `pages/GuideArticle.tsx` |
| `Job View` | Een vacaturepagina is geladen | `job_id` | `pages/JobDetail.tsx` |
| `Apply Start` | Klik op "Solliciteer" (ook als je daarna nog een account moet maken) | `job_id`, `source` (`account` / `signup`) | `pages/JobDetail.tsx` |
| `Apply Complete` | **Pas nadat de server de sollicitatie heeft opgeslagen** (HTTP 200) | `job_id` | `pages/JobDetail.tsx` |
| `Employer Request` | **Pas nadat de server de werkgeversaanvraag heeft aangenomen** | — | `pages/Employers.tsx` |

Niet beschikbaar: **vacaturealerts** bestaan nog niet op de site, dus daar is ook geen meting voor.

### Geen dubbeltellingen

- "Afgerond"-gebeurtenissen staan alleen in de succesafhandeling van de serveraanroep. Een mislukte of dubbele
  klik telt niet: de server weigert een tweede sollicitatie op dezelfde vacature (409), en dan is er geen succes.
- Paginaweergaven van artikelen en vacatures tellen één keer per geopende pagina (per `slug`/`job_id`),
  niet bij elke herberekening van het scherm.
- `Apply Start` meet interesse en is geen sollicitatie. Tel `Apply Start` en `Apply Complete` nooit bij elkaar op.

### Wat nooit naar Plausible gaat

Namen, e-mailadressen, telefoonnummers, cv's of cv-inhoud, motivaties, berichten en bedrijfsnamen uit
formulieren. De eigenschappen zijn beperkt tot `slug`, `job_id` en `source`. Het type in `analytics.ts`
staat niets anders toe.

Sentry (foutmeldingen) is geen analysetool, maar ook daar gaat geen formulierinhoud naartoe:
`max_request_body_size='never'`, bewezen door `backend/tests/test_error_monitoring_privacy.py`.

## Wat jij nog moet instellen (wacht op jou)

1. **Plausible: doelen aanmaken.** Ga in het Plausible-dashboard naar *Site settings → Goals → Add goal →
   Custom event* en maak de zes namen hierboven exact zo aan (hoofdletters en spaties tellen mee).
   Zet voor `slug`, `job_id` en `source` *custom properties* aan.
2. **Google Search Console**: voeg `dutchvacancy.nl` toe als *domeineigendom*. Dat bevestig je met een
   DNS TXT-record bij TransIP. Dien daarna `https://dutchvacancy.nl/sitemap.xml` in. Pas doen als de nieuwe site
   op het domein draait. Nu staat daar nog de oude WordPress-site.
3. **Advertentieaccounts** (alleen als je campagnes gaat draaien): nog niet aangemaakt of gekoppeld. Doe
   geen uitgaven voordat de checklist in `STATUS.md` groen is.

## UTM-conventie

Gebruik altijd kleine letters, streepjes in plaats van spaties en deze vaste waarden:

| Parameter | Waarden | Voorbeeld |
|---|---|---|
| `utm_source` | `google`, `meta`, `linkedin`, `instagram`, `newsletter`, `university-<naam>`, `partner-<naam>` | `university-rug` |
| `utm_medium` | `cpc` (betaald zoeken), `paid-social`, `social` (organisch), `email`, `referral`, `print` | `paid-social` |
| `utm_campaign` | `<jjjj-mm>-<doel>-<doelgroep>` | `2026-11-bijbaan-studenten` |
| `utm_content` | variant van advertentie of plaatsing (optioneel) | `video-a` |

Voorbeeld van een complete link:
`https://dutchvacancy.nl/jobs?english_level=english_only&utm_source=meta&utm_medium=paid-social&utm_campaign=2026-11-bijbaan-studenten&utm_content=video-a`

Regels: stuur een advertentie naar de pagina waar de advertentie over gaat (zie de landingspagina-check
in `livegang-checklist.md`). Zet nooit UTM-tags op interne links binnen de site.

## Rapportsjabloon (maandelijks, of per campagne)

| Onderdeel | Bron | Deze periode | Vorige periode |
|---|---|---|---|
| Bezoekers (uniek) | Plausible | | |
| Top-5 bronnen / campagnes | Plausible → Sources / Campaigns | | |
| Artikelweergaven (`Article View`) | Plausible → Goals | | |
| Artikel → vacatureklikken (`Article Job Click`) | Plausible → Goals | | |
| Vacatureweergaven (`Job View`) | Plausible → Goals | | |
| Sollicitaties gestart (`Apply Start`) | Plausible → Goals | | |
| Sollicitaties afgerond (`Apply Complete`) | Plausible → Goals | | |
| Conversie gestart → afgerond | berekend | | |
| Werkgeversaanvragen (`Employer Request`) | Plausible → Goals | | |
| Open vacatures aan het eind van de periode | handmatig (zie hieronder) | | |
| Sollicitaties per vacature | handmatig | | |
| Opgevolgde werkgeversaanvragen / binnen afgesproken tijd | handmatig | | |
| Uitgaven per kanaal en kosten per afgeronde sollicitatie | handmatig (advertentieaccount) | | |
| Zoekprestaties (vertoningen, klikken, positie) | Search Console | | |

### Handmatig bij te houden

Deze gegevens komen bewust niet uit Plausible. Ze staan in de database of alleen bij jou:

- **Aantal open vacatures en sollicitaties per vacature.** De homepage toont het aantal open vacatures. Per
  vacature zie je de aantallen in het werkgeversdashboard.
- **Of werkgeversaanvragen en sollicitaties op tijd zijn opgevolgd.** Houd dit bij in de mailbox van de
  opvolger (zie `opvolging.md`).
- **Advertentie-uitgaven** komen uit het advertentieaccount.
- **Kwaliteit**: welke kandidaten zijn uitgenodigd of aangenomen. Werkgevers zetten die status in hun
  dashboard. Stuur die informatie niet naar Plausible.
