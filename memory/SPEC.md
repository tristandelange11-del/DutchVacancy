# DutchVacancy — living spec

Bilingual-ready (English-only UI for now) job platform connecting international students in the
Netherlands with employers that hire in English.

## Stack
FastAPI + motor/MongoDB backend (`/api` router only) · Vite + React 19 + TS strict + Tailwind v4 +
shadcn (base-nova). Auth = httpOnly session cookie (`dv_session`) + `sessions` collection.

## Data model (backend/models/schemas.py ↔ frontend/src/lib/types.ts)
- `users`: id, email, password_hash, name, role (student|employer), company_id, company_name, profile{university, study, city, english_level, cv_url, bio, phone}
- `companies`: id, name, city, industry, website, about, logo_initials; `moderation_trusted` (stored, not in the API model, so an employer cannot set it) becomes true once a person approves one of the company's vacancies
- `jobs`: id, company_id, company_name, title, city, category, job_type (part_time|internship|working_student|graduate), english_level (english_only|basic_dutch|dutch_required), permit_support (twv_provided|eu_eea|freelance_kvk|none), work_mode (on_site|hybrid|remote), description, requirements[], perks[], published, created_at, fresh_until
  - Only stated, never defaulted (null/empty = not stated, not shown): hourly_min/max (gross, in `salary_period` units — the names predate monthly pay), salary_period (hour|month), hours_per_week (1–40), schedule (free text ≤300), schedule_tags[] (evening|weekend|holiday), contract_type (employment|on_call|agency|internship|freelance — deliberately separate from job_type), start_date (date). cv_required (bool) makes a CV mandatory on apply.
  - valid_through = closing date. Required (future, ≤180 days) to publish via POST/PUT /employer/jobs. A vacancy is open while published, not pending or rejected in moderation, and before its closing date (`backend/lib/vacancies.py`); legacy docs without one close 60 days after created_at. Closed vacancies are excluded from /jobs, /stats, /jobs/fresh and the sitemap, refuse applications (409 job_closed) and Fresh checkout, and render a closed state with noindex and no JSON-LD. JobWithMeta adds is_open + closes_at.
- `applications`: id, job_id/title, company_id/name, student_id/name/email/university, motivation, cv_url, status (applied|under_review|interview|accepted|rejected)
  - `notification_status` (stored, not in the API model): {student, employer, ops} each sent|failed|skipped_test_address|no_recipient|not_configured — set after the application is stored (`backend/lib/applications.py`).
  - `interview` (optional, set by the employer): mode (online|on_location), location (meeting link or address), note, slots[] (UTC datetimes, 1–5, future, ≤ 90 days ahead), chosen_slot (null until the candidate picks), proposed_at. All datetimes are serialised as UTC with an offset.
- `users` also carry `email_verified` (bool) and `lang` (en|nl, set at registration from the UI language). Every transactional mail — verification, password reset, application, interview invite/confirmation and the `.ics` text — is written in the recipient's own `lang` (`lib/mail_text.py`, `lib/applications.py`); dates are spelled out per language in Amsterdam time. Single-use hashed tokens for email verification and password reset live in `auth_tokens`.
- `saved_jobs`: student_id + job_id (unique)
- `contact_messages`: kind (general|employer), name, email, company, subject, message, notification_status
- Moderation (see "Moderation" below): `jobs.moderation_status` (approved|pending|rejected; docs without one count as approved) and `jobs.moderation_note` (the reason for a refusal, mailed to and shown only to the employer). `moderation_reviews`: token_hash (sha256, unique), job_id, reason (first_vacancy|flagged|report|resubmitted), findings[], created_at, expires_at (30 days), used_at, decision. `job_reports`: job_id, reason (discrimination|scam|other), message (≤1000), created_at — no name, account or IP. `moderation_log`: job_id, action (review_requested|reported|approved|rejected), by (system|visitor|moderator), at, details. Deleting a vacancy or an employer account deletes its reports and review links; the log stays.

## Endpoints (all on api_router, prefix /api)
Auth: POST /auth/register, /auth/login, /auth/logout; GET /auth/me, /auth/session (null when anon); PUT /auth/profile (student)
Auth extras: POST /auth/verify-email, /auth/resend-verification, /auth/forgot-password, /auth/reset-password; DELETE /auth/account. Applying and publishing/promoting a vacancy require `email_verified`.
Public: POST /jobs/{id}/report {reason: discrimination|scam|other, message ≤1000} (anyone, no account; 5/hour per IP; 404 job_not_found unless the vacancy is public; stores a `job_reports` row and opens a review, or adds to the one already waiting), GET /jobs (q, city, job_type, english_level, permit_support, work_mode, min_rate, limit; city/job_type/english_level/permit_support/work_mode take one value or several comma-separated, any of which matches (max 20); q is matched literally, case-insensitive; the /jobs page keeps these filters in its URL in the same form), GET /jobs/{id} (404 for a pending or rejected vacancy unless the viewer is its own employer), GET /stats, POST /contact (kind general|employer; employer requests require company and are mailed to CONTACT_NOTIFICATION_EMAIL as 'employer request: <company>'), GET /kb, GET /kb/{slug} (knowledge base, see below)
Student: POST /jobs/{id}/apply (errors carry `detail: {code, message}` — email_not_verified 403, job_not_found 404, job_closed/already_applied 409, cv_required 422; on success emails the student a confirmation, the company's employer accounts a notification, and APPLICATION_OPS_EMAIL (fallback CONTACT_NOTIFICATION_EMAIL) a minimal follow-up record — never motivation or CV contents), GET /student/applications, GET/POST/DELETE /student/saved-jobs[/{job_id}]
Employer: GET/PUT /employer/company, GET/POST /employer/jobs, PUT/DELETE /employer/jobs/{id}, GET /employer/applications, PATCH /employer/applications/{id}, POST /employer/jobs/check {title, description, schedule, requirements[], perks[]} → {findings[{category, phrase, field}]} (hints while typing; nothing stored). POST /employer/jobs/{id}/fresh-checkout returns 409 while the vacancy waits for review.
Moderation (backend/routers/moderation.py, no account — the single-use link is the permission): GET /moderation/reviews/{token} → {reason, findings[], reports[], expires_at, job} (only shows; 30/minute), POST /moderation/reviews/{token} {decision: approve|reject, note} (reject needs a note of ≥10 characters; 10/minute). Errors carry `detail: {code}`: review_not_found 404, review_used 410, review_expired 410, job_not_found 404.
Interviews (backend/routers/interviews.py): PUT /employer/applications/{id}/interview (employer proposes 1–5 slots + mode/location/note; sets status `interview`, replaces any earlier proposal, emails the candidate a link to /student/applications/{id}/interview); POST /student/applications/{id}/interview/choose {slot} (candidate picks one offered, future slot once; both the candidate and the company's employer accounts are emailed a confirmation with a `.ics` calendar invite attached — one VEVENT, UTC, `lib/ics.py`, no external dependency). GET /student/applications/{id}/interview.ics and GET /employer/applications/{id}/interview.ics re-download that same file once a slot is chosen (409 before then). Errors: 404 not your application, 409 no proposal / already chosen / slot passed / no confirmed time yet, 422 slot not offered or invalid proposal.

Mail safety: `send_email` never contacts Resend for RFC 2606/6761 reserved domains (example.com/.org/.net, *.example, *.test, *.invalid, *.localhost) — all test accounts use these.

## Routes
/ · /jobs · /jobs/:jobId · /login · /register · /how-it-works · /guide (knowledge base hub) · /guide/:slug · /employers (employer info + request form) · /about · /contact · /privacy
· /terms · /student/dashboard · /employer/dashboard · /employer/vacancies/new ·
/employer/vacancies/:jobId/edit · /student/applications/:appId/interview (candidate picks a time) · /review/:token (moderator approves or refuses a vacancy; noindex, disallowed in robots.txt) · * (404)
Every route exists twice: Dutch at the root (`/jobs`) and English under `/en` (`/en/jobs`) — see i18n.

## Seed facts (historical demo data — NEVER run `backend/seed.py` against staging or production: it wipes the database)
2 companies (Picnic Technologies, Canalside Hospitality Group), 14 published vacancies across
Amsterdam/Rotterdam/Utrecht/Eindhoven/Delft/Groningen → replaced: the selectable cities are now
Leeuwarden, Groningen, Assen, Enschede, Arnhem, Nijmegen, Tilburg, Leiden, Amsterdam, Utrecht,
Alkmaar (constant `CITIES` in frontend/src/lib/types.ts; "All cities" is the default/empty option).
Work arrangement is a separate filter/field: `work_mode` on_site|hybrid|remote.
1 student (3 applications: interview, under_review, applied; 2 saved jobs), 2 employer accounts.
The demo student has a real stored CV
(`cv_files` collection, `aarav-sharma-cv.pdf`) referenced as `/api/cv/<id>`.
Credentials: memory/test_credentials.md.

## CV uploads
`POST /api/uploads/cv` (student only, multipart `file`, PDF/DOC/DOCX ≤ 5 MB) stores the bytes in the
`cv_files` collection — no disk dependency — and returns `{id, url, filename, size}` where `url` is
`/api/cv/<id>`. `GET /api/cv/{file_id}` requires login: the owning student always, an employer only
when that CV is attached to an application for their own company (else 403). Profile and applications
carry `cv_url` + `cv_filename`. Frontend: `components/CvUploadField.tsx` (used on the student profile
tab and in the apply dialog, which prefills the profile CV) + `apiUpload()` in `lib/api.ts`.
Employers skim a PDF inline via `components/CvPreview.tsx` (collapsible same-origin iframe on
`/api/cv/<id>`, plus an open-in-new-tab link); non-PDF uploads only offer the link.

## Known deviations
- Students upload a CV file (PDF/DOC/DOCX); the old paste-a-link field is gone.
## i18n (EN + NL)
The language is part of the URL: `ROOT_LANG` (`frontend/src/lib/paths.ts`, currently `nl`) is served at `/`,
the other language under its prefix (`/en/...`). `backend/lib/site.py` (`SITE_ROOT_LANG`) mirrors it for
email links and the sitemap — change both together. `App.tsx` mounts the same routes under `/en/*` and `/*`.
Import routing from `@/lib/router`, never from react-router-dom: its `Link`, `NavLink`, `Navigate` and
`useNavigate` send every internal absolute path to the current language ("/jobs" → "/en/jobs").
`LanguageProvider` (inside the router) reads the language from the URL and sets `<html lang>`; the switch
(`components/LanguageSwitch.tsx`, testids `language-switch`, `lang-switch-en`, `lang-switch-nl`) navigates to
the same page in the other language and remembers the choice in localStorage `dv_lang`. There is no redirect by
language: `components/LanguageHint.tsx` only *offers* the visitor's language (their last choice, else the
browser's) when a page is in the other one; "stay" records the current language.
`frontend/src/lib/dict.ts` holds the copy (flat key → [en, nl]; `tl()` returns paragraph/step lists).
All static UI copy is translated; job/company content stays as the employer entered it.

## Knowledge base ("Werken als internationale student in Nederland")
- Content is code, not DB rows: `backend/content/kb/` — `sources.py` (official pages, each opened and read in
  full, with `checked_on`), `articles/*.py` (7 articles, NL+EN side by side as `Text(nl, en)`), `model.py`.
  Every article has the fixed structure: answer, applies_to, exceptions, next_steps, contacts (official body
  for the next step), optional details sections, job_link (a `/jobs?` filter with a stated value only),
  employer_link, related, sources, author, reviewer, reviewed_on. Internal only (never served): the claims
  register (claim → sources, applies_to, checked_on, open questions), drafted_by, open_questions, review signals.
- Publication gate (`content/kb/__init__.py: publication_problems`): live only when status `published`, a named
  author, and for `sensitive` articles a named reviewer, with `reviewed_on` not in the future and not older than
  any claim check. `reviewed_on` moves only after a real content review. All 7 are drafts until the content owner
  is named. `backend/tests/test_knowledge_base.py` enforces the gate and content integrity in CI.
- Visibility: production serves only live articles; `KB_SHOW_DRAFTS=1` (set in `compose.staging.yml`) also
  serves drafts with `live: false` — rendered with a draft banner, noindex, no JSON-LD. Sitemap: live only.
- Periodic review: `review_every_days` (182) + dated `signals` (known law changes). `backend/scripts/kb_report.py`
  writes `docs/launch/kennisbank-verificatie.md`; `--check-sources` compares every source page with the
  fingerprint recorded at the last human read (`content/kb/fingerprints.json`, `--record` after re-reading);
  `.github/workflows/kb-sources.yml` runs it weekly (red = a person should look; a signal, not a guarantee).
- Frontend: `pages/Guide.tsx` (hub; official bodies when nothing is live), `pages/GuideArticle.tsx`,
  `components/Kb.tsx`, `components/GuideLinks.tsx` (vacancy → relevant articles, from stated facts only),
  `lib/kb.ts`. Home shows live article cards or the official bodies — rules are not paraphrased in UI strings.

## SEO
- `frontend/src/lib/seo.ts`: `useSeo({title, description, image?, type?, noindex?, jsonLd?})` sets
  title (auto-suffixed ` · DutchVacancy`), description, robots, canonical (per language, no query string, no
  trailing slash), hreflang alternates (nl, en, x-default → root language), og:locale, og:* and twitter:* on every
  route change, and injects/removes a `#dv-json-ld` script. `jobPostingJsonLd(job)` builds a
  schema.org JobPosting (employmentType, place/NL, EUR hourly baseSalary, TELECOMMUTE when remote)
  used on `/jobs/:jobId` so vacancies are eligible for Google Jobs.
- Called on every page. Auth pages and both dashboards pass `noindex: true`.
- Social card asset: `frontend/public/og-cover.jpg` (also the index.html default og:image).
- `backend/routers/seo.py` → `GET /api/seo/sitemap.xml` and `/api/seo/robots.txt`; the Vite proxy
  rewrites the crawler paths `/sitemap.xml` and `/robots.txt` onto them. The sitemap lists the 8
  public static routes, every live knowledge-base article and every open job (with lastmod), each in both
  languages with `xhtml:link` hreflang alternates; robots.txt disallows the private paths in both languages; dashboards/auth/api are excluded and
  disallowed in robots.txt. The base URL comes from the request's forwarded host — never APP_URL,
  which can be a stale preview hostname.

## Moderation (equal treatment and fake vacancies)
`backend/lib/moderation.py`, three layers:
1. The vacancy form asks for the sensitive facts as fixed choices (English level, work permit) and never for age, gender or nationality; it tells the employer to describe the work, not the candidate.
2. `check_vacancy` matches a word list per category (age, gender, origin, religion, appearance, health, personal) in Dutch and English against title, description, schedule, requirements and perks. It only flags: the form shows a hint per category while typing (`components/FairnessHints.tsx`), and a published vacancy that keeps a flagged phrase waits for a person. Bare "uiterlijk" is not flagged ("reageer uiterlijk vrijdag").
3. A person reviews: every first vacancy of a company no person has approved yet, every flagged one, every one changed after it waited or was refused, and every reported one. A company with a public vacancy from before moderation counts as approved.
Saving a published vacancy sets `moderation_status`: pending with a review (reasons above), otherwise approved; an online vacancy edited without flagged phrases stays online. Each review mails CONTACT_NOTIFICATION_EMAIL a single-use link to /review/{token}. Approving publishes it and marks the company `moderation_trusted`; refusing hides it and mails the employer the reason (in their `lang`). Approving a report on an online vacancy leaves it online without mailing the employer. A decision closes every open link of that vacancy; a new save closes the old link and opens a new one. Pending and rejected vacancies are hidden like closed ones (`lib/vacancies.is_public`/`open_query`) and leave students' saved lists. The employer dashboard shows "In review" / "Not approved" with the reason, and the vacancy page shows the owner a banner. Visitors report through "Report this vacancy" on a public vacancy (`components/ReportDialog.tsx`).

## Rate limiting
`backend/lib/ratelimit.py` — one shared `slowapi.Limiter` (in-memory, IP-keyed; relies on
`--workers 1` in `backend/Dockerfile`, a multi-worker deploy would need a shared backend like
Redis). Applied to `/auth/register`, `/auth/forgot-password`, `/auth/resend-verification` and
`/contact` at 5/minute, `/auth/login` at 10/minute. A 429 returns `{"detail": "..."}` like every
other error. `DISABLE_RATE_LIMITS=1` (set in `backend/tests/conftest.py`) turns it off for tests
generally; `backend/tests/test_rate_limiting.py` flips it back on for its own tests only.

## End-to-end tests
`tests/e2e/` (Playwright): `auth.spec.ts` (register/login/logout, wrong-password error) and
`hiring-flow.spec.ts` (the golden path: post a vacancy → a person approves it through the review page → apply → propose an interview →
candidate picks a time → both sides see it confirmed, `.ics` link included) and `moderation.spec.ts`
(form hints, refusal with a reason, the employer's view, a visitor's report). Email verification and
review links are shortcut via direct Mongo writes (`tests/fixtures/db.ts`) since there's no real mailbox in CI.
Runs as the `e2e` job in `.github/workflows/test.yml` against a disposable MongoDB service
container, the real backend and `npm run dev` (not a preview build — the Vite `/api` proxy only
applies to `vite dev`).

## Error monitoring
`backend/server.py` initialises Sentry (`sentry-sdk[fastapi]`) right after `load_dotenv`, before the
app itself, so its FastAPI integration auto-instruments. No-ops without `SENTRY_DSN` set — local dev
and any environment that hasn't configured one is unaffected. `traces_sample_rate=0.0` and
`send_default_pii=False` are explicit (error capture only, no tracing/profiling; no user IP or cookies),
and `max_request_body_size='never'` — without it the FastAPI integration attaches JSON request bodies
(names, emails, motivations) to error events even with send_default_pii off
(`backend/tests/test_error_monitoring_privacy.py`). `SENTRY_ENVIRONMENT` tags events `staging` vs `production`
(`compose.staging.yml`/`compose.production.yml`) — one shared Sentry project/DSN for both, not two.
The `SENTRY_DSN` GitHub secret is injected into `.env.staging`/`.env.production` by the deploy
workflows the same way `RESEND_API_KEY` already is.

## Analytics
`frontend/src/lib/analytics.ts`'s `initAnalytics()` (called once from `main.tsx`) loads the Plausible
script — cookie-free, no consent banner needed. Gated by a runtime hostname check
(`dutchvacancy.nl`/`www.dutchvacancy.nl` only), not a build-time env var, so staging/preview/local
traffic never reaches the real visitor numbers and there's nothing to configure per environment.

### Custom events (Plausible, production hostnames only)
`lib/analytics.ts: track()` — Article View, Article Job Click, Job View, Apply Start, Apply Complete (only in the
apply mutation's onSuccess), Employer Request (only after the server accepted it). Props are limited to slug,
job_id and source — never names, emails, CV or form contents. Plan and report template: docs/launch/meetplan.md.
Response times shown on the site come from `frontend/src/config/operations.ts` (null = no promise).
