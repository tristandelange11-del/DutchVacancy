import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, Pencil, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { euro } from "@/components/JobCard";
import CvPreview from "@/components/CvPreview";
import DeleteAccount from "@/components/DeleteAccount";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError, apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import {
  STATUSES,
  STATUS_CLASSES,
  type AppStatus,
  type Application,
  type CheckoutResponse,
  type Job,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSeo } from "@/lib/seo";

export default function EmployerDashboard() {
  const { user } = useSession();
  const { t } = useLang();
  useSeo({
    title: "Employer dashboard",
    description: "Manage your vacancies and review student applicants.",
    noindex: true,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");

  const jobs = useQuery({ queryKey: ["employer-jobs"], queryFn: () => apiGet<Job[]>("/employer/jobs") });
  const applicants = useQuery({
    queryKey: ["employer-applications"],
    queryFn: () => apiGet<Application[]>("/employer/applications"),
  });

  const togglePublish = useMutation({
    mutationFn: (job: Job) =>
      apiPut<Job>(`/employer/jobs/${job.id}`, { ...job, published: !job.published }),
    onSuccess: (job) => {
      toast.success(job.published ? t("ed.published") : t("ed.unpublished"));
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => toast.error(t("ed.updateFailed")),
  });

  const removeJob = useMutation({
    mutationFn: (id: string) => apiDelete(`/employer/jobs/${id}`),
    onSuccess: () => {
      toast.success(t("ed.deleted"));
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["employer-applications"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => toast.error(t("ed.deleteFailed")),
  });

  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: AppStatus }) =>
      apiPatch<Application>(`/employer/applications/${vars.id}`, { status: vars.status }),
    onSuccess: () => {
      toast.success(t("ed.statusUpdated"));
      queryClient.invalidateQueries({ queryKey: ["employer-applications"] });
    },
    onError: () => toast.error(t("ed.statusFailed")),
  });

  const startFresh = useMutation({
    mutationFn: (jobId: string) => apiPost<CheckoutResponse>(`/employer/jobs/${jobId}/fresh-checkout`),
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: string })?.detail : null;
      toast.error(detail ?? t("ed.freshFailed"));
    },
  });

  const jobList = jobs.data ?? [];
  const appList = (applicants.data ?? []).filter((a) => !statusFilter || a.status === statusFilter);

  return (
    <Layout>
      <div className="bg-navy py-10 text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-200">{t("ed.eyebrow")}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-heading text-3xl font-extrabold" data-testid="employer-dashboard-heading">
              {user?.company_name ?? t("ed.company")}
            </h1>
            <Link to="/employer/vacancies/new" className={cn(buttonVariants(), "gap-2")} data-testid="employer-new-vacancy-link">
              <Plus className="h-4 w-4" /> {t("ed.post")}
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-lg">
            {[
              { label: t("ed.statPublished"), value: jobList.filter((j) => j.published).length, testid: "employer-stat-published" },
              { label: t("ed.statDrafts"), value: jobList.filter((j) => !j.published).length, testid: "employer-stat-drafts" },
              { label: t("ed.statApplicants"), value: (applicants.data ?? []).length, testid: "employer-stat-applicants" },
            ].map((s) => (
              <div key={s.testid} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-heading text-2xl font-extrabold text-primary" data-testid={s.testid}>{s.value}</p>
                <p className="text-xs text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Tabs defaultValue="vacancies">
          <TabsList variant="line" data-testid="employer-tabs">
            <TabsTrigger value="vacancies" data-testid="employer-tab-vacancies" className="gap-2">
              <BriefcaseBusiness className="h-4 w-4" /> {t("ed.tabVacancies")}
            </TabsTrigger>
            <TabsTrigger value="applicants" data-testid="employer-tab-applicants" className="gap-2">
              <Users className="h-4 w-4" /> {t("ed.tabApplicants")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vacancies" className="pt-7">
            {jobList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center" data-testid="employer-vacancies-empty">
                <h3 className="font-heading text-lg font-bold">{t("ed.emptyVacTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("ed.emptyVacBody")}</p>
                <Link to="/employer/vacancies/new" className={buttonVariants({ className: "mt-5" })} data-testid="employer-empty-new-link">
                  {t("ed.post")}
                </Link>
              </div>
            ) : (
              <div className="space-y-3" data-testid="employer-vacancies-list">
                {jobList.map((job) => (
                  <div
                    key={job.id}
                    data-testid={`employer-vacancy-${job.id}`}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/jobs/${job.id}`} className="font-heading text-base font-bold hover:text-primary" data-testid={`employer-vacancy-title-${job.id}`}>
                          {job.title}
                        </Link>
                        <Badge
                          className={job.published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}
                          data-testid={`employer-vacancy-state-${job.id}`}
                        >
                          {job.published ? t("ed.statPublished") : t("ed.draft")}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {job.city} · {t(`label.${job.job_type}`)} · {t(`label.${job.english_level}`)} ·{" "}
                        {euro(job.hourly_min)}–{euro(job.hourly_max)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {job.published && !(job.fresh_until && new Date(job.fresh_until) > new Date()) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-orange-200 text-orange-800 hover:bg-orange-50"
                          onClick={() => startFresh.mutate(job.id)}
                          disabled={startFresh.isPending}
                        >
                          <Sparkles className="h-3.5 w-3.5" /> {t("ed.fresh")}
                        </Button>
                      )}
                      {job.fresh_until && new Date(job.fresh_until) > new Date() && (
                        <Badge className="bg-orange-50 text-orange-800">{t("ed.freshActive")}</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublish.mutate(job)}
                        data-testid={`employer-toggle-publish-${job.id}`}
                      >
                        {job.published ? t("ed.unpublish") : t("ed.publish")}
                      </Button>
                      <Link
                        to={`/employer/vacancies/${job.id}/edit`}
                        className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                        aria-label={t("ed.editAria")}
                        data-testid={`employer-edit-${job.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={t("ed.deleteAria")}
                        onClick={() => removeJob.mutate(job.id)}
                        data-testid={`employer-delete-${job.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applicants" className="pt-7">
            <div className="mb-5 flex flex-wrap gap-2" data-testid="applicant-filter-row">
              {[{ value: "", label: t("ed.filterAll") }, ...STATUSES.map((s) => ({ value: s, label: t(`label.${s}`) }))].map((o) => (
                <button
                  key={o.value || "all"}
                  type="button"
                  data-testid={`applicant-filter-${o.value || "all"}`}
                  onClick={() => setStatusFilter(o.value)}
                  className={cn(
                    "rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors duration-150 hover:border-primary/60",
                    statusFilter === o.value && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {appList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center" data-testid="employer-applicants-empty">
                <h3 className="font-heading text-lg font-bold">{t("ed.emptyAppsTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("ed.emptyAppsBody")}</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="employer-applicants-list">
                {appList.map((a) => (
                  <div key={a.id} data-testid={`applicant-row-${a.id}`} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-base font-bold" data-testid={`applicant-name-${a.id}`}>{a.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {a.student_email}
                          {a.student_university ? ` · ${a.student_university}` : ""}
                        </p>
                        <p className="mt-1 text-sm font-medium text-primary">{a.job_title}</p>
                      </div>
                      <Badge className={STATUS_CLASSES[a.status]} data-testid={`applicant-status-${a.id}`}>
                        {t(`label.${a.status}`)}
                      </Badge>
                    </div>
                    <p className="mt-3 rounded-xl bg-secondary p-3 text-sm leading-relaxed text-muted-foreground">
                      {a.motivation}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <select
                        value={a.status}
                        onChange={(e) => setStatus.mutate({ id: a.id, status: e.target.value as AppStatus })}
                        data-testid={`applicant-status-select-${a.id}`}
                        aria-label={t("ed.statApplicants")}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{t(`label.${s}`)}</option>
                        ))}
                      </select>
                      {a.cv_url && (
                        <CvPreview url={a.cv_url} filename={a.cv_filename} testidSuffix={a.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        <DeleteAccount />
      </div>
    </Layout>
  );
}
