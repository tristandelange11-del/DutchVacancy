import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { ModerationCategory, ModerationFinding, VacancyCheckResult, VacancyText } from "@/lib/types";

const DEBOUNCE_MS = 600;

function hasText(text: VacancyText) {
  return Object.values(text).some((v) => (Array.isArray(v) ? v.length > 0 : v.trim() !== ""));
}

/**
 * Phrases in the vacancy text that may signal unequal treatment, checked while the employer
 * types (POST /employer/jobs/check, backend/lib/moderation.py). A hint never blocks saving:
 * a vacancy that keeps a flagged phrase waits for a person instead of going online.
 */
export default function FairnessHints({ text }: { text: VacancyText }) {
  const { t } = useLang();
  const key = JSON.stringify(text);
  const [debounced, setDebounced] = useState<VacancyText>(text);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(JSON.parse(key) as VacancyText), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [key]);

  const check = useQuery({
    queryKey: ["vacancy-check", debounced],
    queryFn: () => apiPost<VacancyCheckResult>("/employer/jobs/check", debounced),
    enabled: hasText(debounced),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    retry: false,
  });

  const groups = new Map<ModerationCategory, ModerationFinding[]>();
  if (hasText(debounced)) {
    for (const f of check.data?.findings ?? []) groups.set(f.category, [...(groups.get(f.category) ?? []), f]);
  }

  return (
    <div aria-live="polite" data-testid="vacancy-fairness">
      <p className="text-xs text-muted-foreground">{t("vf.reviewNote")}</p>
      {groups.size > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950" data-testid="vacancy-fairness-hints">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {t("vf.checkTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed">{t("vf.checkIntro")}</p>
          <ul className="mt-3 space-y-3">
            {[...groups].map(([category, findings]) => (
              <li key={category} className="text-sm" data-testid={`vacancy-hint-${category}`}>
                <p>
                  <span className="font-semibold">{t(`mod.cat.${category}`)}:</span>{" "}
                  {findings.map((f) => `“${f.phrase}” (${t(`mod.field.${f.field}`)})`).join(", ")}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed">{t(`mod.hint.${category}`)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
