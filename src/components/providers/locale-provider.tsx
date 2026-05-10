"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { getDirection, getOppositeLocale, isArabicLocale, type Locale } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  alternateLocale: Locale;
  isArabic: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      direction: getDirection(locale),
      alternateLocale: getOppositeLocale(locale),
      isArabic: isArabicLocale(locale),
    }),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = value.direction;
  }, [locale, value.direction]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}