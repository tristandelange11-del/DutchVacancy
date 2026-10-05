import { useState } from "react";
import { Link } from "@/lib/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, Pencil, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { apiErrorText, formatDate, formatPay } from "@/lib/jobFormat";
import CvPreview from "@/components/CvPreview";
import DeleteAccount from "@/components/DeleteAccount";
import InterviewDialog from "@/components/InterviewDialog";
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
  type JobWithMeta,
  type PublicConfig,
} from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { useSeo } from "@/lib/seo";

type VacancyState = "draft" | "pending" | "rejected" | "open" | "closed";

const STATE_CLASSES: Record<VacancyState, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending: "bg-sky-50 text-sky-800",
  rejected: "bg-red-50 text-red-700",
  open: "bg-green-50 text-green-700",
  closed: "bg-amber-50 text-amber-800",
};

const STATE_LABELS: Record<VacancyState, string> = {
  draft: "ed.draft",
  pending: "ed.pending",
  rejected: "ed.rejected",
  open: "ed.statPublished",
  closed: "job.closed",
};

function vacancyState(job: JobWithMeta): VacancyState {
  if (!job.published) return "draft";
  if (job.moderation_status === "pending" || job.moderation_status === "rejected") return job.moderation_status;
  return job.is_open ? "open" : "closed";
}

export default function EmployerDashboard() {
  const { user } = useSession();
  const { t, lang } = useLang();
  useSeo({
    title: "Employer dashboard",
    description: "Manage your vacancies and review student applicants.",
    noindex: true,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [interviewFor, setInterviewFor] = useState<Application | null>(null);

  const jobs = useQuery({ queryKey: ["employer-jobs"], queryFn: () => apiGet<JobWithMeta[]>("/employer/jobs") });
  const applicants = useQuery({
    queryKey: ["employer-applications"],
    queryFn: () => apiGet<Application[]>("/employer/applications"),
  });
  const config = useQuery({ queryKey: ["public-config"], queryFn: () => apiGet<PublicConfig>("/config") });

  const togglePublish = useMutation({
    mutationFn: (job: Job) =>
      apiPut<Job>(`/employer/jobs/${job.id}`, { ...job, published: !job.published }),
    onSuccess: (job) => {
      toast.success(job.published ? t("ed.published") : t("ed.unpublished"));
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err) => toast.error(apiErrorText(err, t, t("ed.updateFailed"))),
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
              { label: t("ed.statPublished"), value: jobList.filter((j) => j.published && j.moderation_status === "approved").length, testid: "employer-stat-published" },
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
                {jobList.map((job) => {
                  const state = vacancyState(job);
                  const pastClosing = job.closes_at ? new Date(job.closes_at) <= new Date() : false;
                  return (
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
                          <Badge className={STATE_CLASSES[state]} data-testid={`employer-vacancy-state-${job.id}`}>
                            {t(STATE_LABELS[state])}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {[
                            job.city,
                            t(`label.${job.job_type}`),
                            t(`label.${job.english_level}`),
                            formatPay(job, t),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {job.closes_at && (
                          <p className="mt-0.5 text-xs text-muted-foreground" data-testid={`employer-vacancy-closes-${job.id}`}>
                            {pastClosing ? t("detail.closedOn") : t("detail.closes")} {formatDate(job.closes_at, lang)}
                            {pastClosing && job.published ? ` — ${t("ed.extendHint")}` : ""}
                          </p>
                        )}
                        {state === "pending" && (
                          <p className="mt-2 text-sm text-sky-800" data-testid={`employer-vacancy-moderation-${job.id}`}>
                            {t("ed.pendingHint")}
                          </p>
                        )}
                        {state === "rejected" && (
                          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" data-testid={`employer-vacancy-moderation-${job.id}`}>
                            <span className="font-semibold">{t("ed.rejectedReason")}</span> {job.moderation_note}{" "}
                            {t("ed.rejectedAction")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {config.data?.payments_enabled && job.is_open && !(job.fresh_until && new Date(job.fresh_until) > new Date()) && (
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
                  );
                })}
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
                        onChange={(e) => {
                          const next = e.target.value as AppStatus;
                          if (next === "interview") setInterviewFor(a);
                          else setStatus.mutate({ id: a.id, status: next });
                        }}
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
                      {a.status === "interview" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInterviewFor(a)}
                          data-testid={`applicant-interview-button-${a.id}`}
                        >
                          {a.interview ? t("iv.reschedule") : t("iv.propose")}
                        </Button>
                      )}
                    </div>
                    {a.status === "interview" && a.interview && (
                      <p className="mt-3 text-sm text-muted-foreground" data-testid={`applicant-interview-info-${a.id}`}>
                        {a.interview.chosen_slot ? (
                          <span className="font-medium text-green-700">
                            {t("iv.scheduled")}: {formatDateTime(a.interview.chosen_slot, lang)}
                          </span>
                        ) : (
                          t("iv.awaiting")
                        )}
                        {" · "}
                        {a.interview.location}
                        {a.interview.chosen_slot && (
                          <>
                            {" · "}
                            <a
                              href={`/api/employer/applications/${a.id}/interview.ics`}
                              className="font-medium text-primary underline"
                              data-testid={`applicant-interview-ics-${a.id}`}
                            >
                              {t("iv.addToCalendar")}
                            </a>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        <DeleteAccount />
      </div>
      {interviewFor && (
        <InterviewDialog key={interviewFor.id} application={interviewFor} onClose={() => setInterviewFor(null)} />
      )}
    </Layout>
  );
}
