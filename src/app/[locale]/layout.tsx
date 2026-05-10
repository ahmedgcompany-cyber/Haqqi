import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppProviders } from "@/components/providers/app-providers";
import { MainShell } from "@/components/layout/main-shell";
import { copy, isLocale, locales, type Locale } from "@/lib/i18n";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return {
    title: copy(
      locale,
      "Haqqi for GCC SMBs",
      "حقي للشركات الصغيرة والمتوسطة في الخليج",
    ),
    description: copy(
      locale,
      "Bilingual workflows for gratuity, WPS, and final settlements.",
      "سير عمل ثنائي اللغة لمكافأة نهاية الخدمة وملفات حماية الأجور والتسويات النهائية.",
    ),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AppProviders locale={locale as Locale}>
      <MainShell>{children}</MainShell>
    </AppProviders>
  );
}