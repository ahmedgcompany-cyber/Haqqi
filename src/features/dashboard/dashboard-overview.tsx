"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  FileClock,
  FileSpreadsheet,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copy, type Locale } from "@/lib/i18n";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getCompanies } from "@/lib/data/companies";
import { getEmployees } from "@/lib/data/employees";
import { getAuditTrail } from "@/lib/data/audit";
import { getUsageStats } from "@/lib/data/usage";
import type { Company, Employee, AuditEvent } from "@/lib/types";
import Link from "next/link";

export function DashboardOverview({ locale }: { locale: Locale }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});
  const [tier, setTier] = useState("free");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        const [companiesData, employeesData, auditData, usageData, profile] = await Promise.all([
          getCompanies(supabase, uid),
          getEmployees(supabase, uid),
          getAuditTrail(supabase, uid),
          getUsageStats(supabase, uid),
          supabase.from("profiles").select("subscriptionTier").eq("id", uid).single(),
        ]);

        setCompanies(companiesData);
        setEmployees(employeesData);
        setAuditTrail(auditData);
        setUsageStats(usageData);
        setTier(profile.data?.subscriptionTier ?? "free");
        if (companiesData.length > 0) {
          setCompanyId(companiesData[0].id);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const company = companies.find((item) => item.id === companyId) ?? companies[0];
  const companyEmployees = useMemo(
    () => employees.filter((employee) => employee.companyId === company?.id),
    [employees, company?.id],
  );

  const totalLiability = companyEmployees.reduce(
    (total, employee) => total + employee.basicSalary * 0.9,
    0,
  );
  const upcomingSettlements = companyEmployees.filter(
    (employee) => employee.unusedLeaveDays > 10 || employee.status === "notice",
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted">{copy(locale, "Loading...", "جاري التحميل...")}</p>
      </div>
    );
  }

  return (
    <section className="grid gap-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 bg-gradient-to-br from-primary via-primary-strong to-slate-900 px-6 py-8 text-white lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              {copy(locale, "Executive dashboard", "اللوحة التنفيذية")}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-balance">
              {copy(
                locale,
                "Monitor compliance exposure across companies, payroll files, and final settlements.",
                "راقب التعرضات النظامية عبر الشركات وملفات الرواتب والتسويات النهائية.",
              )}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/75">
              {copy(
                locale,
                "Haqqi ships with a multi-company data model, a guided onboarding wizard, and an audit trail so every action is reviewable by finance, HR, and founders.",
                "يأتي حقي بنموذج بيانات متعدد الشركات ومعالج إعداد موجه وسجل تدقيق يجعل كل إجراء قابلاً للمراجعة من المالية والموارد البشرية والمؤسسين.",
              )}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-sm text-white/75">
              {copy(locale, "Active company", "الشركة النشطة")}
            </p>
            <select
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium outline-none"
            >
              {companies.map((item) => (
                <option key={item.id} value={item.id} className="text-slate-900">
                  {item.name}
                </option>
              ))}
            </select>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <QuickMetric
                icon={<Wallet className="h-5 w-5" />}
                label={copy(locale, "Gratuity liability", "التزام المكافآت")}
                value={formatCurrency(
                  totalLiability,
                  locale,
                  company?.country === "Saudi Arabia" ? "SAR" : "AED",
                )}
              />
              <QuickMetric
                icon={<Users className="h-5 w-5" />}
                label={copy(locale, "Employee count", "عدد الموظفين")}
                value={String(companyEmployees.length)}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy(locale, "At a glance", "نظرة عامة")}</CardTitle>
              <CardDescription>
                {copy(
                  locale,
                  "Core metrics founders care about before payroll cutoff.",
                  "المؤشرات الأساسية التي تهم المؤسسين قبل إقفال الرواتب.",
                )}
              </CardDescription>
            </div>
            <Badge variant="gold">
              {copy(locale, "Board-ready", "جاهزة للإدارة")}
            </Badge>
          </CardHeader>
          <div className="grid gap-4">
            <StatRow
              icon={<ShieldCheck className="h-5 w-5 text-success" />}
              label={copy(locale, "WPS readiness", "جاهزية حماية الأجور")}
              value={`${Math.min(companyEmployees.filter((e) => e.iban).length, companyEmployees.length)} / ${companyEmployees.length}`}
              note={copy(locale, "Employees with IBAN verified", "الموظفون الذين تم التحقق من الآيبان")}
            />
            <StatRow
              icon={<FileClock className="h-5 w-5 text-accent" />}
              label={copy(locale, "Upcoming settlements", "تسويات قادمة")}
              value={String(upcomingSettlements.length)}
              note={copy(locale, "Notice periods and leave balances", "فترات الإشعار وأرصدة الإجازات")}
            />
            <StatRow
              icon={<Building2 className="h-5 w-5 text-primary" />}
              label={copy(locale, "Companies tracked", "الشركات المتابعة")}
              value={String(companies.length)}
              note={copy(locale, "Each isolated under one workspace", "كل شركة معزولة داخل مساحة واحدة")}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy(locale, "Onboarding wizard", "معالج الإعداد")}</CardTitle>
              <CardDescription>
                {copy(
                  locale,
                  "Help a new company go live in one guided flow.",
                  "ساعد شركة جديدة على الانطلاق عبر تدفق إعداد موجه واحد.",
                )}
              </CardDescription>
            </div>
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </CardHeader>
          <ol className="space-y-4">
            {[
              copy(locale, "Create company profile and jurisdiction defaults", "إنشاء ملف الشركة والإعدادات القضائية"),
              copy(locale, "Invite HR admin and set permissions", "دعوة مسؤول الموارد البشرية وتحديد الأذونات"),
              copy(locale, "Import employees from Excel or add them manually", "استيراد الموظفين من إكسل أو إضافتهم يدوياً"),
              copy(locale, "Review WPS bank metadata and generate the first SIF file", "مراجعة بيانات البنك وإنشاء أول ملف حماية أجور"),
            ].map((step, index) => (
              <li key={step} className="flex gap-4 rounded-[1.4rem] border border-border bg-card-strong p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <div className="text-sm leading-7 text-muted">{step}</div>
              </li>
            ))}
          </ol>
          <div className="mt-5">
            <Link
              href={`/${locale}/employees`}
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              {copy(locale, "Start guided setup", "ابدأ الإعداد الموجه")}
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy(locale, "Usage this month", "الاستخدام هذا الشهر")}</CardTitle>
              <CardDescription>
                {copy(
                  locale,
                  "Track your feature usage against your plan limits.",
                  "تتبع استخدام الميزات مقابل حدود خطتك.",
                )}
              </CardDescription>
            </div>
            <Bell className="h-6 w-6 text-accent" />
          </CardHeader>
          <div className="space-y-4 rounded-[1.4rem] border border-border bg-card-strong p-4 text-sm text-muted">
            {Object.entries(usageStats).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{key.replace(/_/g, " ")}</span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
            <div className="mt-2 border-t border-border pt-2">
              <span className="text-xs">
                {copy(locale, "Current plan: ", "الخطة الحالية: ")}
                <span className="font-semibold capitalize text-foreground">{tier}</span>
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy(locale, "Settlement queue", "قائمة التسويات")}</CardTitle>
              <CardDescription>
                {copy(locale, "High-priority employees to review this week.", "الموظفون ذوو الأولوية للمراجعة هذا الأسبوع.")}
              </CardDescription>
            </div>
            <Badge variant="success">
              {copy(locale, "Actionable", "يتطلب إجراء")}
            </Badge>
          </CardHeader>
          <div className="space-y-4">
            {upcomingSettlements.map((employee) => (
              <div
                key={employee.id}
                className="flex flex-col gap-3 rounded-[1.4rem] border border-border bg-card-strong p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{employee.name}</p>
                  <p className="text-sm text-muted">
                    {employee.country} • {employee.employeeNumber} • {copy(locale, "Leave days", "أيام الإجازة")}{" "}
                    {employee.unusedLeaveDays}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={employee.status === "notice" ? "gold" : "default"}>
                    {employee.status}
                  </Badge>
                  <Link
                    href={`/${locale}/settlements`}
                    className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                  >
                    {copy(locale, "Open settlement", "فتح التسوية")}
                  </Link>
                </div>
              </div>
            ))}
            {upcomingSettlements.length === 0 && (
              <p className="text-sm text-muted">
                {copy(locale, "No upcoming settlements.", "لا توجد تسويات قادمة.")}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy(locale, "Audit trail", "سجل التدقيق")}</CardTitle>
              <CardDescription>
                {copy(locale, "Every critical action captured for compliance review.", "يتم تسجيل كل إجراء حرج للمراجعة النظامية.")}
              </CardDescription>
            </div>
            <ShieldCheck className="h-6 w-6 text-success" />
          </CardHeader>
          <div className="space-y-4">
            {auditTrail.map((entry) => (
              <div key={entry.id} className="rounded-[1.4rem] border border-border bg-card-strong p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-foreground">{entry.action}</p>
                  <Badge>{copy(locale, "Logged", "تم التوثيق")}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {entry.actor} • {entry.entity}
                </p>
                <p className="mt-1 text-xs text-muted">{formatDate(entry.createdAt, locale)}</p>
              </div>
            ))}
            {auditTrail.length === 0 && (
              <p className="text-sm text-muted">
                {copy(locale, "No audit events yet.", "لا توجد أحداث تدقيق بعد.")}
              </p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

function QuickMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/12 bg-white/10 p-4">
      <div className="flex items-center gap-2 text-white/80">{icon}</div>
      <p className="mt-3 text-sm text-white/70">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[1.4rem] border border-border bg-card-strong p-4">
      <div className="flex gap-3">
        <div className="mt-1">{icon}</div>
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="mt-1 text-sm text-muted">{note}</p>
        </div>
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
