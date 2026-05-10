import { notFound } from "next/navigation";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <DashboardOverview locale={locale as Locale} />;
}