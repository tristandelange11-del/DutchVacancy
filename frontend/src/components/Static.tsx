import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { buttonVariants } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <div className="bg-navy py-14 text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-200">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{intro}</p>
      </div>
    </div>
  );
}

export function Prose({ children, testid }: { children: React.ReactNode; testid: string }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-14 sm:px-6" data-testid={testid}>
      {children}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

/** A dictionary-driven prose section: title key + body key holding a paragraph list. */
export function TextSection({ titleKey, bodyKey }: { titleKey: string; bodyKey: string }) {
  const { t, tl } = useLang();
  return (
    <Section title={t(titleKey)}>
      {tl(bodyKey).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </Section>
  );
}

export function NotFound() {
  const { t } = useLang();
  return (
    <Layout>
      <div className="mx-auto max-w-lg px-4 py-28 text-center" data-testid="not-found-page">
        <p className="font-heading text-6xl font-extrabold text-primary">404</p>
        <h1 className="mt-4 font-heading text-2xl font-extrabold">{t("nf.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("nf.body")}</p>
        <Link to="/jobs" className={cn(buttonVariants(), "mt-6")} data-testid="notfound-jobs-link">
          {t("footer.browse")}
        </Link>
      </div>
    </Layout>
  );
}
