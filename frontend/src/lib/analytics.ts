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
  plausible.init();
}
