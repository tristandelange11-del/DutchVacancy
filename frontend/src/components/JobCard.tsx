import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ENGLISH_LEVEL_LABELS,
  JOB_TYPE_LABELS,
  PERMIT_LABELS,
  type JobWithMeta,
} from "@/lib/types";

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
  return (
    <article
      data-testid={`job-card-${job.id}`}
      className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
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
            aria-label={job.saved ? "Remove from saved jobs" : "Save this job"}
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
          <Clock className="h-3.5 w-3.5" /> {job.hours_per_week}h / week
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge className="bg-[#EFF6FF] text-[#1E40AF]" data-testid={`job-card-english-${job.id}`}>
          {ENGLISH_LEVEL_LABELS[job.english_level]}
        </Badge>
        <Badge variant="secondary">{JOB_TYPE_LABELS[job.job_type]}</Badge>
        {job.permit_support !== "none" && (
          <Badge className="bg-[#F0FDF4] text-[#166534]">{PERMIT_LABELS[job.permit_support]}</Badge>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="font-heading text-sm font-bold" data-testid={`job-card-rate-${job.id}`}>
          {euro(job.hourly_min)} – {euro(job.hourly_max)}
          <span className="font-sans text-xs font-normal text-muted-foreground"> /hour</span>
        </span>
        <Link
          to={`/jobs/${job.id}`}
          data-testid={`job-card-view-${job.id}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {job.applied ? "Applied ✓" : "View & apply →"}
        </Link>
      </div>
    </article>
  );
}
