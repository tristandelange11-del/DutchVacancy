import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { OkResponse } from "@/lib/types";
import { useSeo } from "@/lib/seo";

export default function ResetPassword() {
  const { lang } = useLang();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const nl = lang === "nl";
  useSeo({ title: "Reset password", description: "Choose a new DutchVacancy password.", noindex: true });
  const reset = useMutation({ mutationFn: () => apiPost<OkResponse>("/auth/reset-password", { token, password }) });

  return <Layout><main className="mx-auto max-w-lg px-4 py-16 sm:px-6"><div className="rounded-3xl border border-border bg-card p-8">
    <h1 className="font-heading text-2xl font-extrabold">{nl ? "Nieuw wachtwoord" : "Choose a new password"}</h1>
    {reset.isSuccess ? <><p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">{nl ? "Je wachtwoord is gewijzigd." : "Your password has been changed."}</p><Link to="/login" className="mt-5 inline-block font-semibold text-primary hover:underline">{nl ? "Nu inloggen" : "Log in now"}</Link></> :
    <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); reset.mutate(); }}>
      <div><Label htmlFor="new-password">{nl ? "Wachtwoord, minimaal 8 tekens" : "Password, at least 8 characters"}</Label><Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required className="mt-1.5" /></div>
      {reset.isError && <p className="text-sm text-destructive">{nl ? "De link is ongeldig of verlopen." : "The link is invalid or expired."}</p>}
      <Button type="submit" className="w-full" disabled={!token || reset.isPending}>{nl ? "Wachtwoord opslaan" : "Save password"}</Button>
    </form>}
  </div></main></Layout>;
}
