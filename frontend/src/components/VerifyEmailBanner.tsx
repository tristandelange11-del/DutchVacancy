import { useMutation } from "@tanstack/react-query";
import { MailWarning } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { OkResponse } from "@/lib/types";

/** Shown on student/employer dashboards while `user.email_verified` is false. */
export default function VerifyEmailBanner({ email }: { email: string }) {
  const { t } = useLang();

  const resend = useMutation({
    mutationFn: () => apiPost<OkResponse>("/auth/resend-verification"),
    onSuccess: () => toast.success(t("verifyBanner.sent")),
    onError: () => toast.error(t("verifyBanner.sendFailed")),
  });

  return (
    <div
      className="mb-8 flex flex-col items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-900 sm:flex-row sm:items-center sm:justify-between"
      data-testid="verify-email-banner"
    >
      <div className="flex items-start gap-3">
        <MailWarning className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{t("verifyBanner.title")}</p>
          <p className="text-sm text-orange-800">
            {t("verifyBanner.body")} <span className="font-medium">{email}</span>
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 border-orange-300 bg-white hover:bg-orange-100"
        disabled={resend.isPending}
        onClick={() => resend.mutate()}
        data-testid="verify-email-resend-button"
      >
        {resend.isPending ? t("verifyBanner.sending") : t("verifyBanner.resend")}
      </Button>
    </div>
  );
}
