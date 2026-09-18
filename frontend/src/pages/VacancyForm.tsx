import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useLang } from "@/lib/i18n";
import {
  CATEGORIES,
  CITIES,
  ENGLISH_LEVELS,
  JOB_TYPES,
  PERMITS,
  type EnglishLevel,
  type Job,
  type JobInput,
  type JobType,
  type PermitSupport,
} from "@/lib/types";

const EMPTY: JobInput = {
  title: "",
  city: "Amsterdam",
  category: CATEGORIES[0],
  job_type: "part_time",
  english_level: "english_only",
  permit_support: "twv_provided",
  hourly_min: 15,
  hourly_max: 18,
  hours_per_week: 16,
  description: "",
  requirements: [],
  perks: [],
  published: true,
};

export default function VacancyForm() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const editing = Boolean(jobId);
  const [form, setForm] = useState<JobInput>(EMPTY);
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
    const { id: _id, company_id: _c, company_name: _n, created_at: _d, ...rest } = job;
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
        requirements: reqText.split("\n").map((s) => s.trim()).filter(Boolean),
        perks: perkText.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      return editing
        ? apiPut<Job>(`/employer/jobs/${jobId}`, payload)
        : apiPost<Job>("/employer/jobs", payload);
    },
    onSuccess: () => {
      toast.success(editing ? t("vf.updated") : t("vf.created"));
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/employer/dashboard");
    },
    onError: () => toast.error(t("vf.failed")),
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
              <Label htmlFor="hours">{t("vf.hours")}</Label>
              <Input id="hours" type="number" min={1} max={40} value={form.hours_per_week} onChange={(e) => set("hours_per_week", Number(e.target.value))} data-testid="vacancy-hours-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="hmin">{t("vf.rateFrom")}</Label>
              <Input id="hmin" type="number" step="0.5" min={1} value={form.hourly_min} onChange={(e) => set("hourly_min", Number(e.target.value))} data-testid="vacancy-hourlymin-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="hmax">{t("vf.rateTo")}</Label>
              <Input id="hmax" type="number" step="0.5" min={1} value={form.hourly_max} onChange={(e) => set("hourly_max", Number(e.target.value))} data-testid="vacancy-hourlymax-input" className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="desc">{t("vf.description")}</Label>
            <Textarea id="desc" rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="vacancy-description-input" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="reqs">{t("vf.requirements")}</Label>
            <Textarea id="reqs" rows={4} value={reqText} onChange={(e) => setReqText(e.target.value)} data-testid="vacancy-requirements-input" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="perks">{t("vf.perks")}</Label>
            <Textarea id="perks" rows={3} value={perkText} onChange={(e) => setPerkText(e.target.value)} data-testid="vacancy-perks-input" className="mt-1.5" />
          </div>

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
