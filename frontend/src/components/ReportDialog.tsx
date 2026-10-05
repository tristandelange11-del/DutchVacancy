import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { REPORT_REASONS, type JobReportCreate, type OkResponse, type ReportReason } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_MESSAGE = 1000;

/** "Report this vacancy": anyone may report, without a name or account (POST /jobs/{id}/report). */
export default function ReportDialog({ jobId }: { jobId: string }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: (body: JobReportCreate) => apiPost<OkResponse>(`/jobs/${jobId}/report`, body),
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next && send.isSuccess) {
      setReason(null);
      setMessage("");
      send.reset();
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
        data-testid="job-report-button"
      >
        <Flag className="h-3.5 w-3.5" aria-hidden="true" /> {t("report.open")}
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-testid="report-dialog">
          <DialogHeader>
            <DialogTitle>{t("report.open")}</DialogTitle>
            <DialogDescription>{t("report.intro")}</DialogDescription>
          </DialogHeader>
          {send.isSuccess ? (
            <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800" role="status" data-testid="report-sent">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> {t("report.sent")}
            </p>
          ) : (
            <form
              id="report-form"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (reason) send.mutate({ reason, message: message.trim() });
              }}
            >
              <fieldset>
                <legend className="text-sm font-medium">{t("report.reason")}</legend>
                <div className="mt-2 space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors duration-150 hover:border-primary/60",
                        reason === r && "border-primary bg-primary/5",
                      )}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="mt-0.5 accent-primary"
                        data-testid={`report-reason-${r}`}
                      />
                      {t(`report.reason.${r}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <Label htmlFor="report-message">{t("report.message")}</Label>
                <Textarea
                  id="report-message"
                  rows={3}
                  maxLength={MAX_MESSAGE}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-describedby="report-message-hint"
                  className="mt-1.5"
                  data-testid="report-message-input"
                />
                <p id="report-message-hint" className="mt-1.5 text-xs text-muted-foreground">{t("report.messageHint")}</p>
              </div>
              {send.isError && (
                <p className="text-sm text-destructive" role="alert" data-testid="report-error">{t("report.failed")}</p>
              )}
            </form>
          )}
          <DialogFooter>
            {send.isSuccess ? (
              <Button onClick={() => onOpenChange(false)} data-testid="report-close-button">{t("common.close")}</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
                <Button type="submit" form="report-form" disabled={!reason || send.isPending} data-testid="report-submit-button">
                  {send.isPending ? t("report.sending") : t("report.send")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
