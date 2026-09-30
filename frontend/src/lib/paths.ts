import type { Lang } from "@/lib/lang-context";

/**
 * The language of a page is part of its URL, so search engines can index both
 * versions: ROOT_LANG lives at "/", the other language under its own prefix
 * ("/en/jobs"). Flip ROOT_LANG to "en" to swap them — and change
 * SITE_ROOT_LANG in backend/lib/email.py to match, for the links in emails.
 */
export const ROOT_LANG: Lang = "nl";
export const PREFIXED_LANG: Lang = ROOT_LANG === "nl" ? "en" : "nl";
const PREFIX = `/${PREFIXED_LANG}`;

export function langFromPath(pathname: string): Lang {
  return pathname === PREFIX || pathname.startsWith(`${PREFIX}/`) ? PREFIXED_LANG : ROOT_LANG;
}

/** "/en/jobs?q=x" → "/jobs?q=x". Paths without the prefix come back unchanged. */
export function stripLangPrefix(path: string): string {
  if (path === PREFIX) return "/";
  if (path.startsWith(`${PREFIX}/`)) return path.slice(PREFIX.length);
  if (path.startsWith(`${PREFIX}?`) || path.startsWith(`${PREFIX}#`)) return `/${path.slice(PREFIX.length)}`;
  return path;
}

/**
 * The same page in `lang`. Only site-internal absolute paths are touched —
 * relative paths, other origins and /api calls pass through as they are.
 */
export function localizePath(path: string, lang: Lang): string {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/api/")) return path;
  const base = stripLangPrefix(path);
  if (lang === ROOT_LANG) return base;
  if (base === "/") return PREFIX;
  if (base.startsWith("/?") || base.startsWith("/#")) return PREFIX + base.slice(1);
  return PREFIX + base;
}

/** One canonical spelling per page: no trailing slash except on the root. */
export function normalizePathname(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname;
}
