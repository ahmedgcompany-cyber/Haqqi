import type { Route } from "next";

export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isArabicLocale(locale: Locale) {
  return locale === "ar";
}

export function getDirection(locale: Locale) {
  return isArabicLocale(locale) ? "rtl" : "ltr";
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

export function copy(locale: Locale, english: string, arabic: string) {
  return locale === "ar" ? arabic : english;
}

export function localeHref(locale: Locale, path = ""): Route {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return (normalized === "/" ? `/${locale}` : `/${locale}${normalized}`) as Route;
}