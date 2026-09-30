# Status livegang en eerste campagne

_Stand 29-09-2026. Er is niets gepubliceerd en er zijn geen campagnes gestart of uitgaven gedaan._

Statussen: **Gereed en getest** · **Wacht op informatie** · **Blokkeert livegang**.
"Getest" betekent dat de test echt is uitgevoerd. Wat niet getest is, staat er expliciet bij.

## Oordeel

- **Livegang: nog niet.** Er zijn vier blokkades, allemaal informatie of handelingen van jou: bedrijfsgegevens
  (KvK, adres), juridische controle van privacy en voorwaarden met
  verwerkersovereenkomsten, het vervangen van de in de chat gedeelde sleutels, en de productieproxy + DNS
  na jouw akkoord.
- **Eerste campagne: niet klaar.** Naast de blokkades hierboven: er staan **nog geen echte vacatures**
  (1 werkgever gevonden), en de metingen draaien pas als de site live is en de Plausible-doelen bestaan.
  De kennisbank is beoordeeld en gepubliceerd (30-09-2026). Adverteren naar een site zonder vacatures kost geld zonder resultaat.
- **Technisch klaar:** vacaturepagina's, de sollicitatieroute (desktop en mobiel), het afsluiten van
  vacatures, de kennisbank met publicatiepoort, de werkgeverspagina met formulier en privacyvriendelijke
  metingen. Alles staat in PR's met groene tests.

## Wat er is opgeleverd

| PR | Inhoud | CI |
|---|---|---|
| [#12](https://github.com/tristandelange11-del/DutchVacancy/pull/12) | Complete vacatures, sluitingsdata, sollicitatieroute, meldingen | groen |
| [#13](https://github.com/tristandelange11-del/DutchVacancy/pull/13) | Kennisbank met bronnen en publicatiepoort | groen |
| [#14](https://github.com/tristandelange11-del/DutchVacancy/pull/14) | Werkgeverspagina en formulier, contact/over ons/privacy, metingen, SEO-correcties, tweetalige mails | groen |
| [#15](https://github.com/tristandelange11-del/DutchVacancy/pull/15) | Taal in de URL: Nederlands op `/`, Engels op `/en/`, met hreflang en een tweetalige sitemap | loopt na openen |

De PR's bouwen op elkaar voort: merge ze op volgorde. **PR #7** (privacy/voorwaarden) is in #14 opgenomen en gecorrigeerd: Fresh Vacancy staat op de homepage en niet bovenaan de zoekresultaten, en de verwerkersovereenkomsten zijn niet als feit vermeld. #7 kan dus dicht zonder merge. Daarna zet Claude staging bij (de preview, achter
wachtwoord en niet vindbaar).

**Nieuwe pagina's:** `/guide` (kennisbank "Werken als internationale student in Nederland", vervangt de oude
gids), `/guide/<artikel>` (7 artikelen), `/employers` (werkgevers).
**Gewijzigde pagina's:** `/`, `/jobs/<id>`, vacatureformulier, werkgeversdashboard, `/register`, `/login`,
`/contact`, `/about`, `/privacy`, `/how-it-works`, de 404-pagina, en alle e-mails.

## Per punt

### 1–4. Kennisbank, verificatie, vaste opbouw, koppeling met werk

| Onderdeel | Status | Toelichting |
|---|---|---|
| Centrale pagina `/guide`, bereikbaar via navigatie en footer | Gereed en getest | e2e `knowledge-base.spec.ts` |
| 7 artikelen (NL + EN) in vaste opbouw: antwoord, voor wie, uitzonderingen, stappen, instantie, vacatures, bronnen, auteur, datum | Gereed en getest | structuurtests per artikel; handmatig bekeken op desktop, mobiel, NL, EN |
| Alle bronnen zelf geopend en gelezen (IND, UWV, SVB, Rijksoverheid, Belastingdienst) | Gereed | `kennisbank-verificatie.md`: per bewering de bron, voor wie, datum en open vragen |
| Fouten uit de oude teksten gehaald | Gereed en getest | o.a. "loonstrook elke periode" (onjuist), "€ 14–24 typisch" (verzonnen), "kost je niets", "enkele weken" (UWV: binnen 5 weken); e2e controleert dat ze weg zijn |
| Publicatiepoort: op productie alleen artikelen met status gepubliceerd, echte auteur en (bij gevoelige artikelen) beoordelaar en datum | Gereed en getest | backend-tests plus sabotagecheck; alle 7 artikelen voldoen nu en zijn zichtbaar |
| Inhoudelijk eigenaar die de artikelen beoordeelt | Gereed en getest | Tristan de Lange (redactie en beoordelaar). Op 30-09-2026 heeft Claude alles nagelezen (19 correcties) en heeft Tristan de artikelen gelezen en goedgekeurd. Volgende controle uiterlijk 31-03-2027, eerder bij de signaaldata. **Advies vóór campagnes:** laat de artikelen over TWV, zorgverzekering en arbeidsovereenkomst nog door een deskundige bekijken (bijv. een international office) |
| Periodieke controle en signalering van bronwijzigingen | Gereed, deels getest | controle-interval en wetswijzigingsdata zijn getest. De broncontrole is lokaal gedraaid (27 pagina's stabiel, SVB handmatig). De GitHub-workflow draait voor het eerst na de merge |
| Artikel → vacatures (alleen met bekende taaleis), vacature → uitleg, werkgevers → uitleg | Gereed en getest | er wordt geen vergunningsondersteuning of verzekeringsdekking beloofd; de vergunningslabels beschrijven wat de werkgever doet |

### 5. Vacaturepagina's
| Onderdeel | Status | Toelichting |
|---|---|---|
| Alle velden, waaronder salaris met eenheid (uur/maand), contractvorm, taaleis, start- en sluitingsdatum | Gereed en getest | niets verzonnen: wat niet is opgegeven, staat er niet (e2e) |
| Sluitproces: sluitingsdatum verplicht (max 180 dagen), automatisch dicht, geen sollicitaties meer, uit lijsten en sitemap | Gereed en getest | backend- en e2e-tests |

### 6. Sollicitatieroute
| Onderdeel | Status | Toelichting |
|---|---|---|
| Vacature vinden → registreren → terug naar de vacature → e-mail bevestigen → solliciteren → bevestiging | Gereed en getest | e2e desktop en 390 px mobiel; testadressen krijgen nooit mail |
| Interne toewijzing: opvolgbericht naar de opvolgmailbox | Gereed en getest | zonder kandidaatgegevens, motivatie of cv |
| Wie volgt op en welke reactietijd is haalbaar | Gereed en getest | Tristan, binnen 3 werkdagen (vastgelegd 30-09-2026); de mailbox `info@dutchvacancy.nl` werkt. Nog aan te wijzen: een vervanger bij afwezigheid |
| Echte bezorging van de werkgeversaanvraag op staging | Gereed en getest | 30-09-2026: testaanvraag kwam binnen in `info@dutchvacancy.nl`. Sollicitatie- en gespreksmails op staging zijn nog niet opnieuw echt verstuurd |

### 7. Overzichtspagina's
| Onderdeel | Status | Toelichting |
|---|---|---|
| Pagina's per stad, functiegroep, Engelstalig, werkstudent, vakantie/avond/weekend | Wacht op informatie | **Bewust niet gebouwd.** Er is nog geen echt aanbod, en lege pagina's worden bijna-duplicaten. Gefilterde vacatureoverzichten verwijzen via de canonical naar `/jobs`. Bouwen per groep zodra die echt aanbod heeft |

### 8. Technische SEO
| Onderdeel | Status | Toelichting |
|---|---|---|
| Titel, beschrijving en canonical per pagina; filter-URL's met canonical naar `/jobs` | Gereed en getest | de vaste canonical naar `/` in `index.html` is weggehaald |
| XML-sitemap (vaste pagina's, open vacatures, beoordeelde artikelen) en robots.txt | Gereed en getest | backend-tests |
| Noindex voor inloggen, dashboards, gesloten vacatures, onbekende pagina's/vacatures en concepten | Gereed en getest | e2e; voorkomt "soft 404" |
| JobPosting volgens Google: verplichte velden, geen verzonnen salaris; bij sluiten wordt de JobPosting-data verwijderd | Gereed en getest | e2e; Googles richtlijn is gelezen |
| Preview (staging) niet vindbaar | Gereed | wachtwoord plus `X-Robots-Tag: noindex` (Caddyfile) |
| Indexing API | Wacht op informatie | onderzocht, advies in `livegang-checklist.md`: later inzetten |
| Taal-URL's en hreflang | Gereed en getest (voorstel) | Nederlands op `/` en Engels op `/en/`: elke taal een eigen URL, canonical en `hreflang` (nl, en, x-default) en beide versies in de sitemap. Geen automatische doorverwijzing op taal: een Engelstalige bezoeker krijgt de Engelse versie aangeboden. Omdraaien kost één instelling (`frontend/src/lib/paths.ts` + `backend/lib/site.py`). Wacht op jouw akkoord bij het mergen |
| Snelheid | Wacht op informatie | **niet gemeten.** De JavaScript-bundel is groot (build-waarschuwing > 500 kB). Meten met PageSpeed Insights op de productie-URL |
| Toegankelijkheid | Wacht op informatie | **geen volledige audit.** Wel: taal van de pagina gezet, formulierlabels, koppenstructuur, geen horizontaal scrollen op 375 px, knoppen bereikbaar op mobiel |
| Titels en voorbeelden bij delen op sociale media per vacature/artikel | Wacht op informatie | deeldiensten voeren geen JavaScript uit en tonen de standaardkaart. Staat bij de latere uitbreidingen |

### 9. Engelse versie
| Onderdeel | Status | Toelichting |
|---|---|---|
| Essentiële route in EN en NL (interface, kennisbank uit dezelfde feiten, `<html lang>`) | Gereed en getest | e2e draait in het Engels; NL handmatig bekeken |
| Alle e-mails in de taal van de ontvanger (verificatie, wachtwoord, sollicitatie, gesprek, agenda-bestand) | Gereed en getest | backend-tests plus sabotagecheck |
| Taalstructuur in URL's | Gereed en getest (voorstel) | zie punt 8; ook links in e-mails openen in de taal van de ontvanger |

### 10. Vertrouwen en werkgevers
| Onderdeel | Status | Toelichting |
|---|---|---|
| Over ons, met bedrijfsgegevens en eerlijke meldingen waar iets nog niet is ingevuld | Gereed en getest | |
| **KvK-nummer, correspondentieadres, juridische naam** | Blokkeert livegang | `business.json`; de productievoorbereiding weigert zonder deze gegevens |
| Contactpagina zonder onbevestigde beloftes: geen "Online, the Netherlands", alleen de bevestigde reactietijd van 3 werkdagen | Gereed en getest | e2e |
| Werkgeverspagina met werkend formulier | Gereed en getest | backend (opslag + mail met bedrijfsnaam) en e2e (alleen succes melden na bevestiging van de server) |
| Privacy- en cookie-informatie die klopt met wat er echt draait | Gereed | cv-upload, werkgeversaanvragen, TransIP, Resend, Sentry, Plausible, Stripe |
| Sentry stuurde formulierinhoud mee bij fouten | Gereed en getest | **gevonden en verholpen:** geen verzoekinhoud meer naar Sentry (test bewijst het) |
| **Juridische controle en verwerkersovereenkomsten** | Blokkeert livegang | door jou of een jurist |
| Geen verzonnen reviews, logo's, partners of aantallen | Gereed | er staan er geen; de homepage-tellers komen uit de database |

### 11. Meten
| Onderdeel | Status | Toelichting |
|---|---|---|
| Gebeurtenissen zonder persoonsgegevens, "afgerond" pas na serverbevestiging | Gereed | typecheck en code-review. **Niet in productie getest**: Plausible draait alleen op `dutchvacancy.nl`. Controle staat in de checklist (B8) |
| UTM-conventie, rapportsjabloon, handmatige gegevens | Gereed | `meetplan.md` |
| **Plausible-doelen, Search Console** | Wacht op informatie | jouw acties; Search Console kan pas na de DNS-overstap |

### 12. Controles vóór de eerste campagne
| Controle | Status |
|---|---|
| Genoeg echte vacatures | **Blokkeert** (1 werkgever gevonden, nog 0 vacatures geplaatst) |
| Advertentie en landingspagina sluiten op elkaar aan | Wacht op informatie (nog geen campagne-opzet) |
| Formulieren werken (sollicitatie, registratie, werkgevers, contact) | Gereed en getest (lokaal/CI); bezorging op staging volgt |
| Metingen werken | Wacht op informatie (productie + Plausible-doelen) |
| Opvolging belegd | Gereed (Tristan, binnen 3 werkdagen) |
| Geen kritieke fouten | Gereed en getest in CI; staging controleren na de deploy |
| Ontbrekende accounts | Search Console, advertentieaccounts (Google Ads / Meta / LinkedIn, afhankelijk van je keuze), optioneel Google Cloud voor de Indexing API |

### 13. Onderhoud en overdracht
| Document | Inhoud |
|---|---|
| `kennisbank-verificatie.md` | bronnen- en claimregister, gegenereerd |
| `meetplan.md` | gebeurtenissen, UTM, rapportsjabloon, handmatige gegevens |
| `opvolging.md` | wie wat opvolgt (in te vullen), mailroutes |
| `onderhoudsplan.md` | taken, frequentie, eigenaren (voorstel) |
| `livegang-checklist.md` | instellingen vóór livegang, controles erna, Indexing API |

## Testresultaten (echt uitgevoerd)

- Backend: 89 van 89 geslaagd. Sabotagechecks: publicatiepoort, conceptfilter, sitemap, claimregister,
  Sentry-verzoekinhoud, e-mailtaal en taalbewuste links. Elke opzettelijke fout werd gevangen.
- End-to-end (Playwright, desktop plus mobiel scenario): 23 tests. Lokaal 22 geslaagd en 1 overgeslagen:
  de artikeltest vereist zichtbare artikelen, en in productiemodus zijn die er terecht niet. Die test is
  apart gedraaid met concepten zichtbaar en slaagde. CI van #12, #13 en #14: groen.
- Frontend: typecheck, lint en build schoon. De linter weigert voortaan links die de taal kunnen verliezen,
  en draait nu ook in CI.
- Handmatig in de browser: 1280 px, 1024 px en 375 px, Nederlands en Engels.
- **Niet getest:** echte e-mailbezorging van de nieuwe onderdelen, productie (bestaat nog niet), snelheid,
  een volledige toegankelijkheidsaudit, en Plausible-gebeurtenissen in productie.

## Wat ik van je nodig heb

Stand 30-09-2026. Vastgelegd: Tristan volgt op binnen 3 werkdagen, de taalstructuur is akkoord, de kennisbank
is beoordeeld en gepubliceerd, en er is 1 echte werkgever.

1. KvK-nummer, correspondentieadres en juridische naam (volgt).
2. De vacatures van de eerste werkgever: titel, stad, taaleis, uren, loon en sluitingsdatum. Plaatsen kan
   zodra productie live is.
3. Je keuze uit de voorgestelde advertentiekanalen (voor de controle van advertentie en landingspagina).

## Latere uitbreidingen (niet nodig voor de eerste livegang)

- Overzichtspagina's per stad of groep zodra daar echt aanbod is.
- Vacaturealerts, met meting.
- Indexing API voor vacatures.
- Server-side titels en voorbeelden voor delen op sociale media.
- Kleinere JavaScript-bundels (code splitting) na een snelheidsmeting.
- Volledige toegankelijkheidsaudit (daarvoor is een nieuw testpakket nodig, dat ik eerst aan je voorleg).
- Aparte mailbox voor sollicitatie-opvolging (`APPLICATION_OPS_EMAIL`).
