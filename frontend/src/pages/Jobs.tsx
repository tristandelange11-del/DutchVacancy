import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJobs, useToggleSave } from "@/lib/hooks";
import { useSession } from "@/lib/session";
import {
  CITIES,
  ENGLISH_LEVEL_LABELS,
  JOB_TYPE_LABELS,
  PERMIT_LABELS,
  type JobWithMeta,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const RATE_OPTIONS = [
  { value: "", label: "Any rate" },
  { value: "15", label: "€ 15+ / hour" },
  { value: "18", label: "€ 18+ / hour" },
  { value: "22", label: "€ 22+ / hour" },
];

function FilterGroup({
  title,
  options,
  value,
  onChange,
  testid,
}: {
  title: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  testid: string;
}) {
  return (
    <div data-testid={testid}>
      <Label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{title}</Label>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value || "all"}
            type="button"
            data-testid={`${testid}-${o.value || "all"}`}
            onClick={() => onChange(value === o.value ? "" : o.value)}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,transform] duration-150 hover:border-primary/60 active:scale-95",
              value === o.value && "border-primary bg-primary text-primary-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const { user } = useSession();
  const toggleSave = useToggleSave();
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");

  const filters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      city: params.get("city") ?? "",
      job_type: params.get("job_type") ?? "",
      english_level: params.get("english_level") ?? "",
      permit_support: params.get("permit_support") ?? "",
      min_rate: params.get("min_rate") ?? "",
    }),
    [params],
  );

  useEffect(() => setQ(filters.q), [filters.q]);

  const { data, isLoading, isError } = useJobs(filters);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const activeCount = Object.entries(filters).filter(([, v]) => v).length;

  function handleSave(job: JobWithMeta) {
    if (!user) {
      toast.error("Log in as a student to save jobs");
      return;
    }
    if (user.role !== "student") {
      toast.error("Only student accounts can save jobs");
      return;
    }
    toggleSave.mutate(job, {
      onSuccess: () => toast.success(job.saved ? "Removed from saved jobs" : "Job saved"),
      onError: () => toast.error("Could not update saved jobs"),
    });
  }

  const items = data?.items ?? [];

  return (
    <Layout>
      <div className="border-b border-border bg-navy py-12 text-slate-100">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
            English-speaking student jobs
          </h1>
          <p className="mt-2 text-slate-300">
            Filter by city, English requirement and work-permit support.
          </p>
          <div className="mt-6 flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setFilter("q", q)}
              placeholder="Search job title, company or keyword"
              data-testid="jobs-search-input"
              className="h-11 max-w-xl border-white/15 bg-white/10 text-white placeholder:text-slate-400"
            />
            <Button className="h-11 gap-2" onClick={() => setFilter("q", q)} data-testid="jobs-search-button">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
        <div className="lg:hidden">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowFilters((v) => !v)}
            data-testid="jobs-filter-toggle"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {activeCount > 0 && `(${activeCount})`}
          </Button>
        </div>

        <aside
          className={cn(
            "h-fit space-y-6 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24 lg:block",
            showFilters ? "block" : "hidden",
          )}
          data-testid="jobs-filter-panel"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold">Filters</h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
                data-testid="jobs-clear-filters"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
          <FilterGroup
            title="City"
            testid="filter-city"
            value={filters.city}
            onChange={(v) => setFilter("city", v)}
            options={CITIES.map((c) => ({ value: c, label: c }))}
          />
          <FilterGroup
            title="English requirement"
            testid="filter-english"
            value={filters.english_level}
            onChange={(v) => setFilter("english_level", v)}
            options={Object.entries(ENGLISH_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <FilterGroup
            title="Job type"
            testid="filter-jobtype"
            value={filters.job_type}
            onChange={(v) => setFilter("job_type", v)}
            options={Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <FilterGroup
            title="Work permit support"
            testid="filter-permit"
            value={filters.permit_support}
            onChange={(v) => setFilter("permit_support", v)}
            options={Object.entries(PERMIT_LABELS)
              .filter(([value]) => value !== "none")
              .map(([value, label]) => ({ value, label }))}
          />
          <FilterGroup
            title="Hourly rate"
            testid="filter-rate"
            value={filters.min_rate}
            onChange={(v) => setFilter("min_rate", v)}
            options={RATE_OPTIONS.filter((o) => o.value)}
          />
        </aside>

        <section>
          <p className="mb-5 text-sm text-muted-foreground" data-testid="jobs-result-count">
            {isError
              ? "Job data is temporarily unavailable."
              : isLoading
                ? "Loading vacancies…"
                : `${items.length} vacanc${items.length === 1 ? "y" : "ies"} found`}
          </p>

          {items.length === 0 && !isLoading ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center" data-testid="jobs-empty-state">
              <h3 className="font-heading text-lg font-bold">No vacancies match these filters</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try clearing a filter or widening your city selection.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2" data-testid="jobs-grid">
              {items.map((job) => (
                <JobCard key={job.id} job={job} onToggleSave={handleSave} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
