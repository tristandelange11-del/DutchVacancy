import { useState } from "react";
import { ChevronDown, ExternalLink, Eye, FileText } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Inline CV skim for employers. PDFs render in the browser's own viewer via an
 * iframe on the same origin (the session cookie rides along, and /api/cv/<id>
 * is served with `Content-Disposition: inline`). DOC/DOCX cannot be rendered,
 * so those fall back to opening the file.
 */
export default function CvPreview({
  url,
  filename,
  testidSuffix,
}: {
  url: string;
  filename: string;
  testidSuffix: string;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const isPdf = /\.pdf($|\?)/i.test(filename) || /\.pdf($|\?)/i.test(url) || url.startsWith("/api/cv/");

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 text-primary" />
          {filename || t("ed.openCv")}
        </span>

        {isPdf && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            data-testid={`applicant-cv-preview-toggle-${testidSuffix}`}
          >
            <Eye className="h-4 w-4" />
            {open ? t("cv.hidePreview") : t("cv.preview")}
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
            />
          </Button>
        )}

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
          data-testid={`applicant-cv-${testidSuffix}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("cv.openTab")}
        </a>
      </div>

      {open && isPdf && (
        <div
          className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/40"
          data-testid={`applicant-cv-preview-${testidSuffix}`}
        >
          {/* <object> lets us render a fallback when the browser has no PDF viewer. */}
          <object
            data={`${url}#view=FitH&toolbar=0`}
            type="application/pdf"
            title={`${t("cv.preview")} — ${filename}`}
            className="h-[560px] w-full"
            data-testid={`applicant-cv-frame-${testidSuffix}`}
          >
            <div className="flex h-[560px] flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("cv.previewUnsupported")}</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
                data-testid={`applicant-cv-fallback-${testidSuffix}`}
              >
                {t("cv.openTab")}
              </a>
            </div>
          </object>
          <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            {t("cv.previewHint")}
          </p>
        </div>
      )}
    </div>
  );
}
