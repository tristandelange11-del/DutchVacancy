// Flat key → [English, Dutch]. Values are strings or string lists (for prose blocks).
export type Entry = [string, string] | [string[], string[]];

export const DICT: Record<string, Entry> = {
  // ---------- nav / footer ----------
  "nav.jobs": ["Browse Jobs", "Vacatures"],
  "nav.how": ["How It Works", "Hoe het werkt"],
  "nav.guide": ["Student Guide", "Studentengids"],
  "nav.about": ["About", "Over ons"],
  "nav.contact": ["Contact", "Contact"],
  "nav.login": ["Log in", "Inloggen"],
  "nav.register": ["Get started", "Aan de slag"],
  "nav.logout": ["Log out", "Uitloggen"],
  "nav.dashboard": ["Dashboard", "Dashboard"],
  "nav.langLabel": ["Language", "Taal"],
  "footer.tagline": [
    "The job board for international students in the Netherlands. Every vacancy states its English requirement and work-permit support up front — no guessing, no dead ends.",
    "De vacaturebank voor internationale studenten in Nederland. Bij elke vacature staat vooraf welke Engelse taalvaardigheid nodig is en of er hulp is met een werkvergunning — geen gokwerk, geen doodlopende wegen.",
  ],
  "footer.students": ["Students", "Studenten"],
  "footer.company": ["Company", "Bedrijf"],
  "footer.browse": ["Browse jobs", "Vacatures bekijken"],
  "footer.permits": ["Work permits & rules", "Werkvergunningen & regels"],
  "footer.how": ["How it works", "Hoe het werkt"],
  "footer.createAccount": ["Create an account", "Account aanmaken"],
  "footer.about": ["About us", "Over ons"],
  "footer.privacy": ["Privacy policy", "Privacybeleid"],
  "footer.terms": ["Terms of service", "Algemene voorwaarden"],
  "footer.legal": [
    "The Netherlands. Not affiliated with IND or UWV.",
    "Nederland. Niet verbonden aan de IND of het UWV.",
  ],

  // ---------- shared labels ----------
  "label.english_only": ["English only", "Alleen Engels"],
  "label.basic_dutch": ["Basic Dutch welcome", "Basis Nederlands welkom"],
  "label.dutch_required": ["Dutch required", "Nederlands vereist"],
  "label.part_time": ["Part-time (≤16h)", "Bijbaan (≤16 uur)"],
  "label.internship": ["Internship / Stage", "Stage"],
  "label.working_student": ["Working student", "Werkstudent"],
  "label.graduate": ["Graduate / Zoekjaar", "Starter / Zoekjaar"],
  "label.twv_provided": ["TWV permit support", "Hulp met TWV-vergunning"],
  "label.eu_eea": ["EU / EEA direct", "EU / EER direct"],
  "label.freelance_kvk": ["Freelance / KVK", "Freelance / KVK"],
  "label.none": ["No permit support", "Geen hulp met vergunning"],
  "label.on_site": ["On-site", "Op locatie"],
  "label.hybrid": ["Hybrid", "Hybride"],
  "label.remote": ["Remote", "Op afstand"],
  "label.applied": ["Applied", "Gesolliciteerd"],
  "label.under_review": ["Under review", "In behandeling"],
  "label.interview": ["Interview", "Gesprek"],
  "label.accepted": ["Accepted", "Aangenomen"],
  "label.rejected": ["Not selected", "Afgewezen"],
  "job.perHour": ["/hour", "/uur"],
  "job.perWeek": ["h / week", "uur / week"],
  "job.view": ["View & apply →", "Bekijk & solliciteer →"],
  "job.appliedShort": ["Applied ✓", "Gesolliciteerd ✓"],
  "job.save": ["Save job", "Vacature opslaan"],
  "job.saved": ["Saved", "Opgeslagen"],
  "job.freshSponsored": ["Fresh Vacancy. Sponsored", "Fresh Vacancy. Gesponsord"],
  "job.featuredOrganic": ["Featured. Not sponsored", "Uitgelicht. Niet gesponsord"],
  "toast.saved": ["Job saved", "Vacature opgeslagen"],
  "toast.unsaved": ["Removed from saved jobs", "Verwijderd uit opgeslagen vacatures"],
  "toast.saveLogin": ["Log in as a student to save jobs", "Log in als student om vacatures op te slaan"],
  "toast.saveStudentOnly": ["Only student accounts can save jobs", "Alleen studentaccounts kunnen vacatures opslaan"],
  "toast.saveFailed": ["Could not update saved jobs", "Kon opgeslagen vacatures niet bijwerken"],
  "common.cancel": ["Cancel", "Annuleren"],
  "common.saving": ["Saving…", "Opslaan…"],
  "verify.banner": [
    "Verify your email before applying or publishing a vacancy.",
    "Bevestig je e-mailadres voordat je solliciteert of een vacature publiceert.",
  ],
  "verify.resend": ["Resend verification email", "Verificatiemail opnieuw sturen"],
  "verify.sent": ["Verification email sent", "Verificatiemail verstuurd"],
  "verify.failed": ["Could not send the email", "Kon de e-mail niet versturen"],

  // ---------- home ----------
  "home.badge": ["For international students in NL", "Voor internationale studenten in NL"],
  "home.h1a": ["Dutch jobs that", "Nederlandse banen die"],
  "home.h1b": ["hire in English.", "in het Engels werken."],
  "home.lead": [
    "Stop guessing whether a vacancy needs fluent Dutch. DutchVacancy lists only student roles from employers who work in English — with the hours, hourly rate and work-permit support stated up front.",
    "Geen gokwerk meer of een vacature vloeiend Nederlands vereist. DutchVacancy toont alleen studentenbanen bij werkgevers die in het Engels werken — met de uren, het uurloon en de hulp bij werkvergunningen vooraf vermeld.",
  ],
  "home.searchPlaceholder": ["Job title, skill or company", "Functietitel, vaardigheid of bedrijf"],
  "home.allCities": ["All cities", "Alle steden"],
  "home.search": ["Search", "Zoeken"],
  "home.studentCta": ["Create a student account", "Maak een studentaccount"],
  "home.employerCta": ["I'm hiring students", "Ik zoek studenten"],
  "home.statJobs": ["Live student vacancies", "Actuele studentenvacatures"],
  "home.statEmployers": ["Employers on the platform", "Werkgevers op het platform"],
  "home.statEnglish": ["No Dutch required", "Geen Nederlands vereist"],
  "home.statRate": ["Average hourly rate", "Gemiddeld uurloon"],
  "home.featuredTitle": ["Fresh English vacancies", "Nieuwe Engelstalige vacatures"],
  "home.featuredLead": [
    "Roles across the Netherlands with clear language, hours and permit information.",
    "Functies door heel Nederland met duidelijke informatie over taal, uren en vergunningen.",
  ],
  "home.cardEnglish": ["English requirements up front", "Engelse taaleis direct duidelijk"],
  "home.cardEnglishBody": ["Know the working language before you apply", "Ken de werktaal voordat je solliciteert"],
  "home.cardClear": ["Clear employment details", "Duidelijke arbeidsvoorwaarden"],
  "home.cardClearBody": ["Hours, pay range and permit support", "Uren, loonindicatie en vergunningshulp"],
  "home.viewAll": ["View all jobs", "Alle vacatures bekijken"],
  "home.featuredOffline": [
    "Vacancies load as soon as the job service is reachable. Meanwhile, browse the guide below.",
    "Vacatures worden geladen zodra de vacatureservice bereikbaar is. Bekijk intussen de gids hieronder.",
  ],
  "home.pathsTitle": ["Two paths, one platform", "Twee routes, één platform"],
  "home.pathsLead": [
    "Whether you're looking for your first Dutch payslip or your next international hire.",
    "Of je je eerste Nederlandse loonstrook zoekt of je volgende internationale medewerker.",
  ],
  "home.tabStudents": ["For students", "Voor studenten"],
  "home.tabEmployers": ["For employers", "Voor werkgevers"],
  "home.step": ["Step", "Stap"],
  "home.student1t": ["Search without the language wall", "Zoeken zonder taalbarrière"],
  "home.student1b": [
    "Every vacancy states its English requirement, so you only see roles you can actually get.",
    "Bij elke vacature staat de Engelse taaleis, dus je ziet alleen functies die je echt kunt krijgen.",
  ],
  "home.student2t": ["Build one student profile", "Maak één studentprofiel"],
  "home.student2b": [
    "University, study programme, CV link and availability — reused on every application.",
    "Universiteit, studie, cv-link en beschikbaarheid — hergebruikt bij elke sollicitatie.",
  ],
  "home.student3t": ["Track every application", "Volg elke sollicitatie"],
  "home.student3b": [
    "Applied, under review, interview or offer: follow each status from your dashboard.",
    "Gesolliciteerd, in behandeling, gesprek of aanbod: volg elke status in je dashboard.",
  ],
  "home.employer1t": ["Publish a vacancy in minutes", "Plaats een vacature in enkele minuten"],
  "home.employer1b": [
    "State the English level, hours and permit support — students self-select correctly.",
    "Vermeld het Engelse niveau, de uren en de vergunningshulp — studenten selecteren zichzelf goed.",
  ],
  "home.employer2t": ["Review real applicants", "Beoordeel echte kandidaten"],
  "home.employer2b": [
    "Motivation letter, university and CV link for every candidate in one pipeline.",
    "Motivatie, universiteit en cv-link van elke kandidaat in één overzicht.",
  ],
  "home.employer3t": ["Hire international talent", "Neem internationaal talent aan"],
  "home.employer3b": [
    "Reach international students and English-speaking candidates across the Netherlands.",
    "Bereik internationale studenten en Engelstalige kandidaten in heel Nederland.",
  ],
  "home.citiesTitle": ["Explore the student hubs", "Ontdek de studentensteden"],
  "home.citiesRoles": ["+ roles", "+ functies"],
  "home.legalTitle": ["Dutch work rules, in plain English", "Nederlandse arbeidsregels, simpel uitgelegd"],
  "home.legalLead": [
    "The four things every international student needs to know before signing a contract in the Netherlands.",
    "De vier dingen die elke internationale student moet weten voordat je in Nederland een contract ondertekent.",
  ],
  "home.legalCta": ["Read the full student guide", "Lees de volledige studentengids"],
  "home.legal1t": ["16 hours per week during term", "16 uur per week tijdens het studiejaar"],
  "home.legal1b": [
    "Non-EU/EEA students may work up to 16 hours a week during the academic year — or full-time across June, July and August, but not both in the same year.",
    "Studenten van buiten de EU/EER mogen tijdens het studiejaar maximaal 16 uur per week werken — of voltijd in juni, juli en augustus, maar niet beide in hetzelfde jaar.",
  ],
  "home.legal2t": ["TWV work permit", "TWV-werkvergunning"],
  "home.legal2b": [
    "Your employer applies for the TWV (work permit) at UWV on your behalf. It is free for them, and vacancies here flag when it's offered.",
    "Je werkgever vraagt de TWV (werkvergunning) voor je aan bij het UWV. Dat is gratis, en bij vacatures hier staat wanneer dit wordt aangeboden.",
  ],
  "home.legal3t": ["BSN and Dutch bank account", "BSN en Nederlandse bankrekening"],
  "home.legal3b": [
    "Register at your municipality to get a BSN, then open a Dutch IBAN. Most employers cannot pay you without both.",
    "Schrijf je in bij de gemeente voor een BSN en open daarna een Nederlands IBAN. Zonder beide kunnen werkgevers je meestal niet betalen.",
  ],
  "home.legal4t": ["Zoekjaar (orientation year)", "Zoekjaar (oriëntatiejaar)"],
  "home.legal4b": [
    "Graduated from a Dutch university? The orientation-year permit gives you 12 months to work full-time without a TWV.",
    "Afgestudeerd aan een Nederlandse universiteit? Met het zoekjaar mag je 12 maanden voltijd werken zonder TWV.",
  ],
  "home.ctaTitle": ["Ready to launch your Dutch career?", "Klaar om je Nederlandse carrière te starten?"],
  "home.ctaLead": [
    "Create a free account and apply to your first English-speaking vacancy today.",
    "Maak een gratis account en solliciteer vandaag op je eerste Engelstalige vacature.",
  ],
  "home.ctaFind": ["Find your job", "Vind je baan"],
  "home.ctaPost": ["Post a vacancy", "Plaats een vacature"],

  // ---------- jobs ----------
  "jobs.title": ["English-speaking student jobs", "Engelstalige studentenbanen"],
  "jobs.lead": [
    "Filter by city, English requirement and work-permit support.",
    "Filter op stad, Engelse taaleis en hulp bij werkvergunningen.",
  ],
  "jobs.searchPlaceholder": [
    "Search job title, company or keyword",
    "Zoek op functietitel, bedrijf of trefwoord",
  ],
  "jobs.filters": ["Filters", "Filters"],
  "jobs.clearAll": ["Clear all", "Alles wissen"],
  "jobs.filterCity": ["City", "Stad"],
  "jobs.filterEnglish": ["English requirement", "Engelse taaleis"],
  "jobs.filterType": ["Job type", "Soort baan"],
  "jobs.filterPermit": ["Work permit support", "Hulp bij werkvergunning"],
  "jobs.filterWork": ["Work arrangement", "Werkvorm"],
  "jobs.filterRate": ["Hourly rate", "Uurloon"],
  "jobs.rate15": ["€ 15+ / hour", "€ 15+ / uur"],
  "jobs.rate18": ["€ 18+ / hour", "€ 18+ / uur"],
  "jobs.rate22": ["€ 22+ / hour", "€ 22+ / uur"],
  "jobs.loading": ["Loading vacancies…", "Vacatures laden…"],
  "jobs.offline": ["Job data is temporarily unavailable.", "Vacaturegegevens zijn tijdelijk niet beschikbaar."],
  "jobs.found": ["vacancies found", "vacatures gevonden"],
  "jobs.foundOne": ["vacancy found", "vacature gevonden"],
  "jobs.emptyTitle": ["No vacancies match these filters", "Geen vacatures met deze filters"],
  "jobs.emptyBody": [
    "Try clearing a filter or widening your city selection.",
    "Wis een filter of kies meer steden.",
  ],

  // ---------- job detail ----------
  "detail.back": ["All vacancies", "Alle vacatures"],
  "detail.unavailableTitle": ["Vacancy unavailable", "Vacature niet beschikbaar"],
  "detail.unavailableBody": [
    "This vacancy may have been closed or the job service is unreachable right now.",
    "Deze vacature is mogelijk gesloten of de vacatureservice is nu niet bereikbaar.",
  ],
  "detail.backToJobs": ["Back to all jobs", "Terug naar alle vacatures"],
  "detail.about": ["About this role", "Over deze functie"],
  "detail.requirements": ["What you bring", "Wat je meebrengt"],
  "detail.perks": ["What you get", "Wat je krijgt"],
  "detail.aboutCompany": ["About", "Over"],
  "detail.industry": ["Industry", "Branche"],
  "detail.base": ["Base", "Vestiging"],
  "detail.website": ["Website", "Website"],
  "detail.visit": ["Visit", "Bezoeken"],
  "detail.gross": ["gross per hour", "bruto per uur"],
  "detail.hoursWeek": ["hours per week", "uur per week"],
  "detail.applicants": ["applicants", "kandidaten"],
  "detail.applicant": ["applicant", "kandidaat"],
  "detail.alreadyApplied": ["You already applied to this role", "Je hebt al op deze functie gesolliciteerd"],
  "detail.applyNow": ["Apply now", "Solliciteer nu"],
  "detail.rightsTitle": ["Know your rights", "Ken je rechten"],
  "detail.rightsBody": [
    "Non-EU students may work 16 hours a week during term, or full-time in June–August. Your employer arranges the TWV permit — never pay for one yourself.",
    "Studenten van buiten de EU mogen tijdens het studiejaar 16 uur per week werken, of voltijd in juni–augustus. Je werkgever regelt de TWV-vergunning — betaal er nooit zelf voor.",
  ],
  "detail.rightsLink": ["Read the student guide", "Lees de studentengids"],
  "detail.applyLogin": ["Log in as a student to apply", "Log in als student om te solliciteren"],
  "detail.applyStudentOnly": [
    "Only student accounts can apply to vacancies",
    "Alleen studentaccounts kunnen op vacatures solliciteren",
  ],
  "detail.applyTitle": ["Apply", "Solliciteren"],
  "detail.applyDesc": [
    "sees your name, university, CV link and motivation.",
    "ziet je naam, universiteit, cv-link en motivatie.",
  ],
  "detail.motivation": ["Why are you a good fit? *", "Waarom ben jij geschikt? *"],
  "detail.motivationPlaceholder": [
    "Tell the employer about your studies, availability and why this role fits you (min. 10 characters).",
    "Vertel de werkgever over je studie, beschikbaarheid en waarom deze functie bij je past (min. 10 tekens).",
  ],
  "detail.cvLabel": ["CV (optional)", "Cv (optioneel)"],
  "cv.upload": ["Upload CV", "Cv uploaden"],
  "cv.replace": ["Replace CV", "Cv vervangen"],
  "cv.remove": ["Remove", "Verwijderen"],
  "cv.view": ["View", "Bekijken"],
  "cv.none": ["No CV uploaded yet", "Nog geen cv geüpload"],
  "cv.hint": ["PDF, DOC or DOCX · max 5 MB", "PDF, DOC of DOCX · max 5 MB"],
  "cv.uploading": ["Uploading…", "Uploaden…"],
  "cv.uploaded": ["CV uploaded", "Cv geüpload"],
  "cv.removed": ["CV removed", "Cv verwijderd"],
  "cv.failed": ["Could not upload that file", "Kon dit bestand niet uploaden"],
  "cv.tooBig": ["That file is larger than 5 MB", "Dit bestand is groter dan 5 MB"],
  "cv.wrongType": ["Upload a PDF, DOC or DOCX file", "Upload een PDF-, DOC- of DOCX-bestand"],
  "cv.fromProfile": ["Using the CV from your profile", "Cv uit je profiel wordt gebruikt"],
  "cv.preview": ["Preview", "Voorbeeld"],
  "cv.hidePreview": ["Hide preview", "Voorbeeld verbergen"],
  "cv.openTab": ["Open in new tab", "Openen in nieuw tabblad"],
  "cv.previewHint": [
    "Scroll inside the preview to read the rest, or open it in a new tab to download.",
    "Scroll in het voorbeeld om verder te lezen, of open het in een nieuw tabblad om te downloaden.",
  ],
  "cv.previewUnsupported": [
    "This browser can't display PDFs inline.",
    "Deze browser kan PDF's niet direct weergeven.",
  ],
  "cv.applyHint": [
    "Upload a different CV for this application, or leave it to send the one on your profile.",
    "Upload een ander cv voor deze sollicitatie, of laat het staan om het cv uit je profiel te versturen.",
  ],
  "detail.send": ["Send application", "Sollicitatie versturen"],
  "detail.sending": ["Sending…", "Versturen…"],
  "detail.sent": [
    "Application sent — track it in your dashboard",
    "Sollicitatie verstuurd — volg hem in je dashboard",
  ],
  "detail.sendFailed": ["Could not send your application", "Kon je sollicitatie niet versturen"],

  // ---------- auth ----------
  "login.title": ["Log in", "Inloggen"],
  "login.lead": [
    "Students and employers use the same login.",
    "Studenten en werkgevers gebruiken dezelfde login.",
  ],
  "login.email": ["Email", "E-mailadres"],
  "login.password": ["Password", "Wachtwoord"],
  "login.submit": ["Log in", "Inloggen"],
  "login.pending": ["Logging in…", "Inloggen…"],
  "login.failed": ["Login failed", "Inloggen mislukt"],
  "login.welcome": ["Welcome back", "Welkom terug"],
  "login.forgot": ["Forgot password?", "Wachtwoord vergeten?"],
  "login.demo": ["Demo accounts", "Demo-accounts"],
  "login.demoStudent": ["Student demo", "Studentdemo"],
  "login.demoEmployer": ["Employer demo", "Werkgeversdemo"],
  "login.noAccount": ["No account yet?", "Nog geen account?"],
  "login.createFree": ["Create one free", "Maak er gratis een aan"],
  "login.sideTitle": ["Welcome back to DutchVacancy", "Welkom terug bij DutchVacancy"],
  "login.sideBody": [
    "Search English-friendly jobs, manage applications and keep your profile in one place.",
    "Zoek Engelstalige vacatures, beheer sollicitaties en houd je profiel op één plek bij.",
  ],
  "login.quote": [
    "“I moved to Amsterdam without a word of Dutch. Two weeks later I had a 16-hour working-student contract in an English-speaking engineering team.”",
    "“Ik verhuisde naar Amsterdam zonder een woord Nederlands. Twee weken later had ik een werkstudentcontract van 16 uur in een Engelstalig engineeringteam.”",
  ],
  "login.quoteBy": ["— Aarav, MSc student, UvA", "— Aarav, masterstudent, UvA"],
  "register.title": ["Create your free account", "Maak je gratis account"],
  "register.roleStudent": ["I'm a student", "Ik ben student"],
  "register.roleEmployer": ["I'm an employer", "Ik ben werkgever"],
  "register.name": ["Full name", "Volledige naam"],
  "register.password": ["Password (min. 8 characters)", "Wachtwoord (min. 8 tekens)"],
  "register.company": ["Company name", "Bedrijfsnaam"],
  "register.companyCity": ["Company city", "Vestigingsplaats"],
  "register.submitStudent": ["Create student account", "Studentaccount aanmaken"],
  "register.submitEmployer": ["Create employer account", "Werkgeversaccount aanmaken"],
  "register.pending": ["Creating…", "Aanmaken…"],
  "register.created": ["Account created — welcome to DutchVacancy", "Account aangemaakt — welkom bij DutchVacancy"],
  "register.createdVerify": [
    "Account created. Check your inbox to verify your email.",
    "Account aangemaakt. Controleer je inbox om je e-mailadres te bevestigen.",
  ],
  "register.failed": ["Could not create your account", "Kon je account niet aanmaken"],
  "register.already": ["Already registered?", "Al geregistreerd?"],
  "register.sideTitle": [
    "Working in the Netherlands, step by step",
    "Werken in Nederland, stap voor stap",
  ],
  "register.side1t": ["16 hours per week", "16 uur per week"],
  "register.side1b": [
    "Non-EU students work 16h/week during term, or full-time in June–August.",
    "Studenten van buiten de EU werken 16 uur per week tijdens het studiejaar, of voltijd in juni–augustus.",
  ],
  "register.side2t": ["TWV work permit", "TWV-werkvergunning"],
  "register.side2b": [
    "Your employer arranges it at UWV — it costs you nothing.",
    "Je werkgever regelt dit bij het UWV — het kost jou niets.",
  ],
  "register.side3t": ["BSN + Dutch IBAN", "BSN + Nederlands IBAN"],
  "register.side3b": [
    "Register at the gemeente, then open a bank account to get paid.",
    "Schrijf je in bij de gemeente en open daarna een bankrekening om betaald te worden.",
  ],
  "register.side4t": ["Zoekjaar", "Zoekjaar"],
  "register.side4b": [
    "Graduates get a 12-month orientation year to work without a permit.",
    "Afgestudeerden krijgen een zoekjaar van 12 maanden om zonder vergunning te werken.",
  ],

  // ---------- student dashboard ----------
  "sd.eyebrow": ["Student dashboard", "Studentdashboard"],
  "sd.hi": ["Hi", "Hoi"],
  "sd.statApplications": ["Applications", "Sollicitaties"],
  "sd.statSaved": ["Saved jobs", "Opgeslagen"],
  "sd.statInterviews": ["Interviews", "Gesprekken"],
  "sd.tabApplications": ["Applications", "Sollicitaties"],
  "sd.tabSaved": ["Saved jobs", "Opgeslagen vacatures"],
  "sd.tabProfile": ["Profile", "Profiel"],
  "sd.emptyAppsTitle": ["No applications yet", "Nog geen sollicitaties"],
  "sd.emptyAppsBody": [
    "Find an English-speaking role and apply in two clicks.",
    "Vind een Engelstalige functie en solliciteer in twee klikken.",
  ],
  "sd.browse": ["Browse jobs", "Vacatures bekijken"],
  "sd.emptySavedTitle": ["Nothing saved yet", "Nog niets opgeslagen"],
  "sd.emptySavedBody": [
    "Tap the bookmark on any vacancy to keep it here.",
    "Tik op de bladwijzer bij een vacature om hem hier te bewaren.",
  ],
  "sd.university": ["University", "Universiteit"],
  "sd.study": ["Study programme", "Studie"],
  "sd.city": ["Preferred city", "Voorkeursstad"],
  "sd.cityAny": ["All cities", "Alle steden"],
  "sd.englishLevel": ["English level", "Engels niveau"],
  "sd.phone": ["Phone", "Telefoon"],
  "sd.cv": ["CV", "Cv"],
  "sd.bio": ["Short introduction", "Korte introductie"],
  "sd.saveProfile": ["Save profile", "Profiel opslaan"],
  "sd.profileSaved": ["Profile updated", "Profiel bijgewerkt"],
  "sd.profileFailed": ["Could not save your profile", "Kon je profiel niet opslaan"],

  // ---------- employer dashboard ----------
  "ed.eyebrow": ["Employer dashboard", "Werkgeversdashboard"],
  "ed.company": ["Your company", "Jouw bedrijf"],
  "ed.post": ["Post a vacancy", "Vacature plaatsen"],
  "ed.statPublished": ["Published", "Gepubliceerd"],
  "ed.statDrafts": ["Drafts", "Concepten"],
  "ed.statApplicants": ["Applicants", "Kandidaten"],
  "ed.tabVacancies": ["Vacancies", "Vacatures"],
  "ed.tabApplicants": ["Applicants", "Kandidaten"],
  "ed.emptyVacTitle": ["No vacancies yet", "Nog geen vacatures"],
  "ed.emptyVacBody": [
    "Publish your first English-speaking student role.",
    "Plaats je eerste Engelstalige studentenfunctie.",
  ],
  "ed.draft": ["Draft", "Concept"],
  "ed.publish": ["Publish", "Publiceren"],
  "ed.unpublish": ["Unpublish", "Depubliceren"],
  "ed.published": ["Vacancy published", "Vacature gepubliceerd"],
  "ed.unpublished": ["Vacancy unpublished", "Vacature gedepubliceerd"],
  "ed.updateFailed": ["Could not update the vacancy", "Kon de vacature niet bijwerken"],
  "ed.deleted": ["Vacancy deleted", "Vacature verwijderd"],
  "ed.deleteFailed": ["Could not delete the vacancy", "Kon de vacature niet verwijderen"],
  "ed.statusUpdated": ["Applicant status updated", "Status kandidaat bijgewerkt"],
  "ed.statusFailed": ["Could not update the applicant", "Kon de kandidaat niet bijwerken"],
  "ed.fresh": ["Fresh. €14.95 excl. VAT", "Fresh. €14,95 excl. btw"],
  "ed.freshActive": ["Fresh active", "Fresh actief"],
  "ed.freshFailed": ["Could not start Fresh Vacancy checkout", "Kon de Fresh Vacancy-betaling niet starten"],
  "ed.filterAll": ["All", "Alle"],
  "ed.emptyAppsTitle": ["No applicants in this view", "Geen kandidaten in deze weergave"],
  "ed.emptyAppsBody": [
    "Applications appear here as students apply.",
    "Sollicitaties verschijnen hier zodra studenten solliciteren.",
  ],
  "ed.openCv": ["Open CV", "Cv openen"],
  "ed.editAria": ["Edit vacancy", "Vacature bewerken"],
  "ed.deleteAria": ["Delete vacancy", "Vacature verwijderen"],

  // ---------- vacancy form ----------
  "vf.editTitle": ["Edit vacancy", "Vacature bewerken"],
  "vf.newTitle": ["Post a new vacancy", "Nieuwe vacature plaatsen"],
  "vf.lead": [
    "Be explicit about the English requirement and permit support — it's why students trust this board.",
    "Wees duidelijk over de Engelse taaleis en de vergunningshulp — daarom vertrouwen studenten deze vacaturebank.",
  ],
  "vf.title": ["Job title *", "Functietitel *"],
  "vf.city": ["City", "Stad"],
  "vf.category": ["Category", "Categorie"],
  "vf.jobType": ["Job type", "Soort baan"],
  "vf.english": ["English requirement", "Engelse taaleis"],
  "vf.permit": ["Work permit support", "Hulp bij werkvergunning"],
  "vf.workMode": ["Work arrangement", "Werkvorm"],
  "vf.hours": ["Hours per week", "Uren per week"],
  "vf.rateFrom": ["Hourly rate from (€)", "Uurloon van (€)"],
  "vf.rateTo": ["Hourly rate to (€)", "Uurloon tot (€)"],
  "vf.description": ["Description", "Beschrijving"],
  "vf.requirements": ["Requirements (one per line)", "Vereisten (één per regel)"],
  "vf.perks": ["Perks (one per line)", "Extra's (één per regel)"],
  "vf.publishNow": [
    "Publish immediately (uncheck to keep as draft)",
    "Direct publiceren (vink uit om als concept te bewaren)",
  ],
  "vf.create": ["Create vacancy", "Vacature aanmaken"],
  "vf.saveChanges": ["Save changes", "Wijzigingen opslaan"],
  "vf.created": ["Vacancy created", "Vacature aangemaakt"],
  "vf.updated": ["Vacancy updated", "Vacature bijgewerkt"],
  "vf.failed": ["Could not save the vacancy", "Kon de vacature niet opslaan"],

  // ---------- 404 ----------
  "nf.title": ["Page not found", "Pagina niet gevonden"],
  "nf.body": [
    "That page doesn't exist. Try the job board instead.",
    "Deze pagina bestaat niet. Bekijk in plaats daarvan de vacaturebank.",
  ],

  // ---------- about ----------
  "about.eyebrow": ["About us", "Over ons"],
  "about.title": [
    "English-friendly jobs, without the guesswork",
    "Engelstalige vacatures, zonder giswerk",
  ],
  "about.intro": [
    "DutchVacancy helps international students and English-speaking candidates find roles in the Netherlands with clear requirements.",
    "DutchVacancy helpt internationale studenten en Engelstalige kandidaten functies in Nederland te vinden met duidelijke vereisten.",
  ],
  "about.s1t": ["Why we exist", "Waarom wij bestaan"],
  "about.s1b": [
    [
      "Finding work in the Netherlands can be unnecessarily unclear when a vacancy does not state its working language, hours or permit support.",
      "We only list vacancies where that information is explicit. Every role on DutchVacancy carries its English requirement, its weekly hours, its hourly range and its permit support, stated by the employer at publication.",
    ],
    [
      "Werk vinden in Nederland is onnodig onduidelijk wanneer een vacature niets zegt over de werktaal, uren of vergunningshulp.",
      "Wij plaatsen alleen vacatures waarin die informatie expliciet staat. Bij elke functie op DutchVacancy staan de Engelse taaleis, de weekuren, het uurloon en de vergunningshulp, opgegeven door de werkgever bij publicatie.",
    ],
  ],
  "about.s2t": ["What we do for employers", "Wat wij voor werkgevers doen"],
  "about.s2b": [
    [
      "Employers can publish the information international candidates need and manage applications from one dashboard.",
    ],
    [
      "Werkgevers kunnen de informatie publiceren die internationale kandidaten nodig hebben en sollicitaties vanuit één dashboard beheren.",
    ],
  ],
  "about.s3t": ["What we are not", "Wat wij niet zijn"],
  "about.s3b": [
    [
      "We are not a recruitment agency and we never charge students. We are not affiliated with the IND, UWV or any Dutch government body — the guidance on this site is written in plain English to help you ask the right questions, not to replace official advice.",
    ],
    [
      "Wij zijn geen uitzendbureau en studenten betalen nooit. Wij zijn niet verbonden aan de IND, het UWV of een andere Nederlandse overheidsinstantie — de uitleg op deze site is eenvoudig geschreven om je de juiste vragen te laten stellen, niet als vervanging van officieel advies.",
    ],
  ],

  // ---------- how it works ----------
  "how.eyebrow": ["How it works", "Hoe het werkt"],
  "how.title": [
    "From signing up to your first Dutch payslip",
    "Van aanmelden tot je eerste Nederlandse loonstrook",
  ],
  "how.intro": [
    "The same platform serves two audiences. Here is exactly what happens on each side.",
    "Hetzelfde platform dient twee doelgroepen. Dit gebeurt er aan beide kanten.",
  ],
  "how.studentsTitle": ["For international students", "Voor internationale studenten"],
  "how.studentSteps": [
    [
      "Create a free student account. Name, email and a password — that's it.",
      "Complete your profile. University, study programme, city, English level and a CV link. It is reused on every application.",
      "Filter honestly. Pick “English only” and, if you are non-EU, “TWV permit support”. What's left is genuinely reachable.",
      "Apply with a motivation note. The employer sees your name, university, CV link and your note.",
      "Track the outcome. Applied → under review → interview → offer, all in your dashboard.",
    ],
    [
      "Maak een gratis studentaccount. Naam, e-mailadres en wachtwoord — dat is alles.",
      "Vul je profiel in. Universiteit, studie, stad, Engels niveau en een cv-link. Dit wordt bij elke sollicitatie hergebruikt.",
      "Filter eerlijk. Kies “Alleen Engels” en, als je van buiten de EU komt, “Hulp met TWV-vergunning”. Wat overblijft is echt haalbaar.",
      "Solliciteer met een motivatie. De werkgever ziet je naam, universiteit, cv-link en je motivatie.",
      "Volg het resultaat. Gesolliciteerd → in behandeling → gesprek → aanbod, allemaal in je dashboard.",
    ],
  ],
  "how.employersTitle": ["For Dutch employers", "Voor Nederlandse werkgevers"],
  "how.employerSteps": [
    [
      "Register an employer account with your company name and city.",
      "Publish a vacancy — title, city, job type, hours, hourly range, English requirement and permit support.",
      "Keep drafts private. Uncheck “publish” while you're still writing; nothing is visible until you're ready.",
      "Review applicants in one pipeline, open CVs, and move candidates through the stages.",
      "Edit or unpublish anytime. A filled role should stop attracting applications.",
    ],
    [
      "Registreer een werkgeversaccount met je bedrijfsnaam en vestigingsplaats.",
      "Plaats een vacature — titel, stad, soort baan, uren, uurloon, Engelse taaleis en vergunningshulp.",
      "Houd concepten privé. Vink “publiceren” uit terwijl je nog schrijft; niets is zichtbaar tot jij klaar bent.",
      "Beoordeel kandidaten in één overzicht, open cv's en zet kandidaten door naar de volgende fase.",
      "Bewerk of depubliceer wanneer je wilt. Een gevulde functie hoeft geen sollicitaties meer te trekken.",
    ],
  ],
  "how.costTitle": ["What it costs", "Wat het kost"],
  "how.costBody": [
    [
      "Free for students, always. Employer listings are free during our launch period in the Netherlands.",
    ],
    [
      "Altijd gratis voor studenten. Vacatures van werkgevers zijn gratis tijdens onze introductieperiode in Nederland.",
    ],
  ],

  // ---------- guide ----------
  "guide.eyebrow": ["Student guide", "Studentengids"],
  "guide.title": [
    "Working in the Netherlands as an international student",
    "Werken in Nederland als internationale student",
  ],
  "guide.intro": [
    "Permits, hours, BSN and taxes — the essentials in plain English. Always confirm details with the IND, UWV or your university's international office.",
    "Vergunningen, uren, BSN en belasting — de basis, eenvoudig uitgelegd. Controleer details altijd bij de IND, het UWV of het international office van je universiteit.",
  ],
  "guide.s1t": ["How many hours may I work?", "Hoeveel uur mag ik werken?"],
  "guide.s1b": [
    [
      "If you are from outside the EU/EEA or Switzerland, you may either work a maximum of 16 hours per week all year, or work full-time during June, July and August only. You must choose one option — you cannot combine them in the same calendar year.",
      "EU/EEA and Swiss students have no hour limit and need no work permit, though a very high income can affect student finance eligibility.",
    ],
    [
      "Kom je van buiten de EU/EER of Zwitserland, dan mag je óf het hele jaar maximaal 16 uur per week werken, óf alleen in juni, juli en augustus voltijd werken. Je moet kiezen — je mag ze niet combineren in hetzelfde kalenderjaar.",
      "Studenten uit de EU/EER en Zwitserland hebben geen urenlimiet en geen werkvergunning nodig, al kan een heel hoog inkomen gevolgen hebben voor studiefinanciering.",
    ],
  ],
  "guide.s2t": ["The TWV work permit", "De TWV-werkvergunning"],
  "guide.s2b": [
    [
      "Non-EU students need a TWV (tewerkstellingsvergunning). Your employer applies for it at UWV — you cannot apply yourself, and it should never cost you money. Processing usually takes a few weeks, so start early. Vacancies on DutchVacancy are labelled when the employer offers TWV support.",
    ],
    [
      "Studenten van buiten de EU hebben een TWV (tewerkstellingsvergunning) nodig. Je werkgever vraagt deze aan bij het UWV — jij kunt dit niet zelf doen en het mag jou nooit geld kosten. De behandeling duurt meestal enkele weken, dus begin op tijd. Bij vacatures op DutchVacancy staat het vermeld als de werkgever hulp met de TWV biedt.",
    ],
  ],
  "guide.s3t": ["BSN and a Dutch bank account", "BSN en een Nederlandse bankrekening"],
  "guide.s3b": [
    [
      "Register at your gemeente (municipality) after arrival to receive a BSN (citizen service number). Bring your passport, proof of enrolment and your rental contract. With a BSN you can open a Dutch IBAN, which most employers require for payroll.",
    ],
    [
      "Schrijf je na aankomst in bij je gemeente om een BSN (burgerservicenummer) te krijgen. Neem je paspoort, bewijs van inschrijving en je huurcontract mee. Met een BSN kun je een Nederlands IBAN openen, dat de meeste werkgevers nodig hebben voor de loonadministratie.",
    ],
  ],
  "guide.s4t": ["Health insurance", "Zorgverzekering"],
  "guide.s4b": [
    [
      "Once you start working in the Netherlands you usually become liable for Dutch basic health insurance (basisverzekering), even as a student. Check this before your first shift — fines for being uninsured are avoidable.",
    ],
    [
      "Zodra je in Nederland gaat werken, ben je meestal verplicht een Nederlandse basisverzekering te nemen, ook als student. Regel dit vóór je eerste dienst — boetes voor onverzekerd zijn, zijn goed te voorkomen.",
    ],
  ],
  "guide.s5t": ["Pay, holiday allowance and payslips", "Loon, vakantiegeld en loonstroken"],
  "guide.s5b": [
    [
      "You are entitled to at least the statutory minimum wage for your age, 8% holiday allowance, and a written payslip for every period. Student jobs on this board typically pay € 14–24 per hour gross. Keep every payslip: you will need them for tax returns and for extending your residence permit.",
    ],
    [
      "Je hebt recht op minimaal het wettelijk minimumloon voor jouw leeftijd, 8% vakantiegeld en een schriftelijke loonstrook per periode. Studentenbanen op deze vacaturebank betalen doorgaans € 14–24 bruto per uur. Bewaar elke loonstrook: je hebt ze nodig voor je belastingaangifte en voor verlenging van je verblijfsvergunning.",
    ],
  ],
  "guide.s6t": ["The orientation year (zoekjaar)", "Het zoekjaar (oriëntatiejaar)"],
  "guide.s6b": [
    [
      "Graduates of a Dutch higher-education programme can apply for the orientation-year permit within three years of graduating. It gives you 12 months of free access to the labour market — no TWV required, full-time allowed. Roles tagged “Graduate / Zoekjaar” here are aimed at exactly this group.",
    ],
    [
      "Wie een Nederlandse hbo- of universitaire opleiding heeft afgerond, kan binnen drie jaar na afstuderen een zoekjaar aanvragen. Je krijgt dan 12 maanden vrije toegang tot de arbeidsmarkt — geen TWV nodig, voltijd toegestaan. Functies met het label “Starter / Zoekjaar” zijn precies voor deze groep bedoeld.",
    ],
  ],

  // ---------- contact ----------
  "contact.eyebrow": ["Contact", "Contact"],
  "contact.title": ["Talk to the DutchVacancy team", "Praat met het DutchVacancy-team"],
  "contact.intro": [
    "Questions about a vacancy, your account, or hiring international students? Send us a message.",
    "Vragen over een vacature, je account of het aannemen van internationale studenten? Stuur ons een bericht.",
  ],
  "contact.name": ["Your name", "Je naam"],
  "contact.email": ["Email", "E-mailadres"],
  "contact.subject": ["Subject", "Onderwerp"],
  "contact.message": ["Message", "Bericht"],
  "contact.send": ["Send message", "Bericht versturen"],
  "contact.sending": ["Sending…", "Versturen…"],
  "contact.sent": [
    "Thanks — we'll reply within two working days",
    "Bedankt — we antwoorden binnen twee werkdagen",
  ],
  "contact.failed": ["Could not send your message", "Kon je bericht niet versturen"],
  "contact.emailLabel": ["Email", "E-mail"],
  "contact.office": ["Office", "Kantoor"],
  "contact.answerNote": [
    "We answer in English and Dutch, usually within two working days.",
    "We antwoorden in het Engels en Nederlands, meestal binnen twee werkdagen.",
  ],

  // ---------- privacy ----------
  "privacy.eyebrow": ["Privacy policy", "Privacybeleid"],
  "privacy.title": ["How DutchVacancy handles your data", "Hoe DutchVacancy met je gegevens omgaat"],
  "privacy.intro": [
    "Last updated: 1 January 2026. We process personal data under the EU GDPR and Dutch implementation act (UAVG).",
    "Laatst bijgewerkt: 1 januari 2026. Wij verwerken persoonsgegevens volgens de AVG en de Nederlandse Uitvoeringswet (UAVG).",
  ],
  "privacy.s1t": ["What we collect", "Wat wij verzamelen"],
  "privacy.s1b": [
    [
      "Students: name, email address, password (hashed), university, study programme, city, English level, phone number, CV link, introduction text, saved jobs and applications.",
      "Employers: name, email address, password (hashed), company name, city, industry, website and the vacancies you publish.",
      "Everyone: a session cookie that keeps you logged in, and any message you send through the contact form.",
    ],
    [
      "Studenten: naam, e-mailadres, wachtwoord (gehasht), universiteit, studie, stad, Engels niveau, telefoonnummer, cv-link, introductietekst, opgeslagen vacatures en sollicitaties.",
      "Werkgevers: naam, e-mailadres, wachtwoord (gehasht), bedrijfsnaam, plaats, branche, website en de vacatures die je plaatst.",
      "Iedereen: een sessiecookie waarmee je ingelogd blijft, en elk bericht dat je via het contactformulier verstuurt.",
    ],
  ],
  "privacy.s2t": ["Why we process it", "Waarom wij dit verwerken"],
  "privacy.s2b": [
    [
      "To operate your account, show you relevant vacancies, deliver your applications to the employer you chose, and answer your support messages. When you apply to a vacancy, the employer receives your name, email, university, CV link and motivation text — that is the purpose of applying.",
    ],
    [
      "Om je account te laten werken, relevante vacatures te tonen, je sollicitaties te bezorgen bij de werkgever die jij koos en je vragen te beantwoorden. Als je op een vacature solliciteert, ontvangt de werkgever je naam, e-mailadres, universiteit, cv-link en motivatie — dat is het doel van solliciteren.",
    ],
  ],
  "privacy.s3t": ["Cookies", "Cookies"],
  "privacy.s3b": [
    [
      "We set one strictly necessary, httpOnly session cookie. We do not use advertising or cross-site tracking cookies.",
    ],
    [
      "Wij plaatsen één strikt noodzakelijke httpOnly-sessiecookie. Wij gebruiken geen advertentie- of trackingcookies.",
    ],
  ],
  "privacy.s4t": ["Retention", "Bewaartermijn"],
  "privacy.s4b": [
    [
      "Account and application data is kept while your account exists. You can delete your account or request deletion at any time. Employers may need to retain limited records where Dutch law requires it.",
    ],
    [
      "Account- en sollicitatiegegevens bewaren wij zolang je account bestaat. Je kunt je account verwijderen of altijd om verwijdering vragen. Werkgevers moeten mogelijk beperkte gegevens bewaren als de Nederlandse wet dat vereist.",
    ],
  ],
  "privacy.s5t": ["Your rights", "Jouw rechten"],
  "privacy.s5b": [
    [
      "You have the right to access, correct, export, restrict or delete your data, and to object to processing. Contact us through the contact form and we will respond within one month. You may also complain to the Autoriteit Persoonsgegevens, the Dutch data protection authority.",
    ],
    [
      "Je hebt het recht je gegevens in te zien, te corrigeren, te exporteren, te beperken of te laten verwijderen, en om bezwaar te maken tegen de verwerking. Neem contact op via het contactformulier en wij reageren binnen een maand. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.",
    ],
  ],

  // ---------- terms ----------
  "terms.eyebrow": ["Terms of service", "Algemene voorwaarden"],
  "terms.title": ["The rules for using DutchVacancy", "De regels voor het gebruik van DutchVacancy"],
  "terms.intro": [
    "Last updated: 1 January 2026. By creating an account you agree to these terms.",
    "Laatst bijgewerkt: 1 januari 2026. Door een account aan te maken ga je akkoord met deze voorwaarden.",
  ],
  "terms.s1t": ["Using the platform", "Gebruik van het platform"],
  "terms.s1b": [
    [
      "You need an account to apply to vacancies or publish them. Keep your login details to yourself, give accurate information, and use one account per person or company.",
    ],
    [
      "Je hebt een account nodig om op vacatures te solliciteren of ze te plaatsen. Houd je inloggegevens voor jezelf, geef juiste informatie en gebruik één account per persoon of bedrijf.",
    ],
  ],
  "terms.s2t": ["Student obligations", "Verplichtingen van studenten"],
  "terms.s2b": [
    [
      "You are responsible for checking that a role fits your residence permit and your permitted working hours. Apply only to roles you genuinely intend to take, and never misrepresent your studies, permit status or work experience.",
    ],
    [
      "Je bent zelf verantwoordelijk om te controleren of een functie past bij je verblijfsvergunning en je toegestane werkuren. Solliciteer alleen op functies die je echt wilt, en geef nooit een onjuist beeld van je studie, vergunningstatus of werkervaring.",
    ],
  ],
  "terms.s3t": ["Employer obligations", "Verplichtingen van werkgevers"],
  "terms.s3b": [
    [
      "Vacancies must be real, must state the English requirement, hours and hourly rate accurately, and must comply with Dutch employment law — including minimum wage, holiday allowance and equal-treatment rules. You may not charge students any fee, and you may not use applicant data for anything other than the role they applied to.",
    ],
    [
      "Vacatures moeten echt zijn, de Engelse taaleis, uren en het uurloon correct vermelden en voldoen aan het Nederlandse arbeidsrecht — inclusief minimumloon, vakantiegeld en gelijke behandeling. Je mag studenten geen kosten in rekening brengen en kandidaatgegevens alleen gebruiken voor de functie waarop is gesolliciteerd.",
    ],
  ],
  "terms.s4t": ["Content we remove", "Content die wij verwijderen"],
  "terms.s4b": [
    [
      "We remove listings that are discriminatory, misleading, unpaid where pay is legally required, pyramid-style, or that require the candidate to pay for a permit, training or equipment.",
    ],
    [
      "Wij verwijderen vacatures die discriminerend of misleidend zijn, onbetaald terwijl loon wettelijk verplicht is, piramidespelen, of waarbij de kandidaat moet betalen voor een vergunning, training of materiaal.",
    ],
  ],
  "terms.s5t": ["No employment guarantee", "Geen garantie op werk"],
  "terms.s5b": [
    [
      "DutchVacancy is a marketplace, not an employer or agency. We do not guarantee that a vacancy leads to an offer, nor that an applicant is suitable, and we are not a party to any employment contract you enter into.",
    ],
    [
      "DutchVacancy is een platform, geen werkgever of uitzendbureau. Wij garanderen niet dat een vacature tot een aanbod leidt, noch dat een kandidaat geschikt is, en wij zijn geen partij bij een arbeidsovereenkomst die je sluit.",
    ],
  ],
  "terms.s6t": ["Liability and law", "Aansprakelijkheid en recht"],
  "terms.s6b": [
    [
      "The service is provided “as is”. To the extent permitted by law, our liability is limited to direct damage up to € 250. These terms are governed by Dutch law, with the courts of Amsterdam having jurisdiction.",
    ],
    [
      "De dienst wordt geleverd “zoals hij is”. Voor zover de wet dit toestaat, is onze aansprakelijkheid beperkt tot directe schade tot € 250. Op deze voorwaarden is Nederlands recht van toepassing; de rechtbank Amsterdam is bevoegd.",
    ],
  ],
};
