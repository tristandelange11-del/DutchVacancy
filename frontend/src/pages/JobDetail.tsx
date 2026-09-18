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
import { useSession } from "@/lib/session";
import {
  ENGLISH_LEVEL_LABELS,
  JOB_TYPE_LABELS,
  PERMIT_LABELS,
  type Application,
  type JobDetail as JobDetailType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export default function JobDetail() {
  const { jobId = "" } = useParams();
  const { user } = useSession();
  const toggleSave = useToggleSave();
  const [open, setOpen] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [cvUrl, setCvUrl] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => apiGet<JobDetailType>(`/jobs/${jobId}`),
    retry: false,
  });

  const apply = useMutation({
    mutationFn: () =>
      apiPost<Application>(`/jobs/${jobId}/apply`, { motivation, cv_url: cvUrl }),
    onSuccess: () => {
      toast.success("Application sent — track it in your dashboard");
      setOpen(false);
      setMotivation("");
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: string })?.detail : null;
      toast.error(detail ?? "Could not send your application");
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
          <h1 className="font-heading text-2xl font-extrabold">Vacancy unavailable</h1>
          <p className="mt-3 text-muted-foreground">
            This vacancy may have been closed or the job service is unreachable right now.
          </p>
          <Link to="/jobs" className={cn(buttonVariants(), "mt-6")} data-testid="job-back-to-jobs">
            Back to all jobs
          </Link>
        </div>
      </Layout>
    );
  }

  const { job, company } = data;
  const isStudent = user?.role === "student";

  function handleApplyClick() {
    if (!user) {
      toast.error("Log in as a student to apply");
      return;
    }
    if (!isStudent) {
      toast.error("Only student accounts can apply to vacancies");
      return;
    }
    setCvUrl(user.profile.cv_url ?? "");
    setOpen(true);
  }

  return (
    <Layout>
      <div className="bg-navy py-10 text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-primary" data-testid="job-detail-back">
            <ArrowLeft className="h-4 w-4" /> All vacancies
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
                <Badge className="bg-[#EFF6FF] text-[#1E40AF]">{ENGLISH_LEVEL_LABELS[job.english_level]}</Badge>
                <Badge className="bg-white/10 text-white">{JOB_TYPE_LABELS[job.job_type]}</Badge>
                {job.permit_support !== "none" && (
                  <Badge className="bg-[#F0FDF4] text-[#166534]">{PERMIT_LABELS[job.permit_support]}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold">About this role</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground" data-testid="job-detail-description">
              {job.description}
            </p>
            {job.requirements.length > 0 && (
              <>
                <h3 className="mt-7 font-heading text-base font-bold">What you bring</h3>
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
                <h3 className="mt-7 font-heading text-base font-bold">What you get</h3>
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
                <Building2 className="h-5 w-5 text-primary" /> About {company.name}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{company.about}</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Industry</dt><dd className="font-medium">{company.industry || "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Base</dt><dd className="font-medium">{company.city || "—"}</dd></div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Website</dt>
                  <dd className="truncate font-medium">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Globe className="h-3.5 w-3.5" /> Visit
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
            <p className="text-sm text-muted-foreground">gross per hour</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-muted-foreground" /> {job.city}</li>
              <li className="flex items-center gap-2.5"><CalendarClock className="h-4 w-4 text-muted-foreground" /> {job.hours_per_week} hours per week</li>
              <li className="flex items-center gap-2.5"><Users className="h-4 w-4 text-muted-foreground" /> {job.applicant_count} applicant{job.applicant_count === 1 ? "" : "s"}</li>
            </ul>

            {job.applied ? (
              <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700" data-testid="job-already-applied">
                You already applied to this role
              </div>
            ) : (
              <Button className="mt-6 w-full" size="lg" onClick={handleApplyClick} data-testid="job-apply-button">
                Apply now
              </Button>
            )}

            <Button
              variant="outline"
              className="mt-2 w-full gap-2"
              data-testid="job-save-button"
              onClick={() => {
                if (!isStudent) {
                  toast.error("Log in as a student to save jobs");
                  return;
                }
                toggleSave.mutate(job, {
                  onSuccess: () => toast.success(job.saved ? "Removed from saved jobs" : "Job saved"),
                });
              }}
            >
              {job.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {job.saved ? "Saved" : "Save job"}
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-accent p-5 text-accent-foreground">
            <h3 className="font-heading text-sm font-bold">Know your rights</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Non-EU students may work 16 hours a week during term, or full-time in June–August.
              Your employer arranges the TWV permit — never pay for one yourself.
            </p>
            <Link to="/guide" className="mt-3 inline-block text-sm font-semibold underline" data-testid="job-guide-link">
              Read the student guide
            </Link>
          </div>
        </aside>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="apply-dialog">
          <DialogHeader>
            <DialogTitle>Apply — {job.title}</DialogTitle>
            <DialogDescription>
              {job.company_name} sees your name, university, CV link and motivation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivation">Why are you a good fit? *</Label>
              <Textarea
                id="motivation"
                rows={6}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Tell the employer about your studies, availability and why this role fits you (min. 10 characters)."
                data-testid="apply-motivation-input"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="cv">CV link (optional)</Label>
              <Input
                id="cv"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                data-testid="apply-cv-input"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} data-testid="apply-cancel-button">
              Cancel
            </Button>
            <Button
              onClick={() => apply.mutate()}
              disabled={motivation.trim().length < 10 || apply.isPending}
              data-testid="apply-submit-button"
            >
              {apply.isPending ? "Sending…" : "Send application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
