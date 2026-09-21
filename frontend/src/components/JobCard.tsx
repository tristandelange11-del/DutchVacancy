import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { JobWithMeta } from "@/lib/types";

export function euro(n: number) {
  return `€ ${n.toFixed(2).replace(".", ",")}`;
}

export default function JobCard({
  job,
  onToggleSave,
}: {
  job: JobWithMeta;
  onToggleSave?: (job: JobWithMeta) => void;
}) {
  const { t } = useLang();

  return (
    <article
      data-testid={`job-card-${job.id}`}
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      {job.homepage_feature && (
        <div className="mb-3">
          <Badge className={job.fresh_sponsored ? "bg-orange-50 text-orange-800" : "bg-slate-100 text-slate-600"}>
            {job.fresh_sponsored ? t("job.freshSponsored") : t("job.featuredOrganic")}
          </Badge>
        </div>
      )}
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy font-heading text-sm font-bold text-white">
          {job.company_name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            to={`/jobs/${job.id}`}
            data-testid={`job-card-title-${job.id}`}
            className="font-heading text-base font-bold leading-snug hover:text-primary"
          >
            {job.title}
          </Link>
          <p className="truncate text-sm text-muted-foreground" data-testid={`job-card-company-${job.id}`}>
            {job.company_name}
          </p>
        </div>
        {onToggleSave && (
          <button
            type="button"
            aria-label={job.saved ? t("toast.unsaved") : t("job.save")}
            data-testid={`job-card-save-${job.id}`}
            onClick={() => onToggleSave(job)}
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border transition-colors duration-150 hover:border-primary hover:text-primary",
              job.saved && "border-primary/50 bg-accent text-primary",
            )}
          >
            {job.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5" data-testid={`job-card-city-${job.id}`}>
          <MapPin className="h-3.5 w-3.5" /> {job.city}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {job.hours_per_week}
          {t("job.perWeek")}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge className="bg-[#EFF6FF] text-[#1E40AF]" data-testid={`job-card-english-${job.id}`}>
          {t(`label.${job.english_level}`)}
        </Badge>
        <Badge variant="secondary">{t(`label.${job.job_type}`)}</Badge>
        <Badge variant="outline" data-testid={`job-card-workmode-${job.id}`}>
          {t(`label.${job.work_mode}`)}
        </Badge>
        {job.permit_support !== "none" && (
          <Badge className="bg-[#F0FDF4] text-[#166534]">{t(`label.${job.permit_support}`)}</Badge>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="font-heading text-sm font-bold" data-testid={`job-card-rate-${job.id}`}>
          {euro(job.hourly_min)} – {euro(job.hourly_max)}
          <span className="font-sans text-xs font-normal text-muted-foreground"> {t("job.perHour")}</span>
        </span>
        <Link
          to={`/jobs/${job.id}`}
          data-testid={`job-card-view-${job.id}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {job.applied ? t("job.appliedShort") : t("job.view")}
        </Link>
      </div>
    </article>
  );
}
