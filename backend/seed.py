"""Idempotent seed: 2 employers + 14 vacancies + 1 student + sample applications."""

import asyncio

from lib.auth import hash_password
from lib.db import db, ensure_indexes
from models.schemas import Application, Company, Job, StudentProfile, User, new_id, utcnow

# Minimal valid one-page PDF so the demo student has a real, downloadable CV file.
DEMO_CV_BYTES = (
    b"%PDF-1.4\n"
    b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
    b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\n"
    b"trailer<</Root 1 0 R>>\n%%EOF\n"
)
DEMO_CV_NAME = "aarav-sharma-cv.pdf"

COMPANIES = [
    Company(
        id="c-picnic",
        name="Picnic Technologies",
        city="Amsterdam",
        industry="Logistics & AI",
        website="https://picnic.app",
        about=(
            "Picnic is the fastest growing online supermarket in the Netherlands. Our Amsterdam "
            "tech hub runs fully in English, with over 40 nationalities building the app, the "
            "routing algorithms and the warehouse automation that gets groceries to the door."
        ),
        logo_initials="PT",
    ),
    Company(
        id="c-canalside",
        name="Canalside Hospitality Group",
        city="Utrecht",
        industry="Hospitality & Events",
        website="https://canalside.example.nl",
        about=(
            "Canalside runs eight cafés, two hotels and a festival catering crew across Utrecht, "
            "Rotterdam and Groningen. We hire international students year-round, work in English "
            "on the floor, and help with BSN appointments and TWV permits where needed."
        ),
        logo_initials="CH",
    ),
]

JOBS = [
    # Picnic
    ("c-picnic", "Junior Frontend Developer (Working Student)", "Amsterdam", "Tech & Engineering", "working_student", "english_only", "twv_provided", 19.0, 24.0, 16,
     "Join the Picnic web team and ship customer-facing features in React and TypeScript. You pair with senior engineers twice a week, own small features end to end, and everything from stand-ups to code review happens in English.",
     ["1st or 2nd year CS/AI student in the Netherlands", "Comfortable with JavaScript or TypeScript", "Available 16 hours per week"],
     ["Free lunch at the Amsterdam hub", "Mentor from day one", "NS travel reimbursed"]),
    ("c-picnic", "Data Analytics Intern", "Amsterdam", "Data & Analytics", "internship", "english_only", "twv_provided", 16.5, 19.0, 32,
     "A five-month internship inside the Supply Chain Analytics team. You build dashboards in SQL and Python that forecast demand for 200+ delivery hubs, and present findings to the operations leads every sprint.",
     ["Enrolled in a Dutch university (BSc or MSc)", "SQL and Python basics", "Internship agreement from your university"],
     ["Thesis supervision available", "Hybrid: 3 days on site", "Internship allowance + laptop"]),
    ("c-picnic", "Warehouse Operations Assistant", "Utrecht", "Logistics & Operations", "part_time", "english_only", "twv_provided", 15.2, 17.4, 16,
     "Evening shifts in our Utrecht fulfilment centre picking and packing grocery orders. Shift instructions, safety training and team briefings are all in English, and you pick your own shifts a week ahead.",
     ["18 years or older", "Available two evenings per week", "Dutch not required"],
     ["Shift bonus after 20:00", "Free dinner on shift", "Flexible weekly planning"]),
    ("c-picnic", "Customer Success Agent (English)", "Amsterdam", "Customer Support", "part_time", "english_only", "eu_eea", 15.8, 18.0, 16,
     "Help English-speaking customers by chat and phone with deliveries, refunds and app questions. You get two weeks of paid training and a script library, and never need to speak Dutch on this queue.",
     ["Fluent written and spoken English", "Student in the Netherlands", "Weekend availability once a month"],
     ["Paid onboarding", "Work from home two days a week", "Career path into team lead"]),
    ("c-picnic", "QA Automation Working Student", "Eindhoven", "Tech & Engineering", "working_student", "english_only", "twv_provided", 18.0, 22.5, 16,
     "Extend our Playwright test suite for the Picnic store app. You will write end-to-end checks, triage nightly failures and work directly with the release engineers in an English-first team.",
     ["Studying software engineering or similar", "Some experience with automated testing", "16 hours per week, flexible"],
     ["Latest MacBook", "Conference budget", "Full-time offer after graduation"]),
    ("c-picnic", "Graduate Product Analyst (Zoekjaar)", "Amsterdam", "Data & Analytics", "graduate", "english_only", "twv_provided", 22.0, 27.0, 40,
     "A full-time graduate role designed for orientation-year (zoekjaar) holders. You own the experimentation roadmap for one product area, run A/B tests, and translate results into product decisions.",
     ["MSc completed within the last 3 years", "Zoekjaar permit or EU/EEA passport", "Strong statistics fundamentals"],
     ["Relocation support", "30% ruling guidance where applicable", "Pension + 8% holiday pay"]),
    ("c-picnic", "Marketing Content Working Student", "Amsterdam", "Marketing & Communications", "working_student", "basic_dutch", "eu_eea", 16.0, 19.5, 16,
     "Write English campaign copy, social posts and in-app messages. Basic Dutch is a plus because you will localise a few headlines with our copy team, but your day-to-day output is English.",
     ["Studying marketing, comms or linguistics", "Portfolio of written work", "Basic Dutch welcome, not required"],
     ["Creative team offsites", "Own your own campaign", "Free groceries credit"]),
    ("c-picnic", "Delivery Hub Planner", "Rotterdam", "Logistics & Operations", "part_time", "english_only", "twv_provided", 16.2, 19.0, 16,
     "Plan daily delivery routes and driver capacity for the Rotterdam region using our internal planning tool. You work in a small English-speaking control room alongside two other student planners.",
     ["Analytical mindset, Excel comfortable", "Available in morning blocks", "No Dutch needed"],
     ["16h contract that fits your lectures", "Travel allowance", "Training in logistics planning"]),
    # Canalside
    ("c-canalside", "Barista — English Speaking Team", "Utrecht", "Hospitality & Events", "part_time", "english_only", "twv_provided", 14.5, 16.8, 16,
     "Pull espresso, run the bar and look after guests in our Oudegracht café. Our floor language is English, we train you on the machine from scratch, and the team is mostly international students.",
     ["Friendly and reliable", "Two shifts per week including one weekend", "No experience needed"],
     ["Tips shared equally", "Free coffee and staff meal", "TWV permit paperwork handled for you"]),
    ("c-canalside", "Festival Catering Crew (Summer Full-Time)", "Rotterdam", "Hospitality & Events", "part_time", "english_only", "none", 15.0, 18.5, 38,
     "In June, July and August students may work full-time in the Netherlands — perfect for our festival season. You join the catering crew for events across Zuid-Holland, working in an English-speaking team.",
     ["Available across summer months", "Able to lift event equipment", "Team player under pressure"],
     ["Full-time summer hours allowed", "Transport to venues included", "Festival wristbands for the crew"]),
    ("c-canalside", "Hotel Front Desk Assistant", "Groningen", "Hospitality & Events", "part_time", "english_only", "eu_eea", 15.5, 18.0, 16,
     "Welcome international guests, handle check-ins in our property management system, and answer questions about the city. Guests are 80% international, so English is the working language.",
     ["Confident, hospitable communicator", "Comfortable with evening shifts", "Dutch not required"],
     ["Shift meals", "Hotel discount across the group", "Rotation into events team possible"]),
    ("c-canalside", "Events Marketing Intern", "Utrecht", "Marketing & Communications", "internship", "english_only", "none", 14.0, 16.0, 32,
     "Support the events team with English-language promotion for 30+ venue nights per semester: social content, partner outreach with student associations, and post-event reporting.",
     ["Internship as part of your study programme", "Social media savvy", "Based in or near Utrecht"],
     ["Internship allowance", "Free entry to all our events", "Reference letter on completion"]),
    ("c-canalside", "Kitchen Assistant (Flexible Hours)", "Delft", "Hospitality & Events", "part_time", "basic_dutch", "twv_provided", 14.2, 16.5, 12,
     "Prep, plating and cleaning in a busy open kitchen next to the TU Delft campus. Some team members speak Dutch, but instructions and the recipe book are in English.",
     ["Available two evenings a week", "Hygiene-conscious and quick", "Basic Dutch a plus"],
     ["Meal every shift", "Shifts around your exam weeks", "Stable 12h contract"]),
    ("c-canalside", "Graduate Venue Manager Trainee", "Amsterdam", "Hospitality & Events", "graduate", "english_only", "freelance_kvk", 20.0, 24.0, 40,
     "A 12-month traineeship rotating through three venues, ending with your own shift-lead responsibility. Built for recent graduates, including zoekjaar holders and freelancers with a KVK number.",
     ["Bachelor or master completed", "Some hospitality experience", "Right to work in the Netherlands"],
     ["Structured 12-month programme", "Mentoring from the operations director", "Permanent contract on completion"]),
]


async def main() -> None:
    for coll in ("users", "sessions", "companies", "jobs", "applications", "saved_jobs", "cv_files"):
        await db[coll].delete_many({})
    await ensure_indexes()

    for company in COMPANIES:
        await db.companies.insert_one(company.model_dump())

    employers = [
        ("employer@picnic.nl", "Sanne de Vries", "c-picnic", "Picnic Technologies"),
        ("employer@canalside.nl", "Marcus Oyelaran", "c-canalside", "Canalside Hospitality Group"),
    ]
    for email, name, cid, cname in employers:
        user = User(email=email, name=name, role="employer", company_id=cid, company_name=cname)
        doc = user.model_dump()
        doc["password_hash"] = hash_password("Employer123!")
        await db.users.insert_one(doc)

    student = User(
        email="student@dutchvacancy.nl",
        name="Aarav Sharma",
        role="student",
        profile=StudentProfile(
            university="University of Amsterdam",
            study="MSc Information Studies",
            city="Amsterdam",
            english_level="fluent",
            bio="MSc student from India looking for 16h/week tech work alongside my studies.",
            phone="+31 6 1234 5678",
        ),
    )
    # The demo CV is a stored file, not a link: uploads live in the cv_files collection.
    cv_id = new_id()
    await db.cv_files.insert_one(
        {
            "id": cv_id,
            "owner_id": student.id,
            "filename": DEMO_CV_NAME,
            "content_type": "application/pdf",
            "size": len(DEMO_CV_BYTES),
            "data": DEMO_CV_BYTES,
            "created_at": utcnow(),
        }
    )
    student.profile.cv_url = f"/api/cv/{cv_id}"
    student.profile.cv_filename = DEMO_CV_NAME
    sdoc = student.model_dump()
    sdoc["password_hash"] = hash_password("Student123!")
    await db.users.insert_one(sdoc)

    created: list[Job] = []
    for (cid, title, city, category, jtype, eng, permit, hmin, hmax, hours, desc, reqs, perks) in JOBS:
        company = next(c for c in COMPANIES if c.id == cid)
        job = Job(
            company_id=cid,
            company_name=company.name,
            title=title,
            city=city,
            category=category,
            job_type=jtype,
            english_level=eng,
            permit_support=permit,
            hourly_min=hmin,
            hourly_max=hmax,
            hours_per_week=hours,
            description=desc,
            requirements=reqs,
            perks=perks,
            published=True,
        )
        await db.jobs.insert_one(job.model_dump())
        created.append(job)

    # Sample applications from the demo student, across status stages.
    for job, status, note in [
        (created[0], "interview", "I build React side projects and would love to ship real features at Picnic. My timetable leaves Tuesdays and Thursdays free."),
        (created[1], "under_review", "My MSc track is data-heavy and I already use SQL and pandas daily. The supply chain forecasting work is exactly what I want to specialise in."),
        (created[8], "applied", "I am looking for a friendly English-speaking team while I settle into Utrecht, and I learn fast behind a bar."),
    ]:
        app = Application(
            job_id=job.id,
            job_title=job.title,
            company_name=job.company_name,
            company_id=job.company_id,
            student_id=student.id,
            student_name=student.name,
            student_email=student.email,
            student_university=student.profile.university,
            motivation=note,
            cv_url=student.profile.cv_url,
            cv_filename=student.profile.cv_filename,
            status=status,  # type: ignore[arg-type]
        )
        await db.applications.insert_one(app.model_dump())

    for job in (created[4], created[5]):
        await db.saved_jobs.update_one(
            {"student_id": student.id, "job_id": job.id},
            {"$setOnInsert": {"student_id": student.id, "job_id": job.id}},
            upsert=True,
        )

    print(f"seeded {len(COMPANIES)} companies, {len(created)} jobs, 3 users")


if __name__ == "__main__":
    asyncio.run(main())
