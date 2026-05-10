"use client";

import Link from "next/link";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function UsageBanner({
  locale,
  feature,
  current,
  limit,
}: {
  locale: Locale;
  feature: string;
  current: number;
  limit: number;
}) {
  const over = current >= limit;

  return (
    <div
      className={`rounded-[1.4rem] border p-4 text-sm ${
        over
          ? "border-danger/30 bg-danger/8 text-danger"
          : "border-accent/30 bg-accent/8 text-accent"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {over
            ? copy(locale, `You have reached your ${feature} limit.`, `لقد بلغت الحد الأقصى لـ ${feature}.`)
            : copy(
                locale,
                `${feature}: ${current} / ${limit} used this month`,
                `${feature}: ${current} / ${limit} مستخدم هذا الشهر`,
              )}
        </span>
        {over && (
          <Link
            href={`/${locale}/pricing`}
            className="font-semibold underline underline-offset-2"
          >
            {copy(locale, "Upgrade plan", "ترقية الخطة")}
          </Link>
        )}
      </div>
    </div>
  );
}
