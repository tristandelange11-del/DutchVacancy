import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { buttonVariants } from "@/components/ui/button";
import { ApiError, apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { beginSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { useSeo } from "@/lib/seo";

export default function VerifyEmail() {
  const { t } = useLang();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  useSeo({ title: "Verify email", description: "Confirm your DutchVacancy email address.", noindex: true });

  const verify = useMutation({
    mutationFn: () => apiPost<User>("/auth/verify-email", { token }),
    onSuccess: () => beginSession(),
  });

  // Fire once per token, not once per render — useMutation's own identity changes every render.
  const firedFor = useRef<string | null>(null);
  const { mutate } = verify;
  useEffect(() => {
    if (!token || firedFor.current === token) return;
    firedFor.current = token;
    mutate();
  }, [token, mutate]);

  const errorDetail =
    verify.error instanceof ApiError ? (verify.error.body as { detail?: string })?.detail : null;

  return (
    <Layout>
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        {!token ? (
          <>
            <XCircle className="h-12 w-12 text-destructive" />
            <h1 className="mt-4 font-heading text-2xl font-extrabold">{t("verifyEmail.missingTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("verifyEmail.missingBody")}</p>
          </>
        ) : verify.isPending || verify.isIdle ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h1 className="mt-4 font-heading text-2xl font-extrabold">{t("verifyEmail.pendingTitle")}</h1>
          </>
        ) : verify.isSuccess ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h1 className="mt-4 font-heading text-2xl font-extrabold">{t("verifyEmail.successTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("verifyEmail.successBody")}</p>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-destructive" />
            <h1 className="mt-4 font-heading text-2xl font-extrabold">{t("verifyEmail.errorTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{errorDetail ?? t("verifyEmail.errorBody")}</p>
          </>
        )}

        <Link to="/" className={cn(buttonVariants(), "mt-8")} data-testid="verify-email-home-link">
          {t("verifyEmail.cta")}
        </Link>
      </div>
    </Layout>
  );
}
