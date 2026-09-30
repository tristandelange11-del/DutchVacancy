import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@/lib/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Euro,
  FileText,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import CvUploadField from "@/components/CvUploadField";
import GuideLinks from "@/components/GuideLinks";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToggleSave } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { apiErrorText, formatDate, formatPay } from "@/lib/jobFormat";
import { useSession } from "@/lib/session";
import { jobPostingJsonLd, useSeo } from "@/lib/seo";
import type { Application, JobDetail as JobDetailType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function JobDetail() {
  const { jobId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const { t, lang } = useLang();
  const toggleSave = useToggleSave();
  const [open, setOpen] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [cv, setCv] = useState({ url: "", filename: "" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => apiGet<JobDetailType>(`/jobs/${jobId}`),
    retry: false,
  });

  const apply = useMutation({
    mutationFn: () =>
      apiPost<Application>(`/jobs/${jobId}/apply`, {
        motivation,
        cv_url: cv.url,
        cv_filename: cv.filename,
      }),
    onSuccess: () => {
      // Only here: the server stored the application, so it counts exactly once.
      track("Apply Complete", { job_id: jobId });
      toast.success(t("detail.sent"));
      setOpen(false);
      setMotivation("");
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err) => {
      toast.error(apiErrorText(err, t, t("detail.sendFailed")));
    },
  });

  // Hooks run before the loading/error returns: on the first paint the fallback
  // copy applies, then the real vacancy title, summary and JobPosting JSON-LD.
  // A closed vacancy is kept out of search and carries no JobPosting markup.
  const seoJob = data?.job;
  const seoPay = seoJob ? formatPay(seoJob, t) : null;
  useSeo({
    title: seoJob ? `${seoJob.title} — ${seoJob.company_name}, ${seoJob.city}` : t("detail.seoFallbackTitle"),
    description: seoJob
      ? [
          `${seoJob.title} — ${seoJob.company_name}, ${seoJob.city}.`,
          seoJob.hours_per_week != null ? `${seoJob.hours_per_week} ${t("detail.hoursWeek")}.` : "",
          seoPay ? `${seoPay}.` : "",
          seoJob.description,
        ]
          .filter(Boolean)
          .join(" ")
          .slice(0, 300)
      : t("detail.seoFallbackDescription"),
    type: "article",
    // An unknown or closed vacancy is kept out of search (no soft 404s).
    noindex: seoJob ? !seoJob.is_open : isError,
    jsonLd: seoJob && seoJob.is_open ? jobPostingJsonLd(seoJob, data?.company ?? null) : null,
  });

  const viewedId = seoJob?.id;
  useEffect(() => {
    if (viewedId) track("Job View", { job_id: viewedId });
  }, [viewedId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center" data-testid="job-not-found">
          <h1 className="font-heading text-2xl font-extrabold">{t("detail.unavailableTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("detail.unavailableBody")}</p>
          <Link to="/jobs" className={cn(buttonVariants(), "mt-6")} data-testid="job-back-to-jobs">
            {t("detail.backToJobs")}
          </Link>
        </div>
      </Layout>
    );
  }

  const { job, company } = data;
  const isStudent = user?.role === "student";
  const pay = formatPay(job, t);
  const closes = formatDate(job.closes_at, lang);

  function handleApplyClick() {
    track("Apply Start", { job_id: job.id, source: user ? "account" : "signup" });
    if (!user) {
      // Straight into sign-up with a way back here, instead of a toast with no next step.
      navigate(`/register?next=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }
    if (!isStudent) {
      toast.error(t("detail.applyStudentOnly"));
      return;
    }
    setCv({ url: user.profile.cv_url ?? "", filename: user.profile.cv_filename ?? "" });
    setOpen(true);
  }

  return (
    <Layout>
      <div className="bg-navy py-10 text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-primary" data-testid="job-detail-back">
            <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
          </Link>
          <div className="mt-5 flex flex-wrap items-start gap-5">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 font-heading text-lg font-bold">
              {company?.logo_initials || job.company_name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-3xl font-extrabold leading-tight" data-testid="job-detail-title">
                {job.title}
              </h1>
              <p className="mt-1.5 text-slate-300" data-testid="job-detail-company">
                {job.company_name} · {job.city}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="bg-[#EFF6FF] text-[#1E40AF]">{t(`label.${job.english_level}`)}</Badge>
                <Badge className="bg-white/10 text-white">{t(`label.${job.job_type}`)}</Badge>
                <Badge className="bg-white/10 text-white" data-testid="job-detail-workmode">
                  {t(`label.${job.work_mode}`)}
                </Badge>
                {job.permit_support !== "none" && (
                  <Badge className="bg-[#F0FDF4] text-[#166534]">{t(`label.${job.permit_support}`)}</Badge>
                )}
                {job.schedule_tags.map((tag) => (
                  <Badge key={tag} className="bg-white/10 text-white">{t(`label.schedule_${tag}`)}</Badge>
                ))}
              </div>
            </div>
          </div>
          {!job.is_open && (
            <div className="mt-6 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm" role="status" data-testid="job-closed-banner">
              <p className="font-semibold text-white">{t("detail.closedTitle")}</p>
              <p className="mt-1 text-slate-300">
                {closes ? `${t("detail.closedOn")} ${closes}. ` : ""}
                {t("detail.closedBody")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold">{t("detail.about")}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground" data-testid="job-detail-description">
              {job.description}
            </p>
            {job.requirements.length > 0 && (
              <>
                <h3 className="mt-7 font-heading text-base font-bold">{t("detail.requirements")}</h3>
                <ul className="mt-3 space-y-2" data-testid="job-detail-requirements">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {r}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {job.perks.length > 0 && (
              <>
                <h3 className="mt-7 font-heading text-base font-bold">{t("detail.perks")}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.perks.map((p) => (
                    <Badge key={p} variant="secondary">{p}</Badge>
                  ))}
                </div>
              </>
            )}
          </section>

          {company && (
            <section className="rounded-2xl border border-border bg-card p-6" data-testid="job-detail-employer">
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold">
                <Building2 className="h-5 w-5 text-primary" /> {t("detail.aboutCompany")} {company.name}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{company.about}</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("detail.industry")}</dt><dd className="font-medium">{company.industry || "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("detail.base")}</dt><dd className="font-medium">{company.city || "—"}</dd></div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{t("detail.website")}</dt>
                  <dd className="truncate font-medium">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Globe className="h-3.5 w-3.5" /> {t("detail.visit")}
                      </a>
                    ) : "—"}
                  </dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-6">
            {pay ? (
              <>
                <p className="flex items-center gap-2 font-heading text-2xl font-extrabold" data-testid="job-detail-rate">
                  <Euro className="h-5 w-5 text-primary" />
                  {pay}
                </p>
                <p className="text-sm text-muted-foreground">{t("detail.gross")}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="job-detail-rate">{t("job.payNotStated")}</p>
            )}
            <dl className="mt-5 space-y-3 text-sm" data-testid="job-detail-facts">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div><dt className="sr-only">{t("detail.location")}</dt><dd>{job.city} · {t(`label.${job.work_mode}`)}</dd></div>
              </div>
              {job.hours_per_week != null && (
                <div className="flex items-start gap-2.5">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div><dt className="sr-only">{t("detail.hours")}</dt><dd>{job.hours_per_week} {t("detail.hoursWeek")}</dd></div>
                </div>
              )}
              {job.schedule && (
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div><dt className="text-xs text-muted-foreground">{t("detail.schedule")}</dt><dd>{job.schedule}</dd></div>
                </div>
              )}
              {job.contract_type && (
                <div className="flex items-start gap-2.5">
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div><dt className="text-xs text-muted-foreground">{t("detail.contract")}</dt><dd>{t(`label.contract_${job.contract_type}`)}</dd></div>
                </div>
              )}
              {job.start_date && (
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div><dt className="text-xs text-muted-foreground">{t("detail.start")}</dt><dd>{formatDate(job.start_date, lang)}</dd></div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">{t("detail.published")}</dt>
                  <dd data-testid="job-detail-posted">{formatDate(job.created_at, lang)}</dd>
                </div>
              </div>
              {closes && (
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">{job.is_open ? t("detail.closes") : t("detail.closedOn")}</dt>
                    <dd data-testid="job-detail-closes">{closes}</dd>
                  </div>
                </div>
              )}
              {job.cv_required && (
                <div className="flex items-start gap-2.5">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div><dt className="sr-only">{t("detail.cvLabel")}</dt><dd>{t("detail.cvRequired")}</dd></div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="sr-only">{t("detail.applicants")}</dt>
                  <dd>{job.applicant_count} {job.applicant_count === 1 ? t("detail.applicant") : t("detail.applicants")}</dd>
                </div>
              </div>
            </dl>

            {job.applied ? (
              <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700" data-testid="job-already-applied">
                {t("detail.alreadyApplied")}
              </div>
            ) : job.is_open ? (
              <Button className="mt-6 w-full" size="lg" onClick={handleApplyClick} data-testid="job-apply-button">
                {t("detail.applyNow")}
              </Button>
            ) : (
              <Link to="/jobs" className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")} data-testid="job-closed-browse">
                {t("detail.closedBrowse")}
              </Link>
            )}

            <Button
              variant="outline"
              className="mt-2 w-full gap-2"
              data-testid="job-save-button"
              onClick={() => {
                if (!isStudent) {
                  toast.error(t("toast.saveLogin"));
                  return;
                }
                toggleSave.mutate(job, {
                  onSuccess: () => toast.success(job.saved ? t("toast.unsaved") : t("toast.saved")),
                });
              }}
            >
              {job.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {job.saved ? t("job.saved") : t("job.save")}
            </Button>
          </div>

          <GuideLinks job={job} />
        </aside>
      </div>

      {job.is_open && !job.applied && <div className="h-20 lg:hidden" aria-hidden="true" />}
      {job.is_open && !job.applied && (
        // On phones the facts card with the apply button sits below the description;
        // this keeps the next step in reach without scrolling.
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden" data-testid="job-apply-bar">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{pay ?? job.title}</p>
            <Button onClick={handleApplyClick} data-testid="job-apply-bar-button">
              {t("detail.applyNow")}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="apply-dialog">
          <DialogHeader>
            <DialogTitle>
              {t("detail.applyTitle")} — {job.title}
            </DialogTitle>
            <DialogDescription>
              {job.company_name} {t("detail.applyDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivation">{t("detail.motivation")}</Label>
              <Textarea
                id="motivation"
                rows={6}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder={t("detail.motivationPlaceholder")}
                data-testid="apply-motivation-input"
                className="mt-1.5"
                aria-describedby="motivation-hint"
              />
              <p id="motivation-hint" className="mt-1.5 text-xs text-muted-foreground" data-testid="apply-motivation-hint">
                {motivation.trim().length < 10
                  ? `${t("detail.motivationMin")} (${motivation.trim().length}/10)`
                  : t("detail.motivationOk")}
              </p>
            </div>
            <div>
              <Label>{t("detail.cvLabel")}</Label>
              <div className="mt-1.5">
                <CvUploadField
                  url={cv.url}
                  filename={cv.filename}
                  testidPrefix="apply"
                  onChange={setCv}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {job.cv_required ? t("detail.cvRequiredHint") : t("cv.applyHint")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="apply-cancel-button">
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => apply.mutate()}
              disabled={motivation.trim().length < 10 || (job.cv_required && !cv.url) || apply.isPending}
              data-testid="apply-submit-button"
            >
              {apply.isPending ? t("detail.sending") : t("detail.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
