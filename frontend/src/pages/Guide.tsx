import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { KbArticleCard, OfficialBodies } from "@/components/Kb";
import { PageHero } from "@/components/Static";
import { buttonVariants } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { EMPLOYER_INFO_PATH, useKbArticles } from "@/lib/kb";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

/** The knowledge base hub: "Working in the Netherlands as an international student". */
export default function Guide() {
  const { t } = useLang();
  const articles = useKbArticles();
  const list = articles.data ?? [];

  useSeo({
    title: t("guide.title"),
    description: t("guide.intro"),
  });

  return (
    <Layout>
      <PageHero eyebrow={t("guide.eyebrow")} title={t("guide.title")} intro={t("guide.intro")} />
      <div className="mx-auto w-full max-w-5xl space-y-12 px-4 py-14 sm:px-6" data-testid="guide-page">
        <section aria-labelledby="kb-articles">
          <h2 id="kb-articles" className="font-heading text-2xl font-extrabold">{t("kb.articles")}</h2>
          {articles.isLoading ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-36 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : list.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2" data-testid="kb-article-list">
              {list.map((article) => (
                <KbArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <p className="mt-4 max-w-2xl text-muted-foreground" data-testid="kb-none">{t("kb.none")}</p>
          )}
        </section>

        <section aria-labelledby="kb-official">
          <h2 id="kb-official" className="font-heading text-2xl font-extrabold">{t("kb.official")}</h2>
          <div className="mt-5">
            <OfficialBodies />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold">{t("kb.findWork")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("kb.findWorkBody")}</p>
            <Link
              to="/jobs?english_level=english_only"
              className={cn(buttonVariants(), "mt-4")}
              data-testid="kb-jobs-link"
            >
              {t("kb.findWorkCta")}
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold">{t("kb.employers")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("kb.employersBody")}</p>
            <Link
              to={EMPLOYER_INFO_PATH}
              className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
              data-testid="kb-employers-link"
            >
              {t("kb.employersCta")}
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
