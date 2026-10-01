import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@/lib/router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  FileCheck2,
  FileText,
  HeartPulse,
  IdCard,
  Languages,
  Search,
  type LucideIcon,
} from "lucide-react";
import Layout from "@/components/Layout";
import JobCard from "@/components/JobCard";
import { DraftBadge, OfficialBodies } from "@/components/Kb";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { loc, useKbArticles } from "@/lib/kb";
import { formatDate } from "@/lib/jobFormat";
import { CITIES, type JobList, type KbArticleSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSeo } from "@/lib/seo";

const STUDENT_STEPS = ["student1", "student2", "student3"];
const EMPLOYER_STEPS = ["employer1", "employer2", "employer3"];
const FACTS = ["home.fact1", "home.fact2", "home.fact3", "home.fact4"];

/** Tile colours follow the position, so four tiles always differ; icons follow the article. */
const TILES = [
  "bg-orange-100 text-orange-800",
  "bg-green-100 text-green-800",
  "bg-blue-100 text-blue-800",
  "bg-amber-100 text-amber-800",
];
const ARTICLE_ICONS: Record<string, LucideIcon> = {
  "start-working": BriefcaseBusiness,
  "twv-work-permit": FileCheck2,
  "health-insurance": HeartPulse,
  "employment-contract": FileText,
  "documents-to-start": IdCard,
  "jobs-without-dutch": Languages,
  "work-and-exams": CalendarClock,
};

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLang();
  useSeo({
    title: "DutchVacancy — English-Speaking Student Jobs in the Netherlands",
    description:
      "Find Dutch employers that hire English-speaking international students. Part-time jobs, internships, working-student and graduate roles with the hours, hourly rate and work-permit support stated up front.",
  });
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [englishOnly, setEnglishOnly] = useState(true);

  const guide = useKbArticles();
  const featured = useQuery({
    queryKey: ["jobs", "featured"],
    queryFn: () => apiGet<JobList>("/jobs/fresh"),
  });

  function search(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (englishOnly) params.set("english_level", "english_only");
    navigate(`/jobs?${params.toString()}`);
  }

  const items = featured.data?.items ?? [];
  const articles = (guide.data ?? []).slice(0, 4);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-slate-100">
        <HeroDecor />
        <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 pb-28 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-32 lg:pt-24">
          <div className="animate-rise-in">
            <span className="inline-flex items-center rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">
              {t("home.badge")}
            </span>
            <h1 className="mt-6 font-heading text-[2.4rem] font-extrabold leading-[1.04] text-brand-soft sm:text-5xl lg:text-6xl">
              {t("home.h1a")} {t("home.h1b")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">{t("home.lead")}</p>

            <form
              role="search"
              onSubmit={search}
              className="mt-8 flex flex-col gap-1 rounded-2xl bg-white p-2 text-foreground shadow-xl sm:flex-row sm:items-stretch sm:gap-2"
            >
              <label className="flex flex-1 flex-col gap-0.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus-within:ring-2 focus-within:ring-ring">
                {t("home.searchWhat")}
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("home.searchPlaceholder")}
                  data-testid="hero-search-input"
                  className="w-full bg-transparent py-1 text-base font-medium text-foreground outline-none placeholder:text-slate-400 sm:text-[15px]"
                />
              </label>
              <label className="relative flex flex-col gap-0.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus-within:ring-2 focus-within:ring-ring before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-border sm:w-48 sm:before:inset-x-auto sm:before:inset-y-2 sm:before:left-0 sm:before:h-auto sm:before:w-px">
                {t("home.searchWhere")}
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  data-testid="hero-city-select"
                  className="w-full bg-transparent py-1 text-base font-medium text-foreground outline-none sm:text-[15px]"
                >
                  <option value="">{t("home.allCities")}</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <Button type="submit" data-testid="hero-search-button" className="h-12 gap-2 rounded-xl px-5 text-[15px] font-semibold sm:h-auto">
                <Search className="h-4 w-4" /> {t("home.search")}
              </Button>
            </form>

            <label className="mt-4 flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={englishOnly}
                onChange={(e) => setEnglishOnly(e.target.checked)}
                data-testid="hero-english-only"
                className="h-[18px] w-[18px] accent-brand"
              />
              {t("home.englishOnly")}
            </label>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                to="/register"
                className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-xl border-white/25 bg-transparent px-4 font-semibold text-white hover:bg-white/10 hover:text-white")}
                data-testid="hero-student-cta"
              >
                {t("home.studentCta")}
              </Link>
              <Link to="/register?role=employer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-200 hover:text-white" data-testid="hero-employer-cta">
                {t("home.employerCta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mt-6 lg:self-start">
            <aside className="-rotate-2 rounded-3xl bg-white p-6 text-foreground shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] sm:p-7" data-testid="hero-facts">
              <h2 className="font-heading text-xl font-extrabold sm:text-[1.4rem]">{t("home.factsTitle")}</h2>
              <ul className="mt-5 space-y-3.5 text-[15px] leading-normal text-slate-700">
                {FACTS.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {t(key)}
                  </li>
                ))}
              </ul>
              <Link to="/guide" className="mt-5 inline-block text-sm font-semibold text-primary hover:underline" data-testid="hero-facts-guide">
                {t("home.factsLink")}
              </Link>
            </aside>
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-5 rotate-[8deg] rounded-full bg-blue-50 px-4 py-2 font-heading text-base font-extrabold text-[#1e40af] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] sm:-right-3.5"
            >
              {t("label.english_only")}
            </span>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">{t("home.featuredTitle")}</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">{t("home.featuredLead")}</p>
          </div>
          <Link to="/jobs" className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-xl bg-card px-4 font-semibold")} data-testid="featured-view-all">
            {t("home.viewAll")}
          </Link>
        </div>

        {featured.isError ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground" data-testid="featured-empty">
            {t("home.featuredOffline")}
          </p>
        ) : featured.isSuccess && items.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground" data-testid="featured-none">
            {t("home.featuredEmpty")}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="featured-jobs-grid">
            {items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {featured.isPending &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-60 animate-pulse rounded-2xl border border-border bg-muted/50" />
              ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-card py-20" id="how">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">{t("home.pathsTitle")}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("home.pathsLead")}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-3xl bg-accent p-6 sm:p-8" data-testid="how-students">
              <h3 className="font-heading text-[1.4rem] font-extrabold text-accent-foreground">{t("home.tabStudents")}</h3>
              <Steps keys={STUDENT_STEPS} circle="bg-primary text-white" body="text-slate-600" />
              <Link to="/register" className={cn(buttonVariants(), "mt-8 h-11 self-start rounded-xl px-4 font-semibold")} data-testid="how-student-cta">
                {t("home.studentCta")}
              </Link>
            </div>
            <div className="flex flex-col rounded-3xl bg-navy p-6 text-slate-100 sm:p-8" data-testid="how-employers">
              <h3 className="font-heading text-[1.4rem] font-extrabold text-white">{t("home.tabEmployers")}</h3>
              <Steps keys={EMPLOYER_STEPS} circle="bg-brand-soft text-navy" body="text-slate-300" />
              <Link
                to="/employers"
                className={cn(buttonVariants({ variant: "outline" }), "mt-8 h-11 self-start rounded-xl border-white/25 bg-transparent px-4 font-semibold text-white hover:bg-white/10 hover:text-white")}
                data-testid="how-employer-cta"
              >
                {t("kb.employersCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KNOWLEDGE BASE */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">{t("home.legalTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{t("home.legalLead")}</p>
          </div>
          <Link to="/guide" className="text-sm font-semibold text-primary hover:underline" data-testid="legal-guide-link">
            {t("home.legalCta")}
          </Link>
        </div>
        {/* Rules are only stated in reviewed knowledge-base articles; until one is
            live, point to the official bodies instead of paraphrasing them here. */}
        <div className="mt-10">
          {articles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="home-kb-articles">
              {articles.map((article, i) => (
                <ArticleTile key={article.slug} article={article} index={i} />
              ))}
            </div>
          ) : (
            <OfficialBodies />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-brand px-6 py-12 text-navy sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:py-14">
          <CtaDecor />
          <div className="relative max-w-2xl">
            <h2 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl">{t("home.ctaTitle")}</h2>
            <p className="mt-3 text-base font-medium sm:text-lg">{t("home.ctaLead")}</p>
          </div>
          <div className="relative mt-8 flex flex-wrap gap-3 lg:mr-24 lg:mt-0 lg:shrink-0">
            <Link
              to="/jobs"
              className="inline-flex h-12 items-center rounded-xl bg-navy px-6 text-[15px] font-bold text-white transition-colors hover:bg-navy-soft"
              data-testid="cta-find-job"
            >
              {t("home.ctaFind")}
            </Link>
            <Link
              to="/register?role=employer"
              className="inline-flex h-12 items-center rounded-xl border-2 border-navy px-6 text-[15px] font-bold text-navy transition-colors hover:bg-navy hover:text-white"
              data-testid="cta-post-job"
            >
              {t("home.ctaPost")}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Steps({ keys, circle, body }: { keys: string[]; circle: string; body: string }) {
  const { t } = useLang();
  return (
    <ol className="mt-6 space-y-5">
      {keys.map((key, i) => (
        <li key={key} className="flex gap-4">
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full font-heading text-base font-extrabold", circle)}>
            {i + 1}
          </span>
          <div>
            <p className="font-heading font-bold">{t(`home.${key}t`)}</p>
            <p className={cn("mt-0.5 text-sm leading-relaxed", body)}>{t(`home.${key}b`)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ArticleTile({ article, index }: { article: KbArticleSummary; index: number }) {
  const { t, lang } = useLang();
  const Icon = ARTICLE_ICONS[article.slug] ?? FileText;
  const checked = formatDate(article.reviewed_on, lang);
  return (
    <Link
      to={`/guide/${article.slug}`}
      data-testid={`kb-card-${article.slug}`}
      className="group flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
    >
      <span className={cn("grid h-12 w-12 place-items-center rounded-2xl", TILES[index % TILES.length])}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <DraftBadge article={article} />
      <h3 className="font-heading text-[1.05rem] font-bold leading-snug group-hover:text-primary">{loc(article.title, lang)}</h3>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{loc(article.summary, lang)}</p>
      {checked && (
        <p className="text-xs text-muted-foreground">
          {t("kb.lastReviewed")}: {checked}
        </p>
      )}
    </Link>
  );
}

/** Dots and a canal bridge in the hero; purely decorative. */
function HeroDecor() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 620 620"
      className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] sm:right-0 lg:h-[620px] lg:w-[620px]"
    >
      <circle cx="520" cy="44" r="8" fill="#ea580c" />
      <circle cx="584" cy="92" r="5" fill="#fb923c" />
      <circle cx="446" cy="70" r="4" fill="#fb923c" />
      <circle cx="600" cy="196" r="10" fill="#ea580c" />
      <circle cx="120" cy="40" r="5" fill="#ea580c" />
      <circle cx="36" cy="130" r="7" fill="#fb923c" />
      <circle cx="596" cy="330" r="6" fill="#fb923c" />
      <circle cx="30" cy="420" r="9" fill="#ea580c" />
      <circle cx="572" cy="470" r="4" fill="#fdba74" />
      <circle cx="260" cy="24" r="4" fill="#fdba74" />
      <g fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round">
        <path d="M60 560 C 200 532, 480 532, 620 560" />
        <path d="M60 578 C 200 550, 480 550, 620 578" />
        <path d="M100 550 V 572 M160 542 V 564 M220 537 V 559 M280 534 V 556 M340 533 V 555 M400 534 V 556 M460 537 V 559 M520 542 V 564 M580 550 V 572" />
        <path d="M120 620 A 62 62 0 0 1 244 620" />
        <path d="M256 620 A 62 62 0 0 1 380 620" />
        <path d="M392 620 A 62 62 0 0 1 516 620" />
      </g>
    </svg>
  );
}

function CtaDecor() {
  return (
    <svg aria-hidden="true" viewBox="0 0 420 256" className="pointer-events-none absolute bottom-0 right-0 h-[256px] w-[420px]">
      <circle cx="380" cy="36" r="9" fill="#ffffff" fillOpacity="0.9" />
      <circle cx="330" cy="70" r="5" fill="#fed7aa" />
      <circle cx="400" cy="120" r="4" fill="#ffffff" fillOpacity="0.8" />
      <circle cx="250" cy="30" r="4" fill="#fed7aa" />
      <g fill="none" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8">
        <path d="M40 256 A 58 58 0 0 1 156 256" />
        <path d="M168 256 A 58 58 0 0 1 284 256" />
        <path d="M296 256 A 58 58 0 0 1 412 256" />
        <path d="M20 200 C 140 176, 300 176, 420 200" />
      </g>
    </svg>
  );
}
