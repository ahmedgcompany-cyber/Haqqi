import { notFound } from "next/navigation";
import { LandingPage } from "@/features/marketing/landing-page";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LandingPage locale={locale as Locale} />;
}