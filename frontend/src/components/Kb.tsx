import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import { OFFICIAL_BODIES, loc } from "@/lib/kb";
import type { KbArticleSummary } from "@/lib/types";

/** Shown only on staging, where drafts are served for review. */
export function DraftBadge({ article }: { article: KbArticleSummary }) {
  const { t } = useLang();
  if (article.live) return null;
  return (
    <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-800" data-testid={`kb-draft-${article.slug}`}>
      {t("kb.draft")}
    </Badge>
  );
}

export function KbArticleCard({ article }: { article: KbArticleSummary }) {
  const { lang } = useLang();
  return (
    <Link
      to={`/guide/${article.slug}`}
      data-testid={`kb-card-${article.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/60"
    >
      <DraftBadge article={article} />
      <h3 className="mt-2 font-heading text-base font-bold group-hover:text-primary">{loc(article.title, lang)}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{loc(article.summary, lang)}</p>
      <ArrowRight className="mt-3 h-4 w-4 text-primary" aria-hidden="true" />
    </Link>
  );
}

/** The official bodies themselves — what we point to while no article is live. */
export function OfficialBodies() {
  const { t, lang } = useLang();
  return (
    <ul className="grid gap-3 sm:grid-cols-2" data-testid="kb-official-bodies">
      {OFFICIAL_BODIES.map((body) => (
        <li key={body.key}>
          <a
            href={body.url[lang]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full items-start gap-3 rounded-2xl border border-border bg-background p-4 hover:border-primary/60"
          >
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <span className="block font-semibold">{body.name}</span>
              <span className="block text-sm text-muted-foreground">{t(`kb.official.${body.key}`)}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
