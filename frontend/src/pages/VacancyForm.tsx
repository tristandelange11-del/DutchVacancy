import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@/lib/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import FairnessHints from "@/components/FairnessHints";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RESPONSE_WORKING_DAYS } from "@/config/operations";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useLang } from "@/lib/i18n";
import { apiErrorText } from "@/lib/jobFormat";
import {
  CATEGORIES,
  CITIES,
  CONTRACT_TYPES,
  ENGLISH_LEVELS,
  JOB_TYPES,
  PERMITS,
  SCHEDULE_TAGS,
  WORK_MODES,
  type ContractType,
  type EnglishLevel,
  type Job,
  type JobInput,
  type JobType,
  type PermitSupport,
  type SalaryPeriod,
  type WorkMode,
} from "@/lib/types";

const DEFAULT_LISTING_DAYS = 30;

/** End of the given local day, as ISO — a vacancy closing "on" a date stays open that whole day. */
function endOfDayIso(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T23:59:00`).toISOString();
}

function localDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function defaultClosing() {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_LISTING_DAYS);
  return endOfDayIso(localDate(d.toISOString()));
}

// Pay, hours, contract, start and schedule start empty: only what the employer states
// gets published. The closing date is prefilled but visible and editable.
function emptyJob(): JobInput {
  return {
    title: "",
    city: "Amsterdam",
    category: CATEGORIES[0],
    job_type: "part_time",
    english_level: "english_only",
    permit_support: "none",
    work_mode: "on_site",
    hourly_min: null,
    hourly_max: null,
    salary_period: "hour",
    hours_per_week: null,
    schedule: "",
    schedule_tags: [],
    contract_type: null,
    start_date: null,
    valid_through: defaultClosing(),
    cv_required: false,
    description: "",
    requirements: [],
    perks: [],
    published: true,
  };
}

function numberOrNull(v: string) {
  return v.trim() === "" ? null : Number(v);
}

function lines(v: string) {
  return v.split("\n").map((s) => s.trim()).filter(Boolean);
}

export default function VacancyForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const editing = Boolean(jobId);
  const [form, setForm] = useState<JobInput>(emptyJob);
  const [reqText, setReqText] = useState("");
  const [perkText, setPerkText] = useState("");

  const existing = useQuery({
    queryKey: ["employer-jobs"],
    queryFn: () => apiGet<Job[]>("/employer/jobs"),
    enabled: editing,
  });

  useEffect(() => {
    const job = existing.data?.find((j) => j.id === jobId);
    if (!job) return;
    const {
      id: _id, company_id: _c, company_name: _n, created_at: _d,
      moderation_status: _m, moderation_note: _mn, ...rest
    } = job;
    setForm(rest);
    setReqText(job.requirements.join("\n"));
    setPerkText(job.perks.join("\n"));
  }, [existing.data, jobId]);

  function set<K extends keyof JobInput>(key: K, value: JobInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const save = useMutation({
    mutationFn: () => {
      const payload: JobInput = {
        ...form,
        requirements: lines(reqText),
        perks: lines(perkText),
      };
      return editing
        ? apiPut<Job>(`/employer/jobs/${jobId}`, payload)
        : apiPost<Job>("/employer/jobs", payload);
    },
    onSuccess: (job) => {
      if (job.published && job.moderation_status === "pending") {
        // Not online yet: say so, instead of a plain "created".
        const days = RESPONSE_WORKING_DAYS;
        toast.success(days ? t("vf.pendingDays").replace("{n}", String(days)) : t("vf.pending"), { duration: 8000 });
      } else {
        toast.success(editing ? t("vf.updated") : t("vf.created"));
      }
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/employer/dashboard");
    },
    onError: (err) => toast.error(apiErrorText(err, t, t("vf.failed"))),
  });

  return (
    <Layout>
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold" data-testid="vacancy-form-heading">
          {editing ? t("vf.editTitle") : t("vf.newTitle")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("vf.lead")}</p>

        <form
          className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6"
          data-testid="vacancy-form"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div>
            <Label htmlFor="title">{t("vf.title")}</Label>
            <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} required minLength={3} data-testid="vacancy-title-input" className="mt-1.5" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">{t("vf.city")}</Label>
              <select id="city" value={form.city} onChange={(e) => set("city", e.target.value)} data-testid="vacancy-city-select" className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="category">{t("vf.category")}</Label>
              <select id="category" value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="vacancy-category-select" className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="jobtype">{t("vf.jobType")}</Label>
              <select id="jobtype" value={form.job_type} onChange={(e) => set("job_type", e.target.value as JobType)} data-testid="vacancy-jobtype-select" className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                {JOB_TYPES.map((v) => <option key={v} value={v}>{t(`label.${v}`)}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="english">{t("vf.english")}</Label>
              <select id="english" value={form.english_level} onChange={(e) => set("english_level", e.target.value as EnglishLevel)} data-testid="vacancy-english-select" className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                {ENGLISH_LEVELS.map((v) => <option key={v} value={v}>{t(`label.${v}`)}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="permit">{t("vf.permit")}</Label>
              <select id="permit" value={form.permit_support} onChange={(e) => set("permit_support", e.target.value as PermitSupport)} data-testid="vacancy-permit-select" className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                {PERMITS.map((v) => <option key={v} value={v}>{t(`label.${v}`)}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="workmode">{t("vf.workMode")}</Label>
              <select id="workmode" value={form.work_mode} onChange={(e) => set("work_mode", e.target.value as WorkMode)} data-testid="vacancy-workmode-select" className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                {WORK_MODES.map((v) => <option key={v} value={v}>{t(`label.${v}`)}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="hours">{t("vf.hours")} <span className="font-normal text-muted-foreground">({t("vf.optional")})</span></Label>
              <Input id="hours" type="number" min={1} max={40} value={form.hours_per_week ?? ""} onChange={(e) => set("hours_per_week", numberOrNull(e.target.value))} data-testid="vacancy-hours-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="contract">{t("vf.contract")} <span className="font-normal text-muted-foreground">({t("vf.optional")})</span></Label>
              <select id="contract" value={form.contract_type ?? ""} onChange={(e) => set("contract_type", (e.target.value || null) as ContractType | null)} data-testid="vacancy-contract-select" className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">{t("vf.notStated")}</option>
                {CONTRACT_TYPES.map((v) => <option key={v} value={v}>{t(`label.contract_${v}`)}</option>)}
              </select>
            </div>
          </div>

          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-medium">{t("vf.pay")} <span className="font-normal text-muted-foreground">({t("vf.optional")})</span></legend>
            <p className="text-xs text-muted-foreground">{t("vf.payHint")}</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="hmin">{t("vf.rateFrom")}</Label>
                <Input id="hmin" type="number" step="0.01" min={0.01} value={form.hourly_min ?? ""} onChange={(e) => set("hourly_min", numberOrNull(e.target.value))} data-testid="vacancy-hourlymin-input" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="hmax">{t("vf.rateTo")}</Label>
                <Input id="hmax" type="number" step="0.01" min={0.01} value={form.hourly_max ?? ""} onChange={(e) => set("hourly_max", numberOrNull(e.target.value))} data-testid="vacancy-hourlymax-input" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="period">{t("vf.payPeriod")}</Label>
                <select id="period" value={form.salary_period} onChange={(e) => set("salary_period", e.target.value as SalaryPeriod)} data-testid="vacancy-period-select" className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="hour">{t("vf.perHour")}</option>
                  <option value="month">{t("vf.perMonth")}</option>
                </select>
              </div>
            </div>
          </fieldset>

          <div>
            <Label htmlFor="schedule">{t("vf.schedule")} <span className="font-normal text-muted-foreground">({t("vf.optional")})</span></Label>
            <Input id="schedule" value={form.schedule} maxLength={300} placeholder={t("vf.schedulePlaceholder")} onChange={(e) => set("schedule", e.target.value)} data-testid="vacancy-schedule-input" className="mt-1.5" />
            <div className="mt-2 flex flex-wrap gap-4" role="group" aria-label={t("vf.scheduleTags")}>
              {SCHEDULE_TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.schedule_tags.includes(tag)}
                    onCheckedChange={(c) =>
                      set("schedule_tags", c ? [...form.schedule_tags, tag] : form.schedule_tags.filter((x) => x !== tag))
                    }
                    data-testid={`vacancy-tag-${tag}`}
                  />
                  {t(`label.schedule_${tag}`)}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="start">{t("vf.start")} <span className="font-normal text-muted-foreground">({t("vf.optional")})</span></Label>
              <Input id="start" type="date" value={form.start_date ?? ""} onChange={(e) => set("start_date", e.target.value || null)} data-testid="vacancy-start-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="closes">{t("vf.closes")}</Label>
              <Input
                id="closes"
                type="date"
                required={form.published}
                min={localDate(new Date().toISOString())}
                value={localDate(form.valid_through)}
                onChange={(e) => set("valid_through", e.target.value ? endOfDayIso(e.target.value) : null)}
                data-testid="vacancy-closes-input"
                className="mt-1.5"
                aria-describedby="closes-hint"
              />
              <p id="closes-hint" className="mt-1 text-xs text-muted-foreground">{t("vf.closesHint")}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="desc">{t("vf.description")}</Label>
            <p id="desc-fair" className="mt-1 text-xs leading-relaxed text-muted-foreground" data-testid="vacancy-fair-hint">
              <span className="font-semibold text-foreground">{t("vf.fairTitle")}.</span> {t("vf.fairHint")}
            </p>
            <Textarea id="desc" rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="vacancy-description-input" className="mt-1.5" aria-describedby="desc-fair" />
          </div>
          <div>
            <Label htmlFor="reqs">{t("vf.requirements")}</Label>
            <Textarea id="reqs" rows={4} value={reqText} onChange={(e) => setReqText(e.target.value)} data-testid="vacancy-requirements-input" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="perks">{t("vf.perks")}</Label>
            <Textarea id="perks" rows={3} value={perkText} onChange={(e) => setPerkText(e.target.value)} data-testid="vacancy-perks-input" className="mt-1.5" />
          </div>

          <FairnessHints
            text={{
              title: form.title,
              description: form.description,
              schedule: form.schedule,
              requirements: lines(reqText),
              perks: lines(perkText),
            }}
          />

          <label className="flex items-center gap-2.5 text-sm font-medium">
            <Checkbox
              checked={form.cv_required}
              onCheckedChange={(c) => set("cv_required", Boolean(c))}
              data-testid="vacancy-cv-required-checkbox"
            />
            {t("vf.cvRequired")}
          </label>

          <label className="flex items-center gap-2.5 text-sm font-medium">
            <Checkbox
              checked={form.published}
              onCheckedChange={(c) => set("published", Boolean(c))}
              data-testid="vacancy-published-checkbox"
            />
            {t("vf.publishNow")}
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending} data-testid="vacancy-submit-button">
              {save.isPending ? t("common.saving") : editing ? t("vf.saveChanges") : t("vf.create")}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/employer/dashboard")} data-testid="vacancy-cancel-button">
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
