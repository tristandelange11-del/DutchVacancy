import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(iso: string, lang: "en" | "nl"): string {
  return new Date(iso).toLocaleString(lang === "nl" ? "nl-NL" : "en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  });
}
