"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { copy, type Locale } from "@/lib/i18n";
import { downloadTextFile, formatCurrency } from "@/lib/utils";
import { generateSifFile } from "@/features/wps/sif";
import { createClient } from "@/lib/supabase/client";
import { getCompanies } from "@/lib/data/companies";
import { getEmployeesByCompany } from "@/lib/data/employees";
import { checkUsageLimit, logUsage } from "@/lib/data/usage";
import { logAudit } from "@/lib/data/audit";
import { UsageBanner } from "@/components/billing/usage-banner";
import type { Company, Employee } from "@/lib/types";

export function WpsGenerator({ locale }: { locale: Locale }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [month, setMonth] = useState("2026-05");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);
  const [tier, setTier] = useState("free");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      setUserId(uid);

      try {
        const [companiesData, usageResult, profile] = await Promise.all([
          getCompanies(supabase, uid),
          checkUsageLimit(supabase, uid, "wps_export", "free"),
          supabase.from("profiles").select("subscriptionTier").eq("id", uid).single(),
        ]);

        const uaeCompanies = companiesData.filter((c) => c.country === "UAE");
        setCompanies(uaeCompanies);
        if (uaeCompanies.length > 0) {
          setCompanyId(uaeCompanies[0].id);
          const emps = await getEmployeesByCompany(supabase, uid, uaeCompanies[0].id);
          setEmployees(emps.filter((e) => e.country === "UAE"));
        }
        setUsage({ current: usageResult.current, limit: usageResult.limit });
        setTier(profile.data?.subscriptionTier ?? "free");
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!companyId || !userId) return;
    const supabase = createClient();
    getEmployeesByCompany(supabase, userId, companyId).then((emps) => {
      setEmployees(emps.filter((e) => e.country === "UAE"));
    });
  }, [companyId, userId]);

  const company = companies.find((item) => item.id === companyId);

  const sifContent = useMemo(() => {
    if (!company) return "";
    return generateSifFile({ company, employees, month });
  }, [company, employees, month]);

  const totalPayroll = employees.reduce((sum, employee) => sum + employee.salary, 0);

  async function handleDownload() {
    if (!userId) return;
    const supabase = createClient();
    const limit = await checkUsageLimit(supabase, userId, "wps_export", tier);
    if (!limit.allowed) {
      alert(copy(locale, "WPS export limit reached. Upgrade to export more.", "تم الوصول لحد تصدير WPS. رقي خطتك للمزيد."));
      return;
    }

    downloadTextFile(`haqqi-wps-${company?.name ?? "export"}-${month}.sif`, sifContent, "text/plain");
    await logUsage(supabase, userId, "wps_export");
    await logAudit(supabase, userId, "User", "wps_generated", company?.name ?? "export");
    setUsage((u) => (u ? { ...u, current: u.current + 1 } : null));
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted">{copy(locale, "Loading...", "جاري التحميل...")}</p>
      </div>
    );
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy(locale, "WPS / SIF generator", "منشئ ملفات حماية الأجور")}</CardTitle>
            <CardDescription>
              {copy(
                locale,
                "Build a UAE SIF file using your employee roster, salary figures, and bank metadata.",
                "أنشئ ملف SIF إماراتي باستخدام سجل الموظفين وبيانات الرواتب وبيانات البنك.",
              )}
            </CardDescription>
          </div>
          <FileSpreadsheet className="h-6 w-6 text-primary" />
        </CardHeader>
        <div className="grid gap-4">
          <Field label={copy(locale, "Company", "الشركة")}>
            <Select value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
              {companies.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={copy(locale, "Payroll month", "شهر الرواتب")}>
            <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </Field>

          {usage && <UsageBanner locale={locale} feature={copy(locale, "WPS exports", "تصدير WPS")} current={usage.current} limit={usage.limit} />}

          <div className="rounded-[1.5rem] border border-border bg-card-strong p-5">
            <p className="text-sm text-muted">
              {copy(locale, "Preview totals", "إجماليات المعاينة")}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  {copy(locale, "Employees", "الموظفون")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {employees.length}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  {copy(locale, "Total payroll", "إجمالي الرواتب")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatCurrency(totalPayroll, locale, "AED")}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-primary/15 bg-primary/8 p-5 text-sm leading-7 text-muted">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              {copy(locale, "UAE SIF structure", "هيكل ملف SIF الإماراتي")}
            </div>
            <p className="mt-2">
              {copy(
                locale,
                "Haqqi generates a simple header and employee detail record set that can be extended for bank-specific validations later.",
                "ينشئ حقي سجلاً رأسياً بسيطاً وسجلات تفصيلية للموظفين ويمكن توسيعه لاحقاً للتحقق الخاص بكل بنك.",
              )}
            </p>
          </div>

          <Button onClick={handleDownload}>
            <Download className="h-4 w-4" />
            {copy(locale, "Download SIF file", "تنزيل ملف SIF")}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy(locale, "Generated file preview", "معاينة الملف المُنشأ")}</CardTitle>
            <CardDescription>
              {copy(
                locale,
                "Review the output before sending it to your bank or payroll partner.",
                "راجع المخرجات قبل إرسالها إلى البنك أو شريك الرواتب.",
              )}
            </CardDescription>
          </div>
          <FileSpreadsheet className="h-6 w-6 text-accent" />
        </CardHeader>
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-slate-950 text-slate-100">
          <div className="border-b border-slate-800 px-5 py-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            {copy(locale, "SIF file lines", "سطور ملف SIF")}
          </div>
          <pre className="overflow-x-auto p-5 text-xs leading-7 whitespace-pre-wrap">
            {sifContent}
          </pre>
        </div>
      </Card>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
