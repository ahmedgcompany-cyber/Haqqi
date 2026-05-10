import { notFound } from "next/navigation";
import { SettlementGenerator } from "@/features/settlements/settlement-generator";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function SettlementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <SettlementGenerator locale={locale as Locale} />;
}