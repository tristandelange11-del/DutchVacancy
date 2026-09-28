import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError, apiGet, apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";
import { useSeo } from "@/lib/seo";
import type { Application } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

export default function InterviewPick() {
  const { appId } = useParams();
  const { t, lang } = useLang();
  useSeo({
    title: "Choose your interview time",
    description: "Pick a time for your interview.",
    noindex: true,
  });
  const [selected, setSelected] = useState<string | null>(null);

  const applications = useQuery({
    queryKey: ["applications"],
    queryFn: () => apiGet<Application[]>("/student/applications"),
  });
  const app = applications.data?.find((a) => a.id === appId);
  const interview = app?.status === "interview" ? app.interview : null;
  const upcoming = (interview?.slots ?? []).filter((s) => new Date(s).getTime() > Date.now());

  const choose = useMutation({
    mutationFn: () => apiPost<Application>(`/student/applications/${appId}/interview/choose`, { slot: selected }),
    onSuccess: () => {
      toast.success(t("iv.confirmed"));
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: unknown })?.detail : null;
      toast.error(typeof detail === "string" ? detail : t("iv.chooseFailed"));
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const backLink = (
    <Link to="/student/dashboard" className={cn(buttonVariants({ variant: "outline" }), "mt-6")} data-testid="interview-back-link">
      {t("iv.back")}
    </Link>
  );

  let body: React.ReactNode;
  if (applications.isLoading) {
    body = <div className="h-40 animate-pulse rounded-2xl bg-muted" data-testid="interview-loading" />;
  } else if (!app || !interview || (!interview.chosen_slot && upcoming.length === 0)) {
    body = (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center" data-testid="interview-none">
        <p className="text-sm text-muted-foreground">{t("iv.none")}</p>
        {backLink}
      </div>
    );
  } else if (interview.chosen_slot) {
    body = (
      <div className="rounded-2xl border border-border bg-card p-6" data-testid="interview-confirmed">
        <p className="flex items-center gap-2 font-heading text-lg font-bold text-green-700">
          <CalendarCheck className="h-5 w-5" /> {t("iv.confirmed")}
        </p>
        <p className="mt-3 text-base font-semibold">{formatDateTime(interview.chosen_slot, lang)}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("iv.where")}: {interview.location}
        </p>
        <a
          href={`/api/student/applications/${app.id}/interview.ics`}
          className={cn(buttonVariants({ variant: "outline" }), "mt-4 gap-2")}
          data-testid="interview-add-to-calendar"
        >
          <CalendarCheck className="h-4 w-4" /> {t("iv.addToCalendar")}
        </a>
        {backLink}
      </div>
    );
  } else {
    body = (
      <div className="rounded-2xl border border-border bg-card p-6" data-testid="interview-pick-card">
        <p className="text-sm text-muted-foreground">
          {t("iv.where")}: <span className="font-medium text-foreground">{interview.location}</span>
        </p>
        {interview.note && (
          <p className="mt-3 rounded-xl bg-secondary p-3 text-sm leading-relaxed text-muted-foreground">{interview.note}</p>
        )}
        <div className="mt-5 space-y-2" role="radiogroup" aria-label={t("iv.pick")}>
          {upcoming.map((slot) => (
            <button
              key={slot}
              type="button"
              role="radio"
              aria-checked={selected === slot}
              onClick={() => setSelected(slot)}
              data-testid={`interview-slot-${slot}`}
              className={cn(
                "w-full rounded-xl border border-border px-4 py-3 text-left text-sm font-medium transition-colors duration-150 hover:border-primary/60",
                selected === slot && "border-primary bg-primary/10 text-primary",
              )}
            >
              {formatDateTime(slot, lang)}
            </button>
          ))}
        </div>
        <Button
          className="mt-6"
          disabled={!selected || choose.isPending}
          onClick={() => choose.mutate()}
          data-testid="interview-confirm-button"
        >
          {choose.isPending ? t("iv.confirming") : t("iv.confirm")}
        </Button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
        <h1 className="font-heading text-2xl font-extrabold" data-testid="interview-heading">
          {t("iv.pageTitle")}
        </h1>
        {app && (
          <p className="mt-1 text-sm font-medium text-primary">
            {app.job_title} · {app.company_name}
          </p>
        )}
        <p className="mb-6 mt-2 text-sm text-muted-foreground">{t("iv.pageIntro")}</p>
        {body}
      </div>
    </Layout>
  );
}
