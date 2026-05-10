import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyManager } from "@/features/companies/company-manager";
import { isLocale, copy } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: copy(locale as "en" | "ar", "Companies", "الشركات"),
  };
}

export default async function CompaniesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <CompanyManager locale={locale} />;
}
