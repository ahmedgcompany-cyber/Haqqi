import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PricingCards } from "@/components/billing/pricing-cards";
import { isLocale, copy } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: copy(locale as "en" | "ar", "Pricing", "الأسعار"),
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <section className="grid gap-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold text-balance text-foreground">
          {copy(locale, "Choose your plan", "اختر خطتك")}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          {copy(
            locale,
            "Start free and upgrade when you need more companies, employees, or exports.",
            "ابدأ مجاناً وارقي عندما تحتاج إلى المزيد من الشركات أو الموظفين أو التصدير.",
          )}
        </p>
      </div>
      <PricingCards locale={locale} />
    </section>
  );
}
