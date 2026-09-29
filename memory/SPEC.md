# DutchVacancy — living spec

Bilingual-ready (English-only UI for now) job platform connecting international students in the
Netherlands with employers that hire in English.

## Stack
FastAPI + motor/MongoDB backend (`/api` router only) · Vite + React 19 + TS strict + Tailwind v4 +
shadcn (base-nova). Auth = httpOnly session cookie (`dv_session`) + `sessions` collection.

## Data model (backend/models/schemas.py ↔ frontend/src/lib/types.ts)
- `users`: id, email, password_hash, name, role (student|employer), company_id, company_name, profile{university, study, city, english_level, cv_url, bio, phone}
- `companies`: id, name, city, industry, website, about, logo_initials
- `jobs`: id, company_id, company_name, title, city, category, job_type (part_time|internship|working_student|graduate), english_level (english_only|basic_dutch|dutch_required), permit_support (twv_provided|eu_eea|freelance_kvk|none), work_mode (on_site|hybrid|remote), hourly_min/max, hours_per_week, description, requirements[], perks[], published
- `applications`: id, job_id/title, company_id/name, student_id/name/email/university, motivation, cv_url, status (applied|under_review|interview|accepted|rejected)
  - `interview` (optional, set by the employer): mode (online|on_location), location (meeting link or address), note, slots[] (UTC datetimes, 1–5, future, ≤ 90 days ahead), chosen_slot (null until the candidate picks), proposed_at. All datetimes are serialised as UTC with an offset.
- `users` also carry `email_verified` (bool). Single-use hashed tokens for email verification and password reset live in `auth_tokens`.
- `saved_jobs`: student_id + job_id (unique)
- `contact_messages`

## Endpoints (all on api_router, prefix /api)
Auth: POST /auth/register, /auth/login, /auth/logout; GET /auth/me, /auth/session (null when anon); PUT /auth/profile (student)
Auth extras: POST /auth/verify-email, /auth/resend-verification, /auth/forgot-password, /auth/reset-password; DELETE /auth/account. Applying and publishing/promoting a vacancy require `email_verified`.
Public: GET /jobs (q, city, job_type, english_level, permit_support, work_mode, min_rate, limit), GET /jobs/{id}, GET /stats, POST /contact
Student: POST /jobs/{id}/apply, GET /student/applications, GET/POST/DELETE /student/saved-jobs[/{job_id}]
Employer: GET/PUT /employer/company, GET/POST /employer/jobs, PUT/DELETE /employer/jobs/{id}, GET /employer/applications, PATCH /employer/applications/{id}
Interviews (backend/routers/interviews.py): PUT /employer/applications/{id}/interview (employer proposes 1–5 slots + mode/location/note; sets status `interview`, replaces any earlier proposal, emails the candidate a link to /student/applications/{id}/interview); POST /student/applications/{id}/interview/choose {slot} (candidate picks one offered, future slot once; both the candidate and the company's employer accounts are emailed a confirmation with a `.ics` calendar invite attached — one VEVENT, UTC, `lib/ics.py`, no external dependency). GET /student/applications/{id}/interview.ics and GET /employer/applications/{id}/interview.ics re-download that same file once a slot is chosen (409 before then). Errors: 404 not your application, 409 no proposal / already chosen / slot passed / no confirmed time yet, 422 slot not offered or invalid proposal.

## Routes
/ · /jobs · /jobs/:jobId · /login · /register · /how-it-works · /guide · /about · /contact · /privacy
· /terms · /student/dashboard · /employer/dashboard · /employer/vacancies/new ·
/employer/vacancies/:jobId/edit · /student/applications/:appId/interview (candidate picks a time) · * (404)

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
`frontend/src/lib/i18n.tsx` (LanguageProvider mounted in main.tsx, `useLang() -> {lang, setLang, t, tl}`)
+ `frontend/src/lib/dict.ts` (flat key → [en, nl]; `tl()` returns paragraph/step lists). Choice persists
in localStorage `dv_lang` and sets `<html lang>`. With no stored choice the initial language comes from
the browser (`navigator.languages` containing an `nl*` tag → Dutch, otherwise English); an explicit
switch always wins and is remembered. Switcher: `components/LanguageSwitch.tsx`
(testids `language-switch`, `lang-switch-en`, `lang-switch-nl`) in desktop and mobile header.
All static UI copy is translated; job/company content stays as the employer entered it.

## SEO
- `frontend/src/lib/seo.ts`: `useSeo({title, description, image?, type?, noindex?, jsonLd?})` sets
  title (auto-suffixed ` · DutchVacancy`), description, robots, canonical, og:* and twitter:* on every
  route change, and injects/removes a `#dv-json-ld` script. `jobPostingJsonLd(job)` builds a
  schema.org JobPosting (employmentType, place/NL, EUR hourly baseSalary, TELECOMMUTE when remote)
  used on `/jobs/:jobId` so vacancies are eligible for Google Jobs.
- Called on every page. Auth pages and both dashboards pass `noindex: true`.
- Social card asset: `frontend/public/og-cover.jpg` (also the index.html default og:image).
- `backend/routers/seo.py` → `GET /api/seo/sitemap.xml` and `/api/seo/robots.txt`; the Vite proxy
  rewrites the crawler paths `/sitemap.xml` and `/robots.txt` onto them. The sitemap lists the 8
  public static routes plus every published job (with lastmod); dashboards/auth/api are excluded and
  disallowed in robots.txt. The base URL comes from the request's forwarded host — never APP_URL,
  which can be a stale preview hostname.

## Error monitoring
`backend/server.py` initialises Sentry (`sentry-sdk[fastapi]`) right after `load_dotenv`, before the
app itself, so its FastAPI integration auto-instruments. No-ops without `SENTRY_DSN` set — local dev
and any environment that hasn't configured one is unaffected. `traces_sample_rate=0.0` and
`send_default_pii=False` are explicit (error capture only, no tracing/profiling; no request
bodies/headers or user IP sent). `SENTRY_ENVIRONMENT` tags events `staging` vs `production`
(`compose.staging.yml`/`compose.production.yml`) — one shared Sentry project/DSN for both, not two.
The `SENTRY_DSN` GitHub secret is injected into `.env.staging`/`.env.production` by the deploy
workflows the same way `RESEND_API_KEY` already is.
