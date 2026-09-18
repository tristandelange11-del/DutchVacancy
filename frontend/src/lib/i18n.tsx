import { createContext, useCallback, useContext, useMemo, useState } from "react";
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

function readStored(): Lang {
  if (typeof localStorage === "undefined") return "en";
  return localStorage.getItem(STORAGE_KEY) === "nl" ? "nl" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStored);

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
