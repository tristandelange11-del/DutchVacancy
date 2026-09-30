import { Link } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { loc, relevantArticles, useKbArticles } from "@/lib/kb";
import type { JobWithMeta } from "@/lib/types";

export default function GuideLinks({ job }: { job: JobWithMeta }) {
  const { t, lang } = useLang();
  const articles = useKbArticles();
  const bySlug = new Map((articles.data ?? []).map((a) => [a.slug, a]));
  // Only articles this environment actually serves: no links to a 404.
  const shown = relevantArticles(job)
    .map((slug) => bySlug.get(slug))
    .filter((a) => a !== undefined)
    .slice(0, 3);

  return (
    <div className="rounded-2xl border border-border bg-accent p-5 text-accent-foreground" data-testid="job-guide-box">
      <h3 className="font-heading text-sm font-bold">{t("detail.guideTitle")}</h3>
      {shown.length > 0 ? (
        <ul className="mt-2 space-y-1.5 text-sm">
          {shown.map((a) => (
            <li key={a.slug}>
              <Link to={`/guide/${a.slug}`} className="underline" data-testid={`job-guide-article-${a.slug}`}>
                {loc(a.title, lang)}
              </Link>
              {!a.live && <span className="text-xs opacity-70"> ({t("kb.draft")})</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm leading-relaxed">{t("detail.guideEmpty")}</p>
      )}
      <Link to="/guide" className="mt-3 inline-block text-sm font-semibold underline" data-testid="job-guide-link">
        {t("detail.guideAll")}
      </Link>
    </div>
  );
}
