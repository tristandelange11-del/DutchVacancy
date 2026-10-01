import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "@/lib/router";
import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useJobs, useToggleSave } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import {
  CITIES,
  ENGLISH_LEVELS,
  JOB_TYPES,
  PERMITS,
  WORK_MODES,
  type JobWithMeta,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSeo } from "@/lib/seo";

type FilterKey = "english_level" | "city" | "job_type" | "work_mode" | "permit_support" | "min_rate";

interface FilterGroup {
  key: FilterKey;
  title: string;
  /** Several values may be chosen (sent comma-separated); otherwise one, like the hourly rate. */
  multiple: boolean;
  options: { value: string; label: string }[];
}

/** The values of a filter in the URL: "city=Groningen,Utrecht" → ["Groningen", "Utrecht"]. */
function readValues(params: URLSearchParams, key: FilterKey): string[] {
  return (params.get(key) ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function FilterOptions({
  group,
  selected,
  onChange,
  showTitle,
}: {
  group: FilterGroup;
  selected: string[];
  onChange: (value: string) => void;
  showTitle: boolean;
}) {
  const { t } = useLang();
  return (
    <fieldset className="flex flex-col gap-0.5" data-testid={`filter-group-${group.key}`}>
      <legend className={cn("mb-1 font-heading text-base font-bold", !showTitle && "sr-only")}>{group.title}</legend>
      <p className="mb-1.5 text-sm text-slate-600">{group.multiple ? t("jobs.pickOneOrMore") : t("jobs.rateNote")}</p>
      {group.options.map((o) => {
        const checked = group.multiple ? selected.includes(o.value) : (selected[0] ?? "") === o.value;
        return (
          <label
            key={o.value || "any"}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2.5 text-[15px] transition-colors hover:bg-muted",
              checked && "bg-accent font-semibold text-accent-foreground hover:bg-accent",
            )}
          >
            <input
              type={group.multiple ? "checkbox" : "radio"}
              name={`filter-${group.key}`}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="size-[18px] shrink-0 accent-primary"
              data-testid={`filter-option-${group.key}-${o.value || "any"}`}
            />
            {o.label}
          </label>
        );
      })}
    </fieldset>
  );
}

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const { user } = useSession();
  const { t } = useLang();
  const toggleSave = useToggleSave();
  useSeo({
    title: "English-Speaking Student Jobs in the Netherlands",
    description:
      "Search student vacancies across Amsterdam, Utrecht, Groningen, Leiden, Tilburg and more. Filter by city, work arrangement, English requirement, job type and hourly rate.",
  });
  // The URL holds the filters; `current` mirrors it so a tick shows at once, before
  // the router has caught up (back and forward still win through the effect below).
  const [current, setCurrent] = useState(() => new URLSearchParams(params));
  useEffect(() => setCurrent(new URLSearchParams(params)), [params]);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [openGroup, setOpenGroup] = useState<FilterKey | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const groups: FilterGroup[] = useMemo(
    () => [
      {
        key: "english_level",
        title: t("jobs.filterLanguage"),
        multiple: true,
        options: ENGLISH_LEVELS.map((v) => ({ value: v, label: t(`label.${v}`) })),
      },
      { key: "city", title: t("jobs.filterCity"), multiple: true, options: CITIES.map((c) => ({ value: c, label: c })) },
      {
        key: "job_type",
        title: t("jobs.filterType"),
        multiple: true,
        options: JOB_TYPES.map((v) => ({ value: v, label: t(`label.${v}`) })),
      },
      {
        key: "work_mode",
        title: t("jobs.filterWork"),
        multiple: true,
        options: WORK_MODES.map((v) => ({ value: v, label: t(`label.${v}`) })),
      },
      {
        key: "permit_support",
        title: t("jobs.filterPermitShort"),
        multiple: true,
        options: PERMITS.filter((v) => v !== "none").map((v) => ({ value: v, label: t(`label.${v}`) })),
      },
      {
        key: "min_rate",
        title: t("jobs.filterRate"),
        multiple: false,
        options: [
          { value: "", label: t("jobs.anyRate") },
          { value: "15", label: t("jobs.rate15") },
          { value: "18", label: t("jobs.rate18") },
          { value: "22", label: t("jobs.rate22") },
        ],
      },
    ],
    [t],
  );

  const selected = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.key, readValues(current, g.key)])) as Record<FilterKey, string[]>,
    [groups, current],
  );

  const filters = useMemo(
    () => ({
      q: current.get("q") ?? "",
      ...Object.fromEntries(groups.map((g) => [g.key, selected[g.key].join(",")])),
    }),
    [groups, current, selected],
  );

  useEffect(() => setQ(filters.q), [filters.q]);

  const { data, isLoading, isError } = useJobs(filters);
  const items = data?.items ?? [];

  function update(next: URLSearchParams) {
    setCurrent(next);
    setParams(next, { replace: true });
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value);
    else next.delete(key);
    update(next);
  }

  function toggle(group: FilterGroup, value: string) {
    if (!group.multiple) {
      setParam(group.key, value);
      return;
    }
    const current = selected[group.key];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    // Keep the options' order, so the same choice always gives the same URL.
    setParam(group.key, group.options.map((o) => o.value).filter((v) => next.includes(v)).join(","));
  }

  function clearAll() {
    const next = new URLSearchParams();
    if (filters.q) next.set("q", filters.q);
    update(next);
  }

  const chips = groups.flatMap((g) =>
    selected[g.key].map((value) => ({
      group: g,
      value,
      label: g.options.find((o) => o.value === value)?.label ?? value,
    })),
  );

  function summary(g: FilterGroup) {
    const values = selected[g.key];
    if (values.length === 0) return g.title;
    if (values.length === 1) return `${g.title}: ${g.options.find((o) => o.value === values[0])?.label ?? values[0]}`;
    return `${g.title}: ${values.length} ${t("jobs.chosen")}`;
  }

  const showLabel = `${t("jobs.show")} ${items.length} ${items.length === 1 ? t("jobs.vacancyOne") : t("jobs.vacancyMany")}`;

  function handleSave(job: JobWithMeta) {
    if (!user) {
      toast.error(t("toast.saveLogin"));
      return;
    }
    if (user.role !== "student") {
      toast.error(t("toast.saveStudentOnly"));
      return;
    }
    toggleSave.mutate(job, {
      onSuccess: () => toast.success(job.saved ? t("toast.unsaved") : t("toast.saved")),
      onError: () => toast.error(t("toast.saveFailed")),
    });
  }

  return (
    <Layout>
      <div className="bg-navy py-12 text-slate-100">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">{t("jobs.title")}</h1>
          <p className="mt-2 text-slate-300">{t("jobs.lead")}</p>
          <div className="mt-6 flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setParam("q", q)}
              placeholder={t("jobs.searchPlaceholder")}
              aria-label={t("jobs.searchPlaceholder")}
              data-testid="jobs-search-input"
              className="h-11 max-w-xl border-white/15 bg-white/10 text-white placeholder:text-slate-400"
            />
            <Button className="h-11 gap-2" onClick={() => setParam("q", q)} data-testid="jobs-search-button">
              <Search className="h-4 w-4" /> {t("home.search")}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: one row of filter buttons, each opening its own menu. */}
      <div className="hidden border-b border-border bg-card lg:sticky lg:top-18 lg:z-30 lg:block">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6" data-testid="filter-bar">
          {groups.map((g) => {
            const active = selected[g.key].length > 0;
            return (
              <Popover key={g.key} open={openGroup === g.key} onOpenChange={(open) => setOpenGroup(open ? g.key : null)}>
                <PopoverTrigger
                  data-testid={`filter-button-${g.key}`}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[popup-open]:ring-2 data-[popup-open]:ring-foreground",
                    active
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-slate-300 bg-card text-foreground hover:border-slate-400",
                  )}
                >
                  {active && <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />}
                  {summary(g)}
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={8} className="w-80 gap-3 rounded-2xl p-4" data-testid={`filter-menu-${g.key}`}>
                  <div className="max-h-[50vh] overflow-y-auto">
                    <FilterOptions group={g} selected={selected[g.key]} onChange={(v) => toggle(g, v)} showTitle={false} />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => setParam(g.key, "")}
                      className="h-10 px-1 text-sm font-semibold underline underline-offset-4"
                    >
                      {t("jobs.clearGroup")}
                    </button>
                    <Button className="h-11 rounded-xl px-4 font-semibold" onClick={() => setOpenGroup(null)} data-testid={`filter-menu-done-${g.key}`}>
                      {showLabel}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
          {chips.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              data-testid="jobs-clear-filters"
              className="ml-auto h-11 px-2 text-sm font-semibold text-primary underline underline-offset-4"
            >
              {t("jobs.clearAll")}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:pb-16">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <p role="status" className="mr-2 text-sm text-muted-foreground" data-testid="jobs-result-count">
            {isError
              ? t("jobs.offline")
              : isLoading
                ? t("jobs.loading")
                : `${items.length} ${items.length === 1 ? t("jobs.foundOne") : t("jobs.found")}`}
          </p>
          {chips.map((c) => (
            <button
              key={`${c.group.key}-${c.value}`}
              type="button"
              onClick={() => toggle(c.group, c.group.multiple ? c.value : "")}
              aria-label={`${t("jobs.removeFilter")}: ${c.label}`}
              data-testid={`filter-chip-${c.group.key}-${c.value}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card pl-3.5 pr-2.5 text-sm font-medium transition-colors hover:border-slate-400"
            >
              {c.label}
              <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </button>
          ))}
        </div>

        {items.length === 0 && !isLoading ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center" data-testid="jobs-empty-state">
            <h3 className="font-heading text-lg font-bold">{t("jobs.emptyTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("jobs.emptyBody")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="jobs-grid">
            {items.map((job) => (
              <JobCard key={job.id} job={job} onToggleSave={handleSave} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile: a fixed button opens every filter in a sheet from the bottom. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          data-testid="jobs-filter-toggle"
          className="pointer-events-auto inline-flex h-13 items-center gap-2.5 rounded-full bg-navy px-6 text-[15px] font-bold text-white shadow-[0_10px_20px_-5px_rgba(15,23,42,0.4)]"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
          {t("jobs.filters")}
          {chips.length > 0 && (
            <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-brand-soft px-1.5 text-xs font-extrabold text-navy">
              {chips.length}
            </span>
          )}
        </button>
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[88vh] gap-0 rounded-t-3xl p-0" data-testid="filter-sheet">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <SheetTitle className="font-heading text-xl font-extrabold">{t("jobs.filters")}</SheetTitle>
            <SheetClose
              aria-label={t("common.close")}
              className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-foreground"
            >
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            </SheetClose>
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto px-5 py-4">
            {groups.map((g) => (
              <FilterOptions key={g.key} group={g} selected={selected[g.key]} onChange={(v) => toggle(g, v)} showTitle />
            ))}
          </div>
          <div className="flex items-center gap-3 border-t border-border px-5 pb-6 pt-3">
            <button type="button" onClick={clearAll} className="h-12 px-2 text-[15px] font-semibold underline underline-offset-4">
              {t("jobs.clearAll")}
            </button>
            <Button className="h-12 flex-1 rounded-xl text-base font-bold" onClick={() => setSheetOpen(false)} data-testid="filter-sheet-show">
              {showLabel}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
