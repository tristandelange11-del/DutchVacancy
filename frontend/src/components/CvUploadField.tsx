import { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError, apiUpload } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { CvUpload } from "@/lib/types";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * CV file picker. Reports the stored URL + filename upward; the parent decides
 * whether to persist it on the profile or attach it to an application.
 */
export default function CvUploadField({
  url,
  filename,
  onChange,
  testidPrefix,
}: {
  url: string;
  filename: string;
  onChange: (next: { url: string; filename: string }) => void;
  testidPrefix: string;
}) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error(t("cv.tooBig"));
      return;
    }
    setBusy(true);
    try {
      const res = await apiUpload<CvUpload>("/uploads/cv", file);
      onChange({ url: res.url, filename: res.filename });
      toast.success(t("cv.uploaded"));
    } catch (err) {
      const detail = err instanceof ApiError ? (err.body as { detail?: string })?.detail : null;
      toast.error(detail ?? t("cv.failed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div data-testid={`${testidPrefix}-cv-field`}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        data-testid={`${testidPrefix}-cv-input`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {url ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            data-testid={`${testidPrefix}-cv-view-link`}
            className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary hover:underline"
          >
            {filename || t("cv.view")}
          </a>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            data-testid={`${testidPrefix}-cv-replace-button`}
          >
            {busy ? t("cv.uploading") : t("cv.replace")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={t("cv.remove")}
            onClick={() => onChange({ url: "", filename: "" })}
            data-testid={`${testidPrefix}-cv-remove-button`}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            data-testid={`${testidPrefix}-cv-upload-button`}
          >
            <Upload className="h-4 w-4" />
            {busy ? t("cv.uploading") : t("cv.upload")}
          </Button>
          <span className="text-xs text-muted-foreground">{t("cv.none")}</span>
        </div>
      )}
      <p className="mt-1.5 text-xs text-muted-foreground">{t("cv.hint")}</p>
    </div>
  );
}
