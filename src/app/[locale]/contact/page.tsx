import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/contact-form";
import { isLocale, copy } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: copy(locale as "en" | "ar", "Contact us", "تواصل معنا"),
  };
}

export default async function ContactPage({
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
          {copy(locale, "Get in touch", "تواصل معنا")}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          {copy(
            locale,
            "Interested in a custom plan, onboarding support, or a demo? Send us a message and we will reply within one business day.",
            "مهتم بخطة مخصصة أو دعم الإعداد أو عرض توضيحي؟ أرسل لنا رسالة وسنرد في يوم عمل واحد.",
          )}
        </p>
      </div>
      <div className="flex items-start justify-center">
        <ContactForm locale={locale} />
      </div>
    </section>
  );
}
