import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { DraftBadge, KbArticleCard } from "@/components/Kb";
import { NotFound } from "@/components/Static";
import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/jobFormat";
import { EMPLOYER_INFO_PATH, kbArticleJsonLd, loc, useKbArticle } from "@/lib/kb";
import type { LocalizedText } from "@/lib/types";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

/** Date-only ISO strings are calendar dates: read them at local noon so no timezone shifts the day. */
function day(iso: string | null, lang: "en" | "nl") {
  return iso ? formatDate(`${iso}T12:00:00`, lang) : null;
}

function Block({ title, testid, children }: { title: string; testid: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3" data-testid={testid}>
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <div className="space-y-3 leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function Paragraphs({ items }: { items: LocalizedText[] }) {
  const { lang } = useLang();
  return (
    <>
      {items.map((p, i) => (
        <p key={i}>{loc(p, lang)}</p>
      ))}
    </>
  );
}

function Bullets({ items, ordered = false }: { items: LocalizedText[]; ordered?: boolean }) {
  const { lang } = useLang();
  const List = ordered ? "ol" : "ul";
  return (
    <List className={cn("space-y-2 pl-5", ordered ? "list-decimal" : "list-disc")}>
      {items.map((p, i) => (
        <li key={i}>{loc(p, lang)}</li>
      ))}
    </List>
  );
}

export default function GuideArticle() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const query = useKbArticle(slug);
  const article = query.data;

  useSeo({
    title: article ? loc(article.title, lang) : t("guide.title"),
    description: article ? loc(article.summary, lang) : t("guide.intro"),
    type: "article",
    // Drafts are shown on staging for review only — never indexable.
    noindex: !article || !article.live,
    jsonLd: article ? kbArticleJsonLd(article, lang) : null,
  });

  if (query.error instanceof ApiError && query.error.status === 404) return <NotFound />;

  return (
    <Layout>
      <div className="bg-navy py-12 text-slate-100">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <Link to="/guide" className="inline-flex items-center gap-1.5 text-sm text-orange-200 hover:underline" data-testid="kb-back-link">
            <ArrowLeft className="h-4 w-4" />
            {t("kb.back")}
          </Link>
          {article && (
            <>
              <div className="mt-4">
                <DraftBadge article={article} />
              </div>
              <h1 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl" data-testid="kb-article-title">
                {loc(article.title, lang)}
              </h1>
              <p className="mt-3 text-slate-300">{loc(article.summary, lang)}</p>
            </>
          )}
        </div>
      </div>

      <article className="mx-auto w-full max-w-3xl space-y-10 px-4 py-12 sm:px-6" data-testid="kb-article">
        {query.isLoading && <div className="h-64 animate-pulse rounded-2xl bg-muted" />}
        {query.isError && !(query.error instanceof ApiError && query.error.status === 404) && (
          <p className="text-muted-foreground">{t("kb.loadFailed")}</p>
        )}
        {article && (
          <>
            {!article.live && (
              <div
                className="flex gap-3 rounded-2xl border border-orange-300 bg-orange-50 p-4 text-sm text-orange-950"
                role="note"
                data-testid="kb-draft-banner"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>{t("kb.draftBanner")}</p>
              </div>
            )}

            <section className="rounded-2xl border border-primary/30 bg-accent p-6 text-accent-foreground" data-testid="kb-answer">
              <h2 className="font-heading text-lg font-bold">{t("kb.answer")}</h2>
              <div className="mt-3 space-y-3 leading-relaxed">
                <Paragraphs items={article.answer} />
              </div>
            </section>

            <Block title={t("kb.appliesTo")} testid="kb-applies-to">
              <Bullets items={article.applies_to} />
            </Block>

            {article.details.map((section, i) => (
              <Block key={i} title={loc(section.title, lang)} testid={`kb-details-${i}`}>
                <Paragraphs items={section.paragraphs} />
              </Block>
            ))}

            {article.exceptions.length > 0 && (
              <Block title={t("kb.exceptions")} testid="kb-exceptions">
                <Bullets items={article.exceptions} />
              </Block>
            )}

            <Block title={t("kb.nextSteps")} testid="kb-next-steps">
              <Bullets items={article.next_steps} ordered />
            </Block>

            <Block title={t("kb.contacts")} testid="kb-contacts">
              <ul className="space-y-2">
                {article.contacts.map((c) => (
                  <li key={c.body + c.url.nl}>
                    <a href={loc(c.url, lang)} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 hover:underline">
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        <strong>{c.body}</strong> — {loc(c.label, lang)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">{t("kb.decides")}</p>
            </Block>

            {(article.job_link || article.employer_link) && (
              <div className="flex flex-wrap gap-3">
                {article.job_link && (
                  <Link to={`/jobs?${article.job_link.query}`} className={buttonVariants()} data-testid="kb-article-jobs-link">
                    {loc(article.job_link.label, lang)}
                  </Link>
                )}
                {article.employer_link && (
                  <Link to={EMPLOYER_INFO_PATH} className={buttonVariants({ variant: "outline" })} data-testid="kb-article-employers-link">
                    {t("kb.employersCta")}
                  </Link>
                )}
              </div>
            )}

            <Block title={t("kb.sources")} testid="kb-sources">
              <ul className="space-y-2 text-sm">
                {article.sources.map((s) => (
                  <li key={s.url.nl}>
                    <a href={loc(s.url, lang)} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      {s.publisher}: {loc(s.title, lang)}
                    </a>
                    {lang === "en" && !s.en_available && <span className="text-muted-foreground"> ({t("kb.inDutch")})</span>}
                    <span className="text-muted-foreground"> · {t("kb.readOn")} {day(s.checked_on, lang)}</span>
                  </li>
                ))}
              </ul>
            </Block>

            <footer className="rounded-2xl border border-border bg-card p-5 text-sm" data-testid="kb-byline">
              <dl className="grid gap-2 sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">{t("kb.author")}</dt>
                  <dd className="font-medium">{article.author ?? t("kb.noAuthor")}</dd>
                </div>
                {article.sensitive && (
                  <div>
                    <dt className="text-muted-foreground">{t("kb.reviewer")}</dt>
                    <dd className="font-medium">{article.reviewer ?? "—"}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">{t("kb.lastReviewed")}</dt>
                  <dd className="font-medium" data-testid="kb-last-reviewed">
                    {day(article.reviewed_on, lang) ?? t("kb.notReviewed")}
                  </dd>
                </div>
              </dl>
            </footer>

            {article.related.length > 0 && (
              <section aria-labelledby="kb-related" className="space-y-4">
                <h2 id="kb-related" className="font-heading text-xl font-bold">{t("kb.related")}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {article.related.map((r) => (
                    <KbArticleCard key={r.slug} article={r} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </article>
    </Layout>
  );
}
