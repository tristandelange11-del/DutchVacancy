import { useCallback, useContext, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DICT } from "@/lib/dict";
import { LangContext, type Lang, type LangValue } from "@/lib/lang-context";
import { langFromPath, localizePath } from "@/lib/paths";

export type { Lang } from "@/lib/lang-context";

const STORAGE_KEY = "dv_lang";

/** True when any of the browser's preferred languages is Dutch. */
function prefersDutch(): boolean {
  if (typeof navigator === "undefined") return false;
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  return tags.some((tag) => tag?.toLowerCase().startsWith("nl"));
}

/**
 * The language a visitor would probably pick: their explicit earlier choice, else
 * the browser's. Only used to *offer* the other version (LanguageHint) — never to
 * redirect, so every URL shows the same language to everyone, crawlers included.
 */
export function preferredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "nl" || stored === "en") return stored;
  } catch {
    // Storage can be unavailable (private mode); fall back to the browser.
  }
  return prefersDutch() ? "nl" : "en";
}

export function rememberLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not remembering is fine; the URL still carries the language.
  }
}

/** Must sit inside the router: the language is read from the URL (see lib/paths.ts). */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = langFromPath(location.pathname);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (next: Lang) => {
      rememberLang(next);
      if (next !== lang) {
        navigate(localizePath(location.pathname + location.search + location.hash, next));
      }
    },
    [lang, location.pathname, location.search, location.hash, navigate],
  );

  const value = useMemo<LangValue>(() => {
    const idx = lang === "nl" ? 1 : 0;
    const t = (key: string) => {
      const entry = DICT[key];
      if (!entry) return key;
      const value = entry[idx];
      return Array.isArray(value) ? value.join(" ") : value;
    };
    const tl = (key: string) => {
      const entry = DICT[key];
      if (!entry) return [key];
      const value = entry[idx];
      return Array.isArray(value) ? value : [value];
    };
    return { lang, setLang, t, tl };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
