import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { PageHero } from "@/components/Static";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiPost } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useLang } from "@/lib/i18n";
import { useKbArticles } from "@/lib/kb";
import type { ContactCreate, OkResponse } from "@/lib/types";
import { useSeo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const EMPTY = { name: "", email: "", company: "", message: "" };

export default function Employers() {
  const { t, tl } = useLang();
  useSeo({ title: t("emp.title"), description: t("emp.intro") });
  const articles = useKbArticles();
  const twvArticle = (articles.data ?? []).find((a) => a.slug === "twv-work-permit");
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);

  const send = useMutation({
    mutationFn: () =>
      apiPost<OkResponse>("/contact", {
        kind: "employer",
        subject: t("emp.subject"),
        ...form,
      } satisfies ContactCreate),
    onSuccess: () => {
      // Counted only once the server confirmed it stored and forwarded the request.
      track("Employer Request");
      setSent(true);
      setForm(EMPTY);
    },
  });
  const error =
    send.error instanceof ApiError
      ? ((send.error.body as { detail?: unknown })?.detail as string | undefined)
      : undefined;

  return (
    <Layout>
      <PageHero eyebrow={t("emp.eyebrow")} title={t("emp.title")} intro={t("emp.intro")} />
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr]" data-testid="employers-page">
        <div className="space-y-10">
          <section>
            <h2 className="font-heading text-2xl font-extrabold">{t("emp.howTitle")}</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed">
              {tl("emp.steps").map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <Link to="/register?role=employer" className={cn(buttonVariants(), "mt-6")} data-testid="employers-register-link">
              {t("emp.startCta")}
            </Link>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold">{t("emp.studentsTitle")}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{t("emp.studentsBody")}</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold">{t("emp.permitTitle")}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{t("emp.permitBody")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {twvArticle && (
                <li>
                  <Link to="/guide/twv-work-permit" className="font-medium underline" data-testid="employers-twv-article">
                    {t("emp.permitArticle")}
                  </Link>
                </li>
              )}
              <li>
                <a
                  href="https://www.uwv.nl/nl/werkvergunning/werkstudent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("emp.permitUwv")}
                </a>
              </li>
            </ul>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6" aria-labelledby="employer-form-title">
          <h2 id="employer-form-title" className="font-heading text-xl font-bold">{t("emp.formTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("emp.formIntro")}</p>
          {sent ? (
            <p className="mt-5 flex gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-900" role="status" data-testid="employer-request-sent">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("emp.sent")}
            </p>
          ) : (
            <form
              className="mt-5 space-y-4"
              data-testid="employer-request-form"
              onSubmit={(e) => {
                e.preventDefault();
                send.mutate();
              }}
            >
              <div>
                <Label htmlFor="ename">{t("contact.name")}</Label>
                <Input id="ename" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={120} autoComplete="name" className="mt-1.5" data-testid="employer-name-input" />
              </div>
              <div>
                <Label htmlFor="eemail">{t("contact.email")}</Label>
                <Input id="eemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="mt-1.5" data-testid="employer-email-input" />
              </div>
              <div>
                <Label htmlFor="ecompany">{t("emp.company")}</Label>
                <Input id="ecompany" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required minLength={2} maxLength={120} autoComplete="organization" className="mt-1.5" data-testid="employer-company-input" />
              </div>
              <div>
                <Label htmlFor="emessage">{t("emp.message")}</Label>
                <Textarea id="emessage" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength={10} maxLength={5000} className="mt-1.5" data-testid="employer-message-input" />
              </div>
              {send.isError && (
                <p className="text-sm text-destructive" role="alert" data-testid="employer-request-error">
                  {error ?? t("contact.failed")}
                </p>
              )}
              <Button type="submit" disabled={send.isPending} data-testid="employer-submit-button">
                {send.isPending ? t("contact.sending") : t("emp.send")}
              </Button>
            </form>
          )}
        </aside>
      </div>
    </Layout>
  );
}
