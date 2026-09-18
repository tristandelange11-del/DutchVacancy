import { useLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "nl", label: "NL" },
];

/**
 * `scope` keeps data-testids unique: the header renders one desktop and one
 * mobile instance, so they must not share an identifier.
 */
export default function LanguageSwitch({
  className,
  scope = "desktop",
}: {
  className?: string;
  scope?: "desktop" | "mobile";
}) {
  const { lang, setLang, t } = useLang();
  const suffix = scope === "desktop" ? "" : "-mobile";

  return (
    <div
      role="group"
      aria-label={t("nav.langLabel")}
      data-testid={`language-switch${suffix}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-secondary p-0.5",
        className,
      )}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={lang === o.value}
          data-testid={`lang-switch-${o.value}${suffix}`}
          onClick={() => setLang(o.value)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold tracking-wide transition-[background-color,color,transform] duration-150 active:scale-95",
            lang === o.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
