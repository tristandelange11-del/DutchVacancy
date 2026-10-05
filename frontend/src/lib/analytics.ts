// Plausible: cookie-free, privacy-friendly page-view analytics — no consent banner
// needed (matches the Privacy Policy's "no tracking cookies" promise).
//
// Loaded only on the real production hostname, never staging, previews or local dev —
// a runtime check, not a build-time env var, so there's nothing to configure per
// environment and no risk of test traffic ending up in the real visitor numbers.
const PRODUCTION_HOSTNAMES = new Set(["dutchvacancy.nl", "www.dutchvacancy.nl"]);

type PlausibleFn = {
  (...args: unknown[]): void;
  q?: unknown[];
  o?: unknown;
  init?: (opts?: unknown) => void;
};

/**
 * Single-use links carry their secret in the URL: the review link in the path, the
 * password-reset and email-verification links in `?token=`. Plausible never gets it.
 */
export function redactUrl(url: string): string {
  const u = new URL(url);
  u.pathname = u.pathname.replace(/\/review\/[^/]+/, "/review/_");
  u.searchParams.delete("token");
  return u.toString();
}

export function initAnalytics(): void {
  if (typeof window === "undefined" || !PRODUCTION_HOSTNAMES.has(window.location.hostname)) return;
  if (document.querySelector("script[data-plausible]")) return; // StrictMode double-invoke guard

  const loader = document.createElement("script");
  loader.async = true;
  loader.dataset.plausible = "true";
  loader.src = "https://plausible.io/js/pa-H63cHe-W1cKEYfahcwW9N.js";
  document.head.appendChild(loader);

  const w = window as unknown as { plausible?: PlausibleFn };
  const plausible: PlausibleFn =
    w.plausible ||
    ((...args: unknown[]) => {
      (plausible.q = plausible.q || []).push(args);
    });
  w.plausible = plausible;
  plausible.init = plausible.init || ((opts) => { plausible.o = opts || {}; });
  plausible.init({
    transformRequest: (payload: { u?: string }) => (payload.u ? { ...payload, u: redactUrl(payload.u) } : payload),
  });
}

/**
 * The only custom events we send (see docs/launch/meetplan.md). Props are limited
 * to non-personal identifiers — never names, email addresses, CV or form contents.
 */
export type AnalyticsEvent =
  | "Article View"
  | "Article Job Click"
  | "Job View"
  | "Apply Start"
  | "Apply Complete"
  | "Employer Request";

type EventProps = { slug?: string; job_id?: string; source?: string };

/**
 * Send a custom event. A no-op everywhere except the production hostnames, so tests,
 * staging and local development never count. Call "complete" events only after the
 * server confirmed success — that is what keeps a failed submit from being counted.
 */
export function track(event: AnalyticsEvent, props?: EventProps): void {
  if (typeof window === "undefined" || !PRODUCTION_HOSTNAMES.has(window.location.hostname)) return;
  const w = window as unknown as { plausible?: PlausibleFn };
  w.plausible?.(event, props ? { props } : undefined);
}
