import { useState } from "react";
import { Link, useParams } from "@/lib/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { apiErrorText, formatDate, formatPay } from "@/lib/jobFormat";
import { useSeo } from "@/lib/seo";
import type { OkResponse, ReviewDecision, ReviewView } from "@/lib/types";
import { cn } from "@/lib/utils";

const MIN_NOTE = 10;

/** `text` with every flagged phrase marked, matched the way the backend matched it. */
function Highlighted({ text, phrases }: { text: string; phrases: string[] }) {
  if (phrases.length === 0) return <>{text}</>;
  const pattern = phrases
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"))
    .join("|");
  // split() with a capture group puts the matches at the odd indexes.
  const parts = text.split(new RegExp(`(${pattern})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-amber-200 px-0.5 text-amber-950">{part}</mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * The page behind the single-use link in a review mail (backend/routers/moderation.py).
 * Opening it changes nothing; only the approve or refuse button decides.
 */
export default function Review() {
  const { token = "" } = useParams();
  const { t, lang } = useLang();
  useSeo({ title: "Review vacancy", description: "Review a vacancy before it goes online.", noindex: true });
  const [note, setNote] = useState("");
  const [done, setDone] = useState<ReviewDecision["decision"] | null>(null);

  const review = useQuery({
    queryKey: ["review", token],
    queryFn: () => apiGet<ReviewView>(`/moderation/reviews/${token}`),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const decide = useMutation({
    mutationFn: (decision: ReviewDecision["decision"]) =>
      apiPost<OkResponse>(`/moderation/reviews/${token}`, { decision, note: note.trim() } satisfies ReviewDecision),
    onSuccess: (_, decision) => setDone(decision),
    onError: (err) => toast.error(apiErrorText(err, t, t("rv.failed"))),
  });

  let body: React.ReactNode;
  if (done) {
    body = (
      <p className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 font-medium text-green-700" role="status" data-testid="review-done">
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        {done === "approve" ? t("rv.doneApproved") : t("rv.doneRejected")}
      </p>
    );
  } else if (review.isLoading) {
    body = <div className="h-72 animate-pulse rounded-2xl bg-muted" />;
  } else if (review.isError || !review.data) {
    body = (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center" data-testid="review-unavailable">
        <h2 className="font-heading text-lg font-bold">{t("rv.unavailable")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{apiErrorText(review.error, t, t("err.review_not_found"))}</p>
        <Link to="/jobs" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>{t("detail.backToJobs")}</Link>
      </div>
    );
  } else {
    const { job, findings, reports, reason, expires_at } = review.data;
    const online = job.published && job.moderation_status === "approved";
    const phrases = findings.map((f) => f.phrase);
    const pay = formatPay(job, t);
    body = (
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6" data-testid="review-why">
          <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("rv.why")}</p>
              <p className="mt-1 font-medium" data-testid="review-reason">{t(`rv.reason.${reason}`)}</p>
            </div>
            <Badge className={online ? "bg-green-50 text-green-700" : "bg-sky-50 text-sky-800"} data-testid="review-status">
              {online ? t("rv.online") : t("rv.waiting")}
            </Badge>
          </div>
          {findings.length > 0 && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950" data-testid="review-findings">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <TriangleAlert className="h-4 w-4" aria-hidden="true" /> {t("rv.findings")}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {findings.map((f) => (
                  <li key={`${f.category}-${f.phrase}`}>
                    “{f.phrase}” · {t(`mod.cat.${f.category}`)} ({t(`mod.field.${f.field}`)})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reports.length > 0 && (
            <div className="mt-5" data-testid="review-reports">
              <p className="text-sm font-semibold">{t("rv.reports")} ({reports.length})</p>
              <ul className="mt-2 space-y-2">
                {reports.map((r) => (
                  <li key={r.created_at} className="rounded-xl bg-secondary p-3 text-sm">
                    <p className="font-medium">{t(`report.reason.${r.reason}`)}</p>
                    <p className="mt-0.5 text-muted-foreground">{r.message || t("rv.noMessage")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.created_at, lang)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6" data-testid="review-vacancy">
          <h2 className="font-heading text-xl font-bold"><Highlighted text={job.title} phrases={phrases} /></h2>
          <p className="mt-1 text-sm text-muted-foreground">{job.company_name} · {job.city}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[job.english_level, job.job_type, job.work_mode, job.permit_support].map((v) => (
              <Badge key={v} variant="secondary">{t(`label.${v}`)}</Badge>
            ))}
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {pay && <div><dt className="inline text-muted-foreground">{t("vf.pay")}: </dt><dd className="inline">{pay}</dd></div>}
            {job.hours_per_week != null && (
              <div><dt className="inline text-muted-foreground">{t("vf.hours")}: </dt><dd className="inline">{job.hours_per_week}</dd></div>
            )}
            {job.schedule && (
              <div><dt className="inline text-muted-foreground">{t("vf.schedule")}: </dt><dd className="inline"><Highlighted text={job.schedule} phrases={phrases} /></dd></div>
            )}
            {job.valid_through && (
              <div><dt className="inline text-muted-foreground">{t("vf.closes")}: </dt><dd className="inline">{formatDate(job.valid_through, lang)}</dd></div>
            )}
          </dl>
          <p className="mt-5 whitespace-pre-line leading-relaxed" data-testid="review-description">
            <Highlighted text={job.description} phrases={phrases} />
          </p>
          {job.requirements.length > 0 && (
            <>
              <h3 className="mt-5 font-heading text-base font-bold">{t("detail.requirements")}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {job.requirements.map((r) => <li key={r}><Highlighted text={r} phrases={phrases} /></li>)}
              </ul>
            </>
          )}
          {job.perks.length > 0 && (
            <>
              <h3 className="mt-5 font-heading text-base font-bold">{t("detail.perks")}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {job.perks.map((p) => <li key={p}><Highlighted text={p} phrases={phrases} /></li>)}
              </ul>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6" data-testid="review-decision">
          <Label htmlFor="review-note">{t("rv.note")}</Label>
          <Textarea
            id="review-note"
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-describedby="review-note-hint"
            className="mt-1.5"
            data-testid="review-note-input"
          />
          <p id="review-note-hint" className="mt-1.5 text-xs text-muted-foreground">{t("rv.noteHint")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => decide.mutate("approve")} disabled={decide.isPending} data-testid="review-approve-button">
              {decide.isPending ? t("rv.saving") : online ? t("rv.keep") : t("rv.approve")}
            </Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => decide.mutate("reject")}
              disabled={decide.isPending || note.trim().length < MIN_NOTE}
              data-testid="review-reject-button"
            >
              {online ? t("rv.takeOffline") : t("rv.reject")}
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("rv.expires")} {formatDate(expires_at, lang)}.
          </p>
        </section>
      </div>
    );
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold" data-testid="review-heading">{t("rv.pageTitle")}</h1>
        <div className="mt-6">{body}</div>
      </div>
    </Layout>
  );
}
