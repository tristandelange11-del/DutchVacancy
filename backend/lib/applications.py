"""Who hears about a new application, and in which language.

Three messages, each best-effort (a mail outage must never lose the application itself,
which is already stored before this runs):
  - the student gets a confirmation that it was received;
  - every employer account of the company gets a notification pointing to the dashboard;
  - DutchVacancy's follow-up inbox (APPLICATION_OPS_EMAIL, falling back to
    CONTACT_NOTIFICATION_EMAIL) gets a minimal record including whether the employer
    notification actually went out, so failed deliveries can be chased by a person.

No CV contents or motivation text go into any email — the dashboard is the source.
"""

import os
from typing import Any

from lib.email import app_url, is_test_address, send_email

MESSAGES: dict[str, dict[str, str]] = {
    "student_subject": {
        "en": "Application received: {job} at {company}",
        "nl": "Sollicitatie ontvangen: {job} bij {company}",
    },
    "student_title": {"en": "Your application was received", "nl": "Je sollicitatie is ontvangen"},
    "student_body": {
        "en": "We received your application for {job} at {company} and passed it on to the employer. "
        "The employer decides on next steps; you can follow the status of your application in your dashboard.",
        "nl": "We hebben je sollicitatie voor {job} bij {company} ontvangen en doorgestuurd naar de werkgever. "
        "De werkgever bepaalt de volgende stap; de status van je sollicitatie volg je in je dashboard.",
    },
    "student_action": {"en": "View my applications", "nl": "Bekijk mijn sollicitaties"},
    "employer_subject": {
        "en": "New application for {job}",
        "nl": "Nieuwe sollicitatie voor {job}",
    },
    "employer_title": {"en": "You received a new application", "nl": "Je hebt een nieuwe sollicitatie"},
    "employer_body": {
        "en": "{student} applied for {job}. Review the application, motivation and CV in your dashboard.",
        "nl": "{student} heeft gesolliciteerd op {job}. Bekijk de sollicitatie, motivatie en het cv in je dashboard.",
    },
    "employer_action": {"en": "Open dashboard", "nl": "Open dashboard"},
}


def _msg(key: str, lang: str, **kw: str) -> str:
    table = MESSAGES[key]
    return table.get(lang, table["en"]).format(**kw)


def ops_address() -> str:
    return (os.getenv("APPLICATION_OPS_EMAIL") or os.getenv("CONTACT_NOTIFICATION_EMAIL") or "").strip()


async def notify_application(app: dict[str, Any], student_lang: str, employers: list[dict[str, Any]]) -> dict[str, str]:
    status: dict[str, str] = {}
    kw = {"job": app["job_title"], "company": app["company_name"], "student": app["student_name"]}

    # Reserved test addresses are never mailed (lib/email.py); recording that as
    # "failed" would send a person chasing a delivery problem that does not exist.
    if is_test_address(app["student_email"]):
        status["student"] = "skipped_test_address"
    else:
        ok = await send_email(
            app["student_email"],
            _msg("student_subject", student_lang, **kw),
            _msg("student_title", student_lang, **kw),
            _msg("student_body", student_lang, **kw),
            _msg("student_action", student_lang, **kw),
            f"{app_url()}/student/dashboard",
        )
        status["student"] = "sent" if ok else "failed"

    real_employers = [e for e in employers if not is_test_address(e["email"])]
    delivered = 0
    for employer in real_employers:
        lang = employer.get("lang") or "en"
        if await send_email(
            employer["email"],
            _msg("employer_subject", lang, **kw),
            _msg("employer_title", lang, **kw),
            _msg("employer_body", lang, **kw),
            _msg("employer_action", lang, **kw),
            f"{app_url()}/employer/dashboard",
        ):
            delivered += 1
    if not employers:
        status["employer"] = "no_recipient"
    elif not real_employers:
        status["employer"] = "skipped_test_address"
    else:
        status["employer"] = "sent" if delivered else "failed"

    ops = ops_address()
    if ops:
        ok = await send_email(
            ops,
            f"[Follow-up] Application {app['id'][:8]} — {app['job_title']} ({app['company_name']})",
            "New application on DutchVacancy",
            f"Application {app['id']} for {app['job_title']} at {app['company_name']}. "
            f"Employer notification: {status['employer']}; student confirmation: {status['student']}. "
            "Follow up if the employer notification did not go out.",
            "Open DutchVacancy",
            app_url(),
        )
        status["ops"] = "sent" if ok else "failed"
    else:
        status["ops"] = "not_configured"
    return status
