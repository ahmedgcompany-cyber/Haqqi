"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { copy, type Locale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { calculateSettlement } from "@/features/settlements/settlement";
import { createSettlementPdf } from "@/features/settlements/settlement-pdf";
import { createClient } from "@/lib/supabase/client";
import { getEmployees } from "@/lib/data/employees";
import { checkUsageLimit, logUsage } from "@/lib/data/usage";
import { logAudit } from "@/lib/data/audit";
import { UsageBanner } from "@/components/billing/usage-banner";
import type { Employee } from "@/lib/types";

export function SettlementGenerator({ locale }: { locale: Locale }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [noticeDays, setNoticeDays] = useState(30);
  const [pendingSalaryDays, setPendingSalaryDays] = useState(5);
  const [deductions, setDeductions] = useState(0);
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
        const [employeesData, usageResult, profile] = await Promise.all([
          getEmployees(supabase, uid),
          checkUsageLimit(supabase, uid, "settlement_pdf", "free"),
          supabase.from("profiles").select("subscriptionTier").eq("id", uid).single(),
        ]);

        setEmployees(employeesData);
        if (employeesData.length > 0) {
          setEmployeeId(employeesData[0].id);
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

  const employee = employees.find((item) => item.id === employeeId) ?? employees[0];

  const settlement = useMemo(() => {
    if (!employee) {
      return {
        gratuity: 0,
        leaveEncashment: 0,
        noticePay: 0,
        pendingSalary: 0,
        deductions: 0,
        total: 0,
      };
    }
    return calculateSettlement({
      country: employee.country,
      contractType: employee.contractType,
      terminationReason: employee.status === "notice" ? "employee_resignation" : "end_of_contract",
      monthlySalary: employee.salary,
      basicSalary: employee.basicSalary,
      yearsOfService:
        (Date.now() - new Date(employee.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      unusedLeaveDays: employee.unusedLeaveDays,
      noticeDays,
      pendingSalaryDays,
      deductions,
    });
  }, [deductions, employee, noticeDays, pendingSalaryDays]);

  const currency = employee?.country === "Saudi Arabia" ? "SAR" : "AED";

  async function handleGeneratePdf() {
    if (!employee || !userId) return;
    const supabase = createClient();
    const limit = await checkUsageLimit(supabase, userId, "settlement_pdf", tier);
    if (!limit.allowed) {
      alert(copy(locale, "Settlement PDF limit reached. Upgrade to generate more.", "تم الوصول لحد PDF التسوية. رقي خطتك للمزيد."));
      return;
    }

    createSettlementPdf({ employee, result: settlement, locale });
    await logUsage(supabase, userId, "settlement_pdf");
    await logAudit(supabase, userId, "User", "settlement_created", employee.name);
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
    <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy(locale, "Settlement generator", "منشئ التسوية")}</CardTitle>
            <CardDescription>
              {copy(
                locale,
                "Combine gratuity, leave encashment, notice pay, and deductions into a bilingual PDF-ready breakdown.",
                "ادمج المكافأة وبدل الإجازة وبدل الإشعار والاستقطاعات في كشف ثنائي اللغة جاهز لملف PDF.",
              )}
            </CardDescription>
          </div>
          <Wallet className="h-6 w-6 text-primary" />
        </CardHeader>
        <div className="grid gap-4">
          <Field label={copy(locale, "Employee", "الموظف")}>
            <Select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
              {employees.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy(locale, "Notice days", "أيام الإشعار")}>
              <Input
                type="number"
                value={noticeDays}
                onChange={(event) => setNoticeDays(Number(event.target.value))}
              />
            </Field>
            <Field label={copy(locale, "Pending salary days", "أيام الراتب المستحق")}>
              <Input
                type="number"
                value={pendingSalaryDays}
                onChange={(event) => setPendingSalaryDays(Number(event.target.value))}
              />
            </Field>
          </div>
          <Field label={copy(locale, "Deductions", "الاستقطاعات")}>
            <Input
              type="number"
              value={deductions}
              onChange={(event) => setDeductions(Number(event.target.value))}
            />
          </Field>

          {usage && <UsageBanner locale={locale} feature={copy(locale, "Settlement PDFs", "ملفات PDF التسوية")} current={usage.current} limit={usage.limit} />}

          <Button onClick={handleGeneratePdf}>
            <Download className="h-4 w-4" />
            {copy(locale, "Generate PDF", "إنشاء PDF")}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy(locale, "Settlement summary", "ملخص التسوية")}</CardTitle>
            <CardDescription>
              {copy(locale, "Live preview for approvals and employee communication.", "معاينة مباشرة للاعتمادات والتواصل مع الموظف.")}
            </CardDescription>
          </div>
          <FileText className="h-6 w-6 text-accent" />
        </CardHeader>

        <div className="space-y-4">
          <SummaryRow
            label={copy(locale, "Gratuity", "المكافأة")}
            value={formatCurrency(settlement.gratuity, locale, currency)}
          />
          <SummaryRow
            label={copy(locale, "Unused leave", "بدل الإجازة")}
            value={formatCurrency(settlement.leaveEncashment, locale, currency)}
          />
          <SummaryRow
            label={copy(locale, "Notice pay", "بدل الإشعار")}
            value={formatCurrency(settlement.noticePay, locale, currency)}
          />
          <SummaryRow
            label={copy(locale, "Pending salary", "راتب مستحق")}
            value={formatCurrency(settlement.pendingSalary, locale, currency)}
          />
          <SummaryRow
            label={copy(locale, "Deductions", "الاستقطاعات")}
            value={formatCurrency(settlement.deductions, locale, currency)}
          />

          <div className="rounded-[1.6rem] border border-primary/15 bg-primary/8 p-5">
            <p className="text-sm text-muted">{copy(locale, "Net total", "الإجمالي الصافي")}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {formatCurrency(settlement.total, locale, currency)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {copy(
                locale,
                "This preview can be issued as a bilingual PDF. Company letterhead and e-signature flows can be added later.",
                "يمكن إصدار هذه المعاينة كملف PDF ثنائي اللغة. ويمكن إضافة ترويسة الشركة وتوقيع إلكتروني لاحقاً.",
              )}
            </p>
          </div>
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

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[1.4rem] border border-border bg-card-strong p-4">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-base font-semibold text-foreground">{value}</span>
    </div>
  );
}
