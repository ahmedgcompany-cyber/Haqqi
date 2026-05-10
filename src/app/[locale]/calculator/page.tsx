import { notFound } from "next/navigation";
import { GratuityCalculator } from "@/features/calculators/gratuity-calculator";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <GratuityCalculator locale={locale as Locale} />;
}