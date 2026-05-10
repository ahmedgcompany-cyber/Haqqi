"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { copy, localeHref } from "@/lib/i18n";

export function LanguageSwitcher({ pathname }: { pathname: string }) {
  const { locale, alternateLocale, isArabic } = useLocale();
  const targetPath = pathname.replace(`/${locale}`, "") || "";

  return (
    <Link
      href={localeHref(alternateLocale, targetPath)}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card-strong"
    >
      <Languages className="h-4 w-4 text-primary" />
      <span>{copy(locale, "العربية", "English")}</span>
      <span className="text-xs text-muted">
        {isArabic ? "LTR" : "RTL"}
      </span>
    </Link>
  );
}