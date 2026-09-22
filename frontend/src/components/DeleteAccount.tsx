import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiDelete } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { endSession } from "@/lib/session";
import type { OkResponse } from "@/lib/types";

export default function DeleteAccount() {
  const { t } = useLang();
  const navigate = useNavigate();
  const remove = useMutation({
    mutationFn: () => apiDelete<OkResponse>("/auth/account"),
    onSuccess: async () => {
      await endSession();
      toast.success(t("account.deleted"));
      navigate("/");
    },
    onError: () => toast.error(t("account.deleteFailed")),
  });

  return (
    <section className="mt-10 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="font-heading text-lg font-bold text-red-950">{t("account.deleteTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-red-900">{t("account.deleteBody")}</p>
      <Button
        variant="outline"
        className="mt-4 border-red-300 bg-white text-red-800 hover:bg-red-100"
        disabled={remove.isPending}
        onClick={() => {
          if (window.confirm(t("account.deleteConfirm"))) remove.mutate();
        }}
      >
        {t("account.deleteButton")}
      </Button>
    </section>
  );
}
