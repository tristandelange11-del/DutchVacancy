import { useEffect } from "react";

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
    const url = origin + window.location.pathname;
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
    const absImage = image.startsWith("http") ? image : origin + image;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", url);

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

const EMPLOYMENT_TYPE: Record<string, string> = {
  part_time: "PART_TIME",
  internship: "INTERN",
  working_student: "PART_TIME",
  graduate: "FULL_TIME",
};

export interface JobPostingSeed {
  id: string;
  title: string;
  description: string;
  city: string;
  job_type: string;
  work_mode: string;
  hourly_min: number;
  hourly_max: number;
  hours_per_week: number;
  created_at: string;
  company_name: string;
}

/** schema.org JobPosting so vacancies are eligible for Google Jobs results. */
export function jobPostingJsonLd(job: JobPostingSeed): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    employmentType: EMPLOYMENT_TYPE[job.job_type] ?? "PART_TIME",
    hiringOrganization: { "@type": "Organization", name: job.company_name },
    jobLocationType: job.work_mode === "remote" ? "TELECOMMUTE" : undefined,
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: "NL",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.hourly_min,
        maxValue: job.hourly_max,
        unitText: "HOUR",
      },
    },
    workHours: `${job.hours_per_week} hours per week`,
    inLanguage: "en",
    directApply: true,
  };
}
