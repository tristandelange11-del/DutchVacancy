import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** A `?next=` target only if it is an in-app path — never an open redirect elsewhere. */
export function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value;
}

export function formatDateTime(iso: string, lang: "en" | "nl"): string {
  return new Date(iso).toLocaleString(lang === "nl" ? "nl-NL" : "en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  });
}
