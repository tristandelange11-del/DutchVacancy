import { useEffect } from "react";
import type { Company, JobWithMeta } from "@/lib/types";
import { ROOT_LANG, langFromPath, localizePath, normalizePathname, stripLangPrefix } from "@/lib/paths";

const SITE_NAME = "DutchVacancy";
const DEFAULT_IMAGE = "/og-cover.jpg";

export interface SeoOptions {
  /** Page title without the site suffix — the hook appends " · DutchVacancy". */
  title: string;
  description: string;
  /** Absolute or root-relative image for the social preview card. */
  image?: string;
  /** Open Graph type, e.g. "website" (default) or "article". */
  type?: string;
  /** Keep the page out of search results (auth pages, dashboards). */
  noindex?: boolean;
  /** Optional schema.org JSON-LD payload (JobPosting on job pages). */
  jsonLd?: Record<string, unknown> | null;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-page document head: title, description, canonical, Open Graph / Twitter
 * card and optional JSON-LD. Runs on every route change so crawlers and link
 * unfurlers see page-specific metadata instead of the index.html defaults.
 */
export function useSeo({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd = null,
}: SeoOptions) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const origin = window.location.origin;
    const path = normalizePathname(window.location.pathname);
    const url = origin + path;
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
    const absImage = image.startsWith("http") ? image : origin + image;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", url);

    // Each language version names the other (and the default) so search engines
    // show the right one per searcher and never treat them as duplicates.
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    const base = stripLangPrefix(path);
    for (const [hreflang, version] of [["nl", "nl"], ["en", "en"], ["x-default", ROOT_LANG]] as const) {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = origin + localizePath(base, version);
      document.head.appendChild(link);
    }
    upsertMeta("property", "og:locale", langFromPath(path) === "nl" ? "nl_NL" : "en_GB");

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", absImage);
    upsertMeta("property", "og:image:alt", fullTitle);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", absImage);

    const scriptId = "dv-json-ld";
    document.getElementById(scriptId)?.remove();
    if (jsonLdKey) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = jsonLdKey;
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [title, description, image, type, noindex, jsonLdKey]);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Google's employmentType values. Derived only from what the employer stated:
 * contract form first (freelance, agency, internship differ legally), then hours.
 */
function employmentTypes(job: JobWithMeta): string[] {
  const out = new Set<string>();
  if (job.contract_type === "freelance") out.add("CONTRACTOR");
  if (job.contract_type === "agency") out.add("TEMPORARY");
  if (job.contract_type === "internship" || job.job_type === "internship") out.add("INTERN");
  if (job.hours_per_week != null) out.add(job.hours_per_week >= 32 ? "FULL_TIME" : "PART_TIME");
  else if (job.job_type === "part_time" || job.job_type === "working_student") out.add("PART_TIME");
  return [...out];
}

/**
 * schema.org JobPosting for Google's job search, following its structured-data
 * guidelines: only facts the employer stated, validThrough for expiry, no salary
 * when none was given. Only emitted for open vacancies (see JobDetail).
 */
export function jobPostingJsonLd(job: JobWithMeta, company: Company | null): Record<string, unknown> {
  const parts = [`<p>${escapeHtml(job.description)}</p>`];
  if (job.requirements.length) {
    parts.push(`<ul>${job.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>`);
  }
  if (job.schedule) parts.push(`<p>${escapeHtml(job.schedule)}</p>`);

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: parts.join(""),
    identifier: { "@type": "PropertyValue", name: job.company_name, value: job.id },
    datePosted: job.created_at,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
      ...(company?.website ? { sameAs: company.website } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.city, addressCountry: "NL" },
    },
  };
  if (job.closes_at) ld.validThrough = job.closes_at;
  const types = employmentTypes(job);
  if (types.length) ld.employmentType = types.length === 1 ? types[0] : types;
  if (job.work_mode === "remote") {
    ld.jobLocationType = "TELECOMMUTE";
    ld.applicantLocationRequirements = { "@type": "Country", name: "NL" };
  }
  if (job.hourly_min != null || job.hourly_max != null) {
    const lo = job.hourly_min ?? job.hourly_max;
    const hi = job.hourly_max ?? job.hourly_min;
    ld.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        ...(lo === hi ? { value: lo } : { minValue: lo, maxValue: hi }),
        unitText: job.salary_period === "month" ? "MONTH" : "HOUR",
      },
    };
  }
  if (job.start_date) ld.jobStartDate = job.start_date;
  return ld;
}
