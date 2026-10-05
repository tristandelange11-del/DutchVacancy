"""Account and interview email copy in both site languages.

Every recipient gets mail in the language stored on their own account (`users.lang`,
set from the UI language at registration); anything else falls back to English.
Dates are spelled out here rather than with strftime, whose day and month names
depend on the server locale.
"""

from datetime import datetime
from typing import Any, Optional
from zoneinfo import ZoneInfo

AMSTERDAM = ZoneInfo("Europe/Amsterdam")

TEXT: dict[str, dict[str, str]] = {
    "verify_subject": {"en": "Verify your DutchVacancy email", "nl": "Bevestig je e-mailadres bij DutchVacancy"},
    "verify_title": {"en": "Verify your email address", "nl": "Bevestig je e-mailadres"},
    "verify_body": {
        "en": "Confirm your email address to apply for jobs or publish vacancies.",
        "nl": "Bevestig je e-mailadres om te kunnen solliciteren of vacatures te plaatsen.",
    },
    "verify_action": {"en": "Verify email", "nl": "E-mailadres bevestigen"},
    "reset_subject": {"en": "Reset your DutchVacancy password", "nl": "Nieuw wachtwoord voor DutchVacancy"},
    "reset_title": {"en": "Reset your password", "nl": "Kies een nieuw wachtwoord"},
    "reset_body": {
        "en": "Use the button below to choose a new password. The link expires after one hour.",
        "nl": "Kies met de knop hieronder een nieuw wachtwoord. De link verloopt na een uur.",
    },
    "reset_action": {"en": "Reset password", "nl": "Nieuw wachtwoord kiezen"},
    "invite_subject": {
        "en": "Interview invitation from {company}: {job}",
        "nl": "Uitnodiging voor een gesprek bij {company}: {job}",
    },
    "invite_title": {"en": "Choose your interview time", "nl": "Kies je gesprekstijd"},
    "invite_body": {
        "en": "{company} would like to invite you for an interview for {job}. Pick the time that suits you best.",
        "nl": "{company} nodigt je uit voor een gesprek over {job}. Kies de tijd die jou het beste past.",
    },
    "invite_action": {"en": "Choose a time", "nl": "Kies een tijd"},
    "confirmed_subject": {"en": "Interview confirmed: {when}", "nl": "Gesprek bevestigd: {when}"},
    "confirmed_title": {"en": "Your interview is scheduled", "nl": "Je gesprek staat gepland"},
    "confirmed_body": {
        "en": "Your interview with {company} for {job} is confirmed for {when}. "
        "Add it to your calendar with the attached file.",
        "nl": "Je gesprek met {company} over {job} is bevestigd op {when}. "
        "Zet het in je agenda met het bijgevoegde bestand.",
    },
    "employer_confirmed_subject": {
        "en": "{student} chose an interview time",
        "nl": "{student} heeft een gesprekstijd gekozen",
    },
    "employer_confirmed_title": {"en": "Interview time confirmed", "nl": "Gesprekstijd bevestigd"},
    "employer_confirmed_body": {
        "en": "{student} will attend the interview for {job} on {when}. "
        "Add it to your calendar with the attached file.",
        "nl": "{student} komt op {when} op gesprek voor {job}. "
        "Zet het in je agenda met het bijgevoegde bestand.",
    },
    "dashboard_action": {"en": "Open dashboard", "nl": "Open dashboard"},
    "moderation_approved_subject": {"en": "Your vacancy is online: {job}", "nl": "Je vacature staat online: {job}"},
    "moderation_approved_title": {"en": "Your vacancy is online", "nl": "Je vacature staat online"},
    "moderation_approved_body": {
        "en": "We reviewed {job} and published it. Students can now find it and apply.",
        "nl": "We hebben {job} bekeken en gepubliceerd. Studenten kunnen de vacature nu vinden en erop solliciteren.",
    },
    "moderation_approved_action": {"en": "Open dashboard", "nl": "Open dashboard"},
    "moderation_rejected_subject": {
        "en": "Your vacancy needs changes: {job}",
        "nl": "Je vacature moet worden aangepast: {job}",
    },
    "moderation_rejected_title": {"en": "Your vacancy is not online", "nl": "Je vacature staat niet online"},
    "moderation_rejected_body": {
        "en": "We reviewed {job} and did not publish it. Our reason: {note} "
        "Change the vacancy in your dashboard and we will review it again.",
        "nl": "We hebben {job} bekeken en niet gepubliceerd. Onze reden: {note} "
        "Pas de vacature aan in je dashboard, dan bekijken we hem opnieuw.",
    },
    "moderation_rejected_action": {"en": "Edit vacancy", "nl": "Vacature aanpassen"},
    "ignore_footer": {
        "en": "If you did not request this email, you can ignore it.",
        "nl": "Heb je deze e-mail niet verwacht? Dan kun je hem negeren.",
    },
    "ics_student_summary": {"en": "Interview: {job} at {company}", "nl": "Gesprek: {job} bij {company}"},
    "ics_student_description": {"en": "Interview for {job} at {company}.", "nl": "Gesprek over {job} bij {company}."},
    "ics_employer_summary": {"en": "Interview: {student} — {job}", "nl": "Gesprek: {student} — {job}"},
    "ics_employer_description": {"en": "Interview with {student} for {job}.", "nl": "Gesprek met {student} over {job}."},
}

_DAYS = {
    "en": ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
    "nl": ("maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"),
}
_MONTHS = {
    "en": ("January", "February", "March", "April", "May", "June", "July", "August",
           "September", "October", "November", "December"),
    "nl": ("januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus",
           "september", "oktober", "november", "december"),
}
_ZONE_NOTE = {"en": "Amsterdam time", "nl": "Nederlandse tijd"}


def lang_of(user: Optional[dict[str, Any]]) -> str:
    return "nl" if user and user.get("lang") == "nl" else "en"


def text(key: str, lang: str, **kw: str) -> str:
    table = TEXT[key]
    return table.get(lang, table["en"]).format(**kw)


def format_slot(slot: datetime, lang: str) -> str:
    """'Monday 5 October 2026, 14:00 (Amsterdam time)' / 'maandag 5 oktober 2026, 14:00 (Nederlandse tijd)'."""
    lang = lang if lang in _DAYS else "en"
    local = slot.astimezone(AMSTERDAM)
    return (
        f"{_DAYS[lang][local.weekday()]} {local.day} {_MONTHS[lang][local.month - 1]} {local.year}, "
        f"{local:%H:%M} ({_ZONE_NOTE[lang]})"
    )
