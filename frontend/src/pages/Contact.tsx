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
import type { OkResponse } from "@/lib/types";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const send = useMutation({
    mutationFn: () => apiPost<OkResponse>("/contact", form),
    onSuccess: () => {
      toast.success("Thanks — we'll reply within two working days");
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: () => toast.error("Could not send your message"),
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Contact"
        title="Talk to the DutchVacancy team"
        intro="Questions about a vacancy, your account, or hiring international students? Send us a message."
      />
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
              <Label htmlFor="cname">Your name</Label>
              <Input id="cname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} data-testid="contact-name-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required data-testid="contact-email-input" className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="csubject">Subject</Label>
            <Input id="csubject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required minLength={2} data-testid="contact-subject-input" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="cmessage">Message</Label>
            <Textarea id="cmessage" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength={10} data-testid="contact-message-input" className="mt-1.5" />
          </div>
          <Button type="submit" disabled={send.isPending} data-testid="contact-submit-button">
            {send.isPending ? "Sending…" : "Send message"}
          </Button>
        </form>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-accent p-6 text-accent-foreground">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-heading text-sm font-bold">Email</p>
              <p className="text-sm">hello@dutchvacancy.nl</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-heading text-sm font-bold">Office</p>
              <p className="text-sm">Science Park 400, 1098 XH Amsterdam</p>
            </div>
          </div>
          <p className="text-sm">
            We answer in English and Dutch, usually within two working days.
          </p>
        </aside>
      </div>
    </Layout>
  );
}
