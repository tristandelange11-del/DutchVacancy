import { createContext } from "react";

export type Lang = "en" | "nl";

export interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  tl: (key: string) => string[];
}

/**
 * The context lives in its own module on purpose: if it were created inside
 * i18n.tsx, a Vite hot update of that file would mint a NEW context object
 * while already-mounted consumers still read the old one — they'd see `null`
 * and throw "useLang must be used inside LanguageProvider".
 */
export const LangContext = createContext<LangValue | null>(null);
