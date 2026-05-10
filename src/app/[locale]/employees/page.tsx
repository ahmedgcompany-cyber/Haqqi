import { notFound } from "next/navigation";
import { EmployeeRoster } from "@/features/employees/employee-roster";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <EmployeeRoster locale={locale as Locale} />;
}