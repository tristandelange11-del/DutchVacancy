import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  FileCheck2,
  Globe2,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Layout from "@/components/Layout";
import JobCard from "@/components/JobCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiGet } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { CITIES, type JobList, type Stats } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSeo } from "@/lib/seo";

const STUDENT_STEPS = [
  { icon: Search, key: "student1" },
  { icon: FileCheck2, key: "student2" },
  { icon: BadgeCheck, key: "student3" },
];

const EMPLOYER_STEPS = [
  { icon: BriefcaseBusiness, key: "employer1" },
  { icon: Users, key: "employer2" },
  { icon: Globe2, key: "employer3" },
];

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

  const stats = useQuery({ queryKey: ["stats"], queryFn: () => apiGet<Stats>("/stats") });
  const featured = useQuery({
    queryKey: ["jobs", "featured"],
    queryFn: () => apiGet<JobList>("/jobs?limit=6"),
  });

  function search() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    navigate(`/jobs?${params.toString()}`);
  }

  const items = featured.data?.items.slice(0, 6) ?? [];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-slate-100">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="animate-rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-orange-200">
              <Sparkles className="h-3.5 w-3.5" /> {t("home.badge")}
            </span>
            <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
              {t("home.h1a")}
              <span className="block text-primary">{t("home.h1b")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">{t("home.lead")}</p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:flex sm:items-center sm:gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={t("home.searchPlaceholder")}
                data-testid="hero-search-input"
                className="h-11 border-white/15 bg-white/10 text-white placeholder:text-slate-400"
              />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                data-testid="hero-city-select"
                aria-label={t("jobs.filterCity")}
                className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white sm:mt-0 sm:w-44"
              >
                <option value="" className="text-slate-900">{t("home.allCities")}</option>
                {CITIES.map((c) => (
                  <option key={c} value={c} className="text-slate-900">{c}</option>
                ))}
              </select>
              <Button
                onClick={search}
                data-testid="hero-search-button"
                className="mt-2 h-11 w-full gap-2 sm:mt-0 sm:w-auto"
              >
                <Search className="h-4 w-4" /> {t("home.search")}
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className={cn(buttonVariants({ variant: "outline" }), "border-white/25 bg-transparent text-white hover:bg-white/10")} data-testid="hero-student-cta">
                {t("home.studentCta")}
              </Link>
              <Link to="/register?role=employer" className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-orange-200 hover:text-primary" data-testid="hero-employer-cta">
                {t("home.employerCta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="animate-float-slow rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <img
                src="https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="International students in the Netherlands"
                className="h-64 w-full rounded-2xl object-cover"
              />
              <div className="mt-5 space-y-3">
                {[
                  ["Junior Frontend Developer", "Picnic · Amsterdam · € 19,00–24,00"],
                  ["Barista — English team", "Canalside · Utrecht · € 14,50–16,80"],
                ].map(([title, meta]) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-navy-soft/70 p-4">
                    <p className="font-heading text-sm font-bold text-white">{title}</p>
                    <p className="text-xs text-slate-400">{meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 divide-border px-4 py-10 sm:px-6 lg:grid-cols-4 lg:divide-x">
          {[
            { value: stats.data ? `${stats.data.jobs}` : "—", label: t("home.statJobs"), testid: "stat-jobs" },
            { value: stats.data ? `${stats.data.employers}` : "—", label: t("home.statEmployers"), testid: "stat-employers" },
            { value: stats.data ? `${stats.data.english_only}` : "—", label: t("home.statEnglish"), testid: "stat-english" },
            { value: stats.data ? `€ ${stats.data.avg_hourly.toFixed(2).replace(".", ",")}` : "—", label: t("home.statRate"), testid: "stat-rate" },
          ].map((s) => (
            <div key={s.testid} className="px-2 py-3 lg:px-8">
              <p className="font-heading text-3xl font-extrabold text-primary" data-testid={s.testid}>{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">{t("home.featuredTitle")}</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">{t("home.featuredLead")}</p>
          </div>
          <Link to="/jobs" className={buttonVariants({ variant: "outline" })} data-testid="featured-view-all">
            {t("home.viewAll")}
          </Link>
        </div>

        {featured.isError ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground" data-testid="featured-empty">
            {t("home.featuredOffline")}
          </p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="featured-jobs-grid">
            {items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {items.length === 0 &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-60 animate-pulse rounded-2xl border border-border bg-muted/50" />
              ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-card py-20" id="how">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">{t("home.pathsTitle")}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("home.pathsLead")}</p>
          <Tabs defaultValue="students" className="mt-8">
            <TabsList variant="line" data-testid="how-it-works-tabs">
              <TabsTrigger value="students" data-testid="tab-students">{t("home.tabStudents")}</TabsTrigger>
              <TabsTrigger value="employers" data-testid="tab-employers">{t("home.tabEmployers")}</TabsTrigger>
            </TabsList>
            {[
              ["students", STUDENT_STEPS] as const,
              ["employers", EMPLOYER_STEPS] as const,
            ].map(([tab, steps]) => (
              <TabsContent key={tab} value={tab} className="pt-8">
                <div className="grid gap-5 md:grid-cols-3">
                  {steps.map((step, i) => (
                    <div key={step.key} className="rounded-2xl border border-border bg-background p-6 transition-shadow duration-200 hover:shadow-md">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                        <step.icon className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        {t("home.step")} {i + 1}
                      </p>
                      <h3 className="mt-1 font-heading text-lg font-bold">{t(`home.${step.key}t`)}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`home.${step.key}b`)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CITIES */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">{t("home.citiesTitle")}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CITIES.map((c) => (
            <Link
              key={c}
              to={`/jobs?city=${encodeURIComponent(c)}`}
              data-testid={`city-card-${c.toLowerCase()}`}
              className="group rounded-2xl border border-border bg-card p-5 text-center transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-primary/50"
            >
              <span className="font-heading text-base font-bold group-hover:text-primary">{c}</span>
              <p className="mt-1 text-xs text-muted-foreground">
                {featured.data?.items.filter((j) => j.city === c).length ?? 0}
                {t("home.citiesRoles")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* LEGAL */}
      <section className="bg-card py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">{t("home.legalTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("home.legalLead")}</p>
            <Link to="/guide" className={cn(buttonVariants(), "mt-6")} data-testid="legal-guide-link">
              {t("home.legalCta")}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-2xl border border-border bg-background p-5">
                <h3 className="font-heading text-base font-bold">{t(`home.legal${n}t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`home.legal${n}b`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center sm:px-14">
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <h2 className="relative font-heading text-3xl font-extrabold text-white sm:text-4xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-slate-300">{t("home.ctaLead")}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/jobs" className={buttonVariants({ size: "lg" })} data-testid="cta-find-job">
              {t("home.ctaFind")}
            </Link>
            <Link
              to="/register?role=employer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/25 bg-transparent text-white hover:bg-white/10")}
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
