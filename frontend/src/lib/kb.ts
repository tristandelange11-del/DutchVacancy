import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Lang } from "@/lib/lang-context";
import type { JobWithMeta, KbArticle, KbArticleSummary, LocalizedText } from "@/lib/types";

/** Where "information for employers" links point. */
export const EMPLOYER_INFO_PATH = "/employers";

/** The official bodies' own sites — named on the hub when no article is live yet. */
export const OFFICIAL_BODIES = [
  { key: "ind", name: "IND", url: { nl: "https://ind.nl/nl", en: "https://ind.nl/en" } },
  { key: "uwv", name: "UWV", url: { nl: "https://www.uwv.nl/nl/werkvergunning", en: "https://www.uwv.nl/nl/werkvergunning" } },
  { key: "svb", name: "SVB", url: { nl: "https://www.svb.nl/nl/", en: "https://www.svb.nl/en/" } },
  { key: "rvo", name: "Rijksoverheid", url: { nl: "https://www.rijksoverheid.nl", en: "https://www.government.nl" } },
  { key: "bd", name: "Belastingdienst", url: { nl: "https://www.belastingdienst.nl", en: "https://www.belastingdienst.nl" } },
] as const;

export function loc(text: LocalizedText, lang: Lang): string {
  return text[lang];
}

/** Articles this environment serves: live ones, plus drafts on staging (live === false). */
export function useKbArticles() {
  return useQuery({
    queryKey: ["kb"],
    queryFn: () => apiGet<KbArticleSummary[]>("/kb"),
    staleTime: 5 * 60_000,
  });
}

export function useKbArticle(slug: string | undefined) {
  return useQuery({
    queryKey: ["kb", slug],
    queryFn: () => apiGet<KbArticle>(`/kb/${slug}`),
    enabled: Boolean(slug),
    retry: false,
  });
}

/**
 * schema.org Article for a reviewed, live article only — never for drafts.
 * Author and dateModified come from the real review, not from the build.
 */
export function kbArticleJsonLd(article: KbArticle, lang: Lang): Record<string, unknown> | null {
  if (!article.live || !article.author || !article.reviewed_on) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: loc(article.title, lang),
    description: loc(article.summary, lang),
    inLanguage: lang,
    author: { "@type": "Person", name: article.author },
    dateModified: article.reviewed_on,
    publisher: { "@type": "Organization", name: "DutchVacancy" },
    mainEntityOfPage: `${window.location.origin}/guide/${article.slug}`,
  };
}

/**
 * Knowledge-base articles that explain what this vacancy's stated facts mean.
 * Picked from what the employer stated — never a promise about the candidate's
 * own eligibility, permit or insurance.
 */
export function relevantArticles(job: JobWithMeta): string[] {
  const slugs = ["start-working"];
  if (job.permit_support === "twv_provided") slugs.push("twv-work-permit");
  if (job.contract_type === "employment" || job.contract_type === "on_call" || job.contract_type === "agency") {
    slugs.push("employment-contract");
  }
  if (job.english_level === "english_only") slugs.push("jobs-without-dutch");
  return slugs;
}
