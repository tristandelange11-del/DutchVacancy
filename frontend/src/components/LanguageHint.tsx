import { useState } from "react";
import { Globe2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DICT } from "@/lib/dict";
import { preferredLang, rememberLang, useLang } from "@/lib/i18n";

/**
 * Offers the other language version when the visitor probably prefers it. An
 * offer, never a redirect: a URL
 * always shows the same language to everyone, crawlers included. Written in the
 * language being offered, since that is the one the visitor reads.
 */
export default function LanguageHint() {
  const { lang, setLang } = useLang();
  const [preferred] = useState(preferredLang);
  const [dismissed, setDismissed] = useState(false);
  // Offered whenever the page is not in the visitor's language — their own earlier
  // choice if they made one (e.g. arriving on a Dutch link after choosing English),
  // else the browser's. "Stay" records the current language, which ends the offer.
  if (dismissed || preferred === lang) return null;

  const other = preferred;
  const say = (key: string) => DICT[key][other === "en" ? 0 : 1] as string;
  return (
    <div className="border-b border-border bg-secondary px-4 py-2.5" data-testid="language-hint" lang={other}>
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Globe2 className="h-4 w-4 text-primary" aria-hidden="true" />
        <p className="flex-1">{say("langHint.text")}</p>
        <Button size="sm" onClick={() => setLang(other)} data-testid="language-hint-switch">
          {say("langHint.switch")}
        </Button>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => {
            rememberLang(lang);
            setDismissed(true);
          }}
          data-testid="language-hint-dismiss"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          {say("langHint.stay")}
        </button>
      </div>
    </div>
  );
}
