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
import { CITIES, type JobList, type Stats } from "@/lib/types";
import { cn } from "@/lib/utils";

const STUDENT_STEPS = [
  { icon: Search, title: "Search without the language wall", body: "Every vacancy states its English requirement, so you only see roles you can actually get." },
  { icon: FileCheck2, title: "Build one student profile", body: "University, study programme, CV link and availability — reused on every application." },
  { icon: BadgeCheck, title: "Track every application", body: "Applied, under review, interview or offer: follow each status from your dashboard." },
];

const EMPLOYER_STEPS = [
  { icon: BriefcaseBusiness, title: "Publish a vacancy in minutes", body: "State the English level, hours and permit support — students self-select correctly." },
  { icon: Users, title: "Review real applicants", body: "Motivation letter, university and CV link for every candidate in one pipeline." },
  { icon: Globe2, title: "Hire international talent", body: "Reach 100k+ international students studying across the Netherlands." },
];

const LEGAL = [
  { title: "16 hours per week during term", body: "Non-EU/EEA students may work up to 16 hours a week during the academic year — or full-time across June, July and August, but not both in the same year." },
  { title: "TWV work permit", body: "Your employer applies for the TWV (work permit) at UWV on your behalf. It is free for them, and vacancies here flag when it's offered." },
  { title: "BSN and Dutch bank account", body: "Register at your municipality to get a BSN, then open a Dutch IBAN. Most employers cannot pay you without both." },
  { title: "Zoekjaar (orientation year)", body: "Graduated from a Dutch university? The orientation-year permit gives you 12 months to work full-time without a TWV." },
];

export default function Home() {
  const navigate = useNavigate();
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
              <Sparkles className="h-3.5 w-3.5" /> For international students in NL
            </span>
            <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
              Dutch jobs that
              <span className="block text-primary">hire in English.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              Stop guessing whether a vacancy needs fluent Dutch. DutchVacancy lists only student
              roles from employers who work in English — with the hours, hourly rate and work-permit
              support stated up front.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:flex sm:items-center sm:gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Job title, skill or company"
                data-testid="hero-search-input"
                className="h-11 border-white/15 bg-white/10 text-white placeholder:text-slate-400"
              />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                data-testid="hero-city-select"
                className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white sm:mt-0 sm:w-44"
              >
                <option value="" className="text-slate-900">All cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c} className="text-slate-900">{c}</option>
                ))}
              </select>
              <Button
                onClick={search}
                data-testid="hero-search-button"
                className="mt-2 h-11 w-full gap-2 sm:mt-0 sm:w-auto"
              >
                <Search className="h-4 w-4" /> Search
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className={cn(buttonVariants({ variant: "outline" }), "border-white/25 bg-transparent text-white hover:bg-white/10")} data-testid="hero-student-cta">
                Create a student account
              </Link>
              <Link to="/register?role=employer" className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-orange-200 hover:text-primary" data-testid="hero-employer-cta">
                I'm hiring students <ArrowRight className="h-4 w-4" />
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
            { value: stats.data ? `${stats.data.jobs}` : "—", label: "Live student vacancies", testid: "stat-jobs" },
            { value: stats.data ? `${stats.data.employers}` : "—", label: "Verified Dutch employers", testid: "stat-employers" },
            { value: stats.data ? `${stats.data.english_only}` : "—", label: "No Dutch required", testid: "stat-english" },
            { value: stats.data ? `€ ${stats.data.avg_hourly.toFixed(2).replace(".", ",")}` : "—", label: "Average hourly rate", testid: "stat-rate" },
          ].map((s) => (
            <div key={s.label} className="px-2 py-3 lg:px-8">
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
            <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">Fresh English vacancies</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Hand-checked roles across the Randstad and the student cities — part-time, internships,
              working-student and graduate positions.
            </p>
          </div>
          <Link to="/jobs" className={buttonVariants({ variant: "outline" })} data-testid="featured-view-all">
            View all jobs
          </Link>
        </div>

        {featured.isError ? (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground" data-testid="featured-empty">
            Vacancies load as soon as the job service is reachable. Meanwhile, browse the guide below.
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
          <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">Two paths, one platform</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Whether you're looking for your first Dutch payslip or your next international hire.
          </p>
          <Tabs defaultValue="students" className="mt-8">
            <TabsList variant="line" data-testid="how-it-works-tabs">
              <TabsTrigger value="students" data-testid="tab-students">For students</TabsTrigger>
              <TabsTrigger value="employers" data-testid="tab-employers">For employers</TabsTrigger>
            </TabsList>
            {[
              ["students", STUDENT_STEPS] as const,
              ["employers", EMPLOYER_STEPS] as const,
            ].map(([key, steps]) => (
              <TabsContent key={key} value={key} className="pt-8">
                <div className="grid gap-5 md:grid-cols-3">
                  {steps.map((step, i) => (
                    <div key={step.title} className="rounded-2xl border border-border bg-background p-6 transition-shadow duration-200 hover:shadow-md">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                        <step.icon className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-primary">Step {i + 1}</p>
                      <h3 className="mt-1 font-heading text-lg font-bold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
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
        <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">Explore the student hubs</h2>
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
                {featured.data?.items.filter((j) => j.city === c).length ?? 0}+ roles
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* LEGAL */}
      <section className="bg-card py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-heading text-3xl font-extrabold sm:text-4xl">Dutch work rules, in plain English</h2>
            <p className="mt-3 text-muted-foreground">
              The four things every international student needs to know before signing a contract in
              the Netherlands.
            </p>
            <Link to="/guide" className={cn(buttonVariants(), "mt-6")} data-testid="legal-guide-link">
              Read the full student guide
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {LEGAL.map((l) => (
              <div key={l.title} className="rounded-2xl border border-border bg-background p-5">
                <h3 className="font-heading text-base font-bold">{l.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
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
            Ready to launch your Dutch career?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-slate-300">
            Create a free account and apply to your first English-speaking vacancy today.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/jobs" className={buttonVariants({ size: "lg" })} data-testid="cta-find-job">
              Find your job
            </Link>
            <Link
              to="/register?role=employer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/25 bg-transparent text-white hover:bg-white/10")}
              data-testid="cta-post-job"
            >
              Post a vacancy
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
