import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { Locale } from "@/lib/i18n";

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <ResetPasswordForm locale={locale} />
    </div>
  );
}
