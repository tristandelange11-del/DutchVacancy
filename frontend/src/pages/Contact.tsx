import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { PageHero } from "@/components/Static";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { OkResponse } from "@/lib/types";
import { useSeo } from "@/lib/seo";

export default function Contact() {
  const { t } = useLang();
  useSeo({
    title: "Contact DutchVacancy",
    description:
      "Questions about a vacancy, your student profile or hiring international students? Send the DutchVacancy team a message and we will get back to you.",
  });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const send = useMutation({
    mutationFn: () => apiPost<OkResponse>("/contact", form),
    onSuccess: () => {
      toast.success(t("contact.sent"));
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: () => toast.error(t("contact.failed")),
  });

  return (
    <Layout>
      <PageHero eyebrow={t("contact.eyebrow")} title={t("contact.title")} intro={t("contact.intro")} />
      <div className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_280px]">
        <form
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
          data-testid="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            send.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cname">{t("contact.name")}</Label>
              <Input id="cname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} data-testid="contact-name-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cemail">{t("contact.email")}</Label>
              <Input id="cemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required data-testid="contact-email-input" className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="csubject">{t("contact.subject")}</Label>
            <Input id="csubject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required minLength={2} data-testid="contact-subject-input" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cmessage">{t("contact.message")}</Label>
            <Textarea id="cmessage" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength={10} data-testid="contact-message-input" className="mt-1.5" />
          </div>
          <Button type="submit" disabled={send.isPending} data-testid="contact-submit-button">
            {send.isPending ? t("contact.sending") : t("contact.send")}
          </Button>
        </form>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-accent p-6 text-accent-foreground">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-heading text-sm font-bold">{t("contact.emailLabel")}</p>
              <p className="text-sm">hello@dutchvacancy.nl</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-heading text-sm font-bold">{t("contact.office")}</p>
              <p className="text-sm">Online, the Netherlands</p>
            </div>
          </div>
          <p className="text-sm">{t("contact.answerNote")}</p>
        </aside>
      </div>
    </Layout>
  );
}
