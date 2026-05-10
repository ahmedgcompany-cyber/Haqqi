import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { isLocale, copy } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: copy(locale as "en" | "ar", "Sign in", "تسجيل الدخول"),
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoginForm locale={locale} />
    </div>
  );
}
