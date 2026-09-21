import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { OkResponse } from "@/lib/types";
import { useSeo } from "@/lib/seo";

export default function ForgotPassword() {
  const { lang } = useLang();
  const [email, setEmail] = useState("");
  useSeo({ title: "Forgot password", description: "Reset your DutchVacancy password.", noindex: true });
  const request = useMutation({ mutationFn: () => apiPost<OkResponse>("/auth/forgot-password", { email }) });
  const nl = lang === "nl";

  return <Layout><main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
    <div className="rounded-3xl border border-border bg-card p-8">
      <h1 className="font-heading text-2xl font-extrabold">{nl ? "Wachtwoord vergeten" : "Forgot your password?"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{nl ? "Vul je e-mailadres in. Als het account bestaat, sturen we een veilige herstellink." : "Enter your email. If the account exists, we will send a secure reset link."}</p>
      {request.isSuccess ? <p className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{nl ? "Controleer je inbox en spammap." : "Check your inbox and spam folder."}</p> :
      <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); request.mutate(); }}>
        <div><Label htmlFor="forgot-email">{nl ? "E-mailadres" : "Email"}</Label><Input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" /></div>
        <Button type="submit" className="w-full" disabled={request.isPending}>{nl ? "Stuur herstellink" : "Send reset link"}</Button>
      </form>}
      <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">{nl ? "Terug naar inloggen" : "Back to login"}</Link>
    </div>
  </main></Layout>;
}
