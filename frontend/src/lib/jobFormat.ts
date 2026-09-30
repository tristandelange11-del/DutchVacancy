import { ApiError } from "@/lib/api";
import type { Lang } from "@/lib/lang-context";
import type { JobInput } from "@/lib/types";

export function euro(n: number) {
  return `€ ${n.toFixed(2).replace(".", ",")}`;
}

/** "€ 14,00 – € 16,00 per hour", or null when the employer stated no pay. */
export function formatPay(job: Pick<JobInput, "hourly_min" | "hourly_max" | "salary_period">, t: (k: string) => string) {
  const { hourly_min: lo, hourly_max: hi } = job;
  if (lo == null && hi == null) return null;
  const unit = t(job.salary_period === "month" ? "job.perMonth" : "job.perHour");
  if (lo != null && hi != null && lo !== hi) return `${euro(lo)} – ${euro(hi)} ${unit}`;
  return `${euro((lo ?? hi) as number)} ${unit}`;
}

export function formatDate(iso: string | null | undefined, lang: Lang) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Human text for a failed request: a translated `err.<code>` when the API sent a
 * structured `{code, message}` detail, the API's own string otherwise, then `fallback`.
 */
export function apiErrorText(err: unknown, t: (k: string) => string, fallback: string) {
  if (!(err instanceof ApiError)) return fallback;
  const detail = (err.body as { detail?: unknown } | null)?.detail;
  if (detail && typeof detail === "object" && "code" in detail) {
    const { code, message } = detail as { code: string; message?: string };
    const key = `err.${code}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return message ?? fallback;
  }
  return typeof detail === "string" ? detail : fallback;
}
