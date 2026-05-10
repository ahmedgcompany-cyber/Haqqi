import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import type { Locale } from "@/lib/i18n";

export default async function UpdatePasswordPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <UpdatePasswordForm locale={locale} />
    </div>
  );
}
