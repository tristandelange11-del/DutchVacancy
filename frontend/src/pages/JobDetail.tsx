import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  Euro,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { euro } from "@/components/JobCard";
import CvUploadField from "@/components/CvUploadField";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToggleSave } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import type { Application, JobDetail as JobDetailType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function JobDetail() {
  const { jobId = "" } = useParams();
  const { user } = useSession();
  const { t } = useLang();
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
      toast.success(t("detail.sent"));
      setOpen(false);
      setMotivation("");
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: string })?.detail : null;
      toast.error(detail ?? t("detail.sendFailed"));
    },
  });

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

  function handleApplyClick() {
    if (!user) {
      toast.error(t("detail.applyLogin"));
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
                {job.permit_support !== "none" && (
                  <Badge className="bg-[#F0FDF4] text-[#166534]">{t(`label.${job.permit_support}`)}</Badge>
                )}
              </div>
            </div>
          </div>
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
            <p className="flex items-center gap-2 font-heading text-2xl font-extrabold" data-testid="job-detail-rate">
              <Euro className="h-5 w-5 text-primary" />
              {euro(job.hourly_min)} – {euro(job.hourly_max)}
            </p>
            <p className="text-sm text-muted-foreground">{t("detail.gross")}</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-muted-foreground" /> {job.city}</li>
              <li className="flex items-center gap-2.5"><CalendarClock className="h-4 w-4 text-muted-foreground" /> {job.hours_per_week} {t("detail.hoursWeek")}</li>
              <li className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-muted-foreground" /> {job.applicant_count}{" "}
                {job.applicant_count === 1 ? t("detail.applicant") : t("detail.applicants")}
              </li>
            </ul>

            {job.applied ? (
              <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700" data-testid="job-already-applied">
                {t("detail.alreadyApplied")}
              </div>
            ) : (
              <Button className="mt-6 w-full" size="lg" onClick={handleApplyClick} data-testid="job-apply-button">
                {t("detail.applyNow")}
              </Button>
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

          <div className="rounded-2xl border border-border bg-accent p-5 text-accent-foreground">
            <h3 className="font-heading text-sm font-bold">{t("detail.rightsTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed">{t("detail.rightsBody")}</p>
            <Link to="/guide" className="mt-3 inline-block text-sm font-semibold underline" data-testid="job-guide-link">
              {t("detail.rightsLink")}
            </Link>
          </div>
        </aside>
      </div>

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
              />
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
              <p className="mt-1.5 text-xs text-muted-foreground">{t("cv.applyHint")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="apply-cancel-button">
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => apply.mutate()}
              disabled={motivation.trim().length < 10 || apply.isPending}
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
