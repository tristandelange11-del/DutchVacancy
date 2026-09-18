# DutchVacancy — living spec

Bilingual-ready (English-only UI for now) job platform connecting international students in the
Netherlands with employers that hire in English.

## Stack
FastAPI + motor/MongoDB backend (`/api` router only) · Vite + React 19 + TS strict + Tailwind v4 +
shadcn (base-nova). Auth = httpOnly session cookie (`dv_session`) + `sessions` collection.

## Data model (backend/models/schemas.py ↔ frontend/src/lib/types.ts)
- `users`: id, email, password_hash, name, role (student|employer), company_id, company_name, profile{university, study, city, english_level, cv_url, bio, phone}
- `companies`: id, name, city, industry, website, about, logo_initials
- `jobs`: id, company_id, company_name, title, city, category, job_type (part_time|internship|working_student|graduate), english_level (english_only|basic_dutch|dutch_required), permit_support (twv_provided|eu_eea|freelance_kvk|none), hourly_min/max, hours_per_week, description, requirements[], perks[], published
- `applications`: id, job_id/title, company_id/name, student_id/name/email/university, motivation, cv_url, status (applied|under_review|interview|accepted|rejected)
- `saved_jobs`: student_id + job_id (unique)
- `contact_messages`

## Endpoints (all on api_router, prefix /api)
Auth: POST /auth/register, /auth/login, /auth/logout; GET /auth/me, /auth/session (null when anon); PUT /auth/profile (student)
Public: GET /jobs (q, city, job_type, english_level, permit_support, min_rate, limit), GET /jobs/{id}, GET /stats, POST /contact
Student: POST /jobs/{id}/apply, GET /student/applications, GET/POST/DELETE /student/saved-jobs[/{job_id}]
Employer: GET/PUT /employer/company, GET/POST /employer/jobs, PUT/DELETE /employer/jobs/{id}, GET /employer/applications, PATCH /employer/applications/{id}

## Routes
/ · /jobs · /jobs/:jobId · /login · /register · /how-it-works · /guide · /about · /contact · /privacy
· /terms · /student/dashboard · /employer/dashboard · /employer/vacancies/new ·
/employer/vacancies/:jobId/edit · * (404)

## Seed facts (`cd /app/backend && python seed.py`, idempotent — wipes and reseeds)
2 companies (Picnic Technologies, Canalside Hospitality Group), 14 published vacancies across
Amsterdam/Rotterdam/Utrecht/Eindhoven/Delft/Groningen, 1 student (3 applications: interview,
under_review, applied; 2 saved jobs), 2 employer accounts. Credentials: memory/test_credentials.md.

## Known deviations
- Dutch (NL) translation not implemented — user chose English-only for now; no language switcher shipped.
- CV is a URL field, not a file upload (user choice).
