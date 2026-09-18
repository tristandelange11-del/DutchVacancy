import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICT } from "@/lib/dict";

export type Lang = "en" | "nl";

const STORAGE_KEY = "dv_lang";

interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  tl: (key: string) => string[];
}

const LangContext = createContext<LangValue | null>(null);

/** True when any of the browser's preferred languages is Dutch. */
function prefersDutch(): boolean {
  if (typeof navigator === "undefined") return false;
  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  return tags.some((tag) => tag?.toLowerCase().startsWith("nl"));
}

/**
 * An explicit choice always wins; otherwise fall back to the browser's own
 * language preference, so Dutch visitors land on the Dutch site.
 */
function initialLang(): Lang {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "nl" || stored === "en") return stored;
  }
  return prefersDutch() ? "nl" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // Keep <html lang> correct for the auto-detected language too, not just after a manual switch.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

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
