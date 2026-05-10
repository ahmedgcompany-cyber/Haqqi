import { notFound } from "next/navigation";
import { WpsGenerator } from "@/features/wps/wps-generator";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function WpsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <WpsGenerator locale={locale as Locale} />;
}