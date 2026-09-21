import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { beginSession } from "@/lib/session";
import type { OkResponse } from "@/lib/types";
import { useSeo } from "@/lib/seo";

export default function VerifyEmail() {
  const { lang } = useLang();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const nl = lang === "nl";
  useSeo({ title: "Verify email", description: "Verify your DutchVacancy email address.", noindex: true });
  const verify = useMutation({ mutationFn: () => apiPost<OkResponse>("/auth/verify-email", { token }), onSuccess: () => beginSession() });
  useEffect(() => { if (token && verify.isIdle) verify.mutate(); }, [token, verify]);

  return <Layout><main className="mx-auto max-w-lg px-4 py-16 sm:px-6"><div className="rounded-3xl border border-border bg-card p-8 text-center">
    <h1 className="font-heading text-2xl font-extrabold">{nl ? "E-mailadres bevestigen" : "Verify your email"}</h1>
    {verify.isPending && <p className="mt-4 text-muted-foreground">{nl ? "Bezig met controleren…" : "Checking your link…"}</p>}
    {verify.isSuccess && <><p className="mt-4 text-green-700">{nl ? "Je e-mailadres is bevestigd." : "Your email address is verified."}</p><Link to="/login" className="mt-5 inline-block font-semibold text-primary hover:underline">{nl ? "Verder naar inloggen" : "Continue to login"}</Link></>}
    {(verify.isError || !token) && <p className="mt-4 text-destructive">{nl ? "Deze link is ongeldig of verlopen." : "This link is invalid or expired."}</p>}
  </div></main></Layout>;
}
