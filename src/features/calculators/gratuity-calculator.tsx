"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Landmark, Scale, ShieldCheck } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { calculateGratuity } from "@/features/calculators/gratuity";
import { copy, type Locale } from "@/lib/i18n";
import type { ContractType, Country, Currency, TerminationReason } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { checkUsageLimit, logUsage } from "@/lib/data/usage";
import { logAudit } from "@/lib/data/audit";
import { UsageBanner } from "@/components/billing/usage-banner";

const countries: Country[] = ["UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman"];
const currencies: Currency[] = ["AED", "SAR", "KWD", "QAR", "BHD", "OMR"];

const countryCurrencyMap: Record<Country, Currency> = {
  UAE: "AED",
  "Saudi Arabia": "SAR",
  Kuwait: "KWD",
  Qatar: "QAR",
  Bahrain: "BHD",
  Oman: "OMR",
};

export function GratuityCalculator({ locale }: { locale: Locale }) {
  const [country, setCountry] = useState<Country>("UAE");
  const [contractType, setContractType] = useState<ContractType>("limited");
  const [terminationReason, setTerminationReason] =
    useState<TerminationReason>("employer_termination");
  const [basicSalary, setBasicSalary] = useState(9000);
  const [monthlySalary, setMonthlySalary] = useState(12800);
  const [yearsOfService, setYearsOfService] = useState(5.2);
  const [currency, setCurrency] = useState<Currency>("AED");
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);

  useEffect(() => {
    setCurrency(countryCurrencyMap[country]);
  }, [country]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user.id;
      if (!userId) return;
      try {
        const result = await checkUsageLimit(supabase, userId, "gratuity_calc", "free");
        setUsage({ current: result.current, limit: result.limit });
        if (result.allowed) {
          await logUsage(supabase, userId, "gratuity_calc");
          await logAudit(supabase, userId, "User", "gratuity_calculated", "calculator");
        }
      } catch {
        // ignore
      }
    });
  }, []);

  const result = useMemo(
    () =>
      calculateGratuity({
        country,
        contractType,
        terminationReason,
        monthlySalary,
        basicSalary,
        yearsOfService,
        currency,
      }),
    [basicSalary, contractType, country, monthlySalary, terminationReason, yearsOfService, currency],
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="overflow-hidden">
        <div className="grid-pattern rounded-[1.2rem] p-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {copy(locale, "Gratuity calculator", "حاسبة المكافأة")}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-balance text-foreground">
              {copy(
                locale,
                "Model end-of-service gratuity across the GCC in minutes.",
                "نمذج مكافأة نهاية الخدمة عبر الخليج خلال دقائق.",
              )}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              {copy(
                locale,
                "Switch between UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, and Oman. UAE and Saudi rules reflect the core statutory formulas and resignation treatments.",
                "تنقل بين الإمارات والسعودية والكويت وقطر والبحرين وعُمان. تعكس قواعد الإمارات والسعودية الصيغ النظامية الأساسية ومعالجات الاستقالة.",
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label={copy(locale, "Country", "الدولة")}>
            <Select
              value={country}
              onChange={(event) => setCountry(event.target.value as Country)}
            >
              {countries.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={copy(locale, "Currency", "العملة")}>
            <Select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
            >
              {currencies.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={copy(locale, "Contract type", "نوع العقد")}>
            <Select
              value={contractType}
              onChange={(event) => setContractType(event.target.value as ContractType)}
            >
              <option value="limited">{copy(locale, "Limited", "محدد المدة")}</option>
              <option value="unlimited">{copy(locale, "Unlimited", "غير محدد المدة")}</option>
            </Select>
          </Field>

          <Field label={copy(locale, "Termination reason", "سبب إنهاء العلاقة")}>
            <Select
              value={terminationReason}
              onChange={(event) =>
                setTerminationReason(event.target.value as TerminationReason)
              }
            >
              <option value="employer_termination">
                {copy(locale, "Employer termination", "إنهاء من صاحب العمل")}
              </option>
              <option value="employee_resignation">
                {copy(locale, "Employee resignation", "استقالة الموظف")}
              </option>
              <option value="end_of_contract">
                {copy(locale, "End of contract", "انتهاء العقد")}
              </option>
              <option value="mutual_agreement">
                {copy(locale, "Mutual agreement", "اتفاق متبادل")}
              </option>
            </Select>
          </Field>

          <Field label={copy(locale, "Years of service", "سنوات الخدمة")}>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={yearsOfService}
              onChange={(event) => setYearsOfService(Number(event.target.value))}
            />
          </Field>

          <Field label={copy(locale, "Monthly salary", "الراتب الشهري")}>
            <Input
              type="number"
              min="0"
              step="100"
              value={monthlySalary}
              onChange={(event) => setMonthlySalary(Number(event.target.value))}
            />
          </Field>

          <Field label={copy(locale, "Basic salary", "الراتب الأساسي")}>
            <Input
              type="number"
              min="0"
              step="100"
              value={basicSalary}
              onChange={(event) => setBasicSalary(Number(event.target.value))}
            />
          </Field>
        </div>

        {usage && <UsageBanner locale={locale} feature={copy(locale, "Calculations", "الحسابات")} current={usage.current} limit={usage.limit} />}
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy(locale, "Estimated gratuity", "المكافأة التقديرية")}</CardTitle>
              <CardDescription>
                {copy(
                  locale,
                  "Live calculation based on the selected statutory preset.",
                  "حساب مباشر وفق الإعداد النظامي المختار.",
                )}
              </CardDescription>
            </div>
            <Calculator className="h-6 w-6 text-primary" />
          </CardHeader>
          <div className="space-y-5">
            <div>
              <div className="text-4xl font-semibold text-foreground">
                {formatCurrency(result.amount, locale, currency)}
              </div>
              <p className="mt-2 text-sm text-muted">
                {copy(locale, "Daily rate", "الأجر اليومي")}:{" "}
                {formatCurrency(result.dailyRate, locale, currency)}
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-border bg-card-strong p-4">
              <p className="text-sm font-semibold text-foreground">
                {copy(locale, "Legal basis", "الأساس النظامي")}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">{result.legalReference}</p>
            </div>

            <ul className="space-y-3 text-sm leading-6 text-muted">
              {result.explanation.map((line) => (
                <li key={line} className="flex gap-3">
                  <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-success" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{copy(locale, "Quick benchmarks", "مؤشرات سريعة")}</CardTitle>
              <CardDescription>
                {copy(
                  locale,
                  "Use these to sanity-check payroll assumptions before issuing letters.",
                  "استخدمها للتحقق من افتراضات الرواتب قبل إصدار الخطابات.",
                )}
              </CardDescription>
            </div>
            <Landmark className="h-6 w-6 text-accent" />
          </CardHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <BenchmarkCard
              label={copy(locale, "Service years", "سنوات الخدمة")}
              value={formatNumber(yearsOfService, locale, 1)}
              note={copy(locale, "Rounded for display", "مقرب للعرض")}
            />
            <BenchmarkCard
              label={copy(locale, "Monthly / basic ratio", "نسبة الشهري إلى الأساسي")}
              value={`${formatNumber(monthlySalary / Math.max(basicSalary, 1), locale, 2)}x`}
              note={copy(locale, "Useful for UAE and leave pay", "مفيد للإمارات وبدل الإجازات")}
            />
          </div>

          <div className="mt-4 rounded-[1.4rem] border border-primary/15 bg-primary/8 p-4 text-sm leading-6 text-muted">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Scale className="h-4 w-4 text-primary" />
              {copy(locale, "Compliance note", "ملاحظة امتثال")}
            </div>
            <p className="mt-2">
              {copy(
                locale,
                "For UAE and Saudi Arabia, Haqqi applies the standard statutory formula. Complex carve-outs such as disciplinary dismissal, special sectors, or court awards should still be reviewed by counsel.",
                "في الإمارات والسعودية يطبق حقي الصيغة النظامية الأساسية. أما الحالات الخاصة مثل الفصل التأديبي أو القطاعات الخاصة أو أحكام المحاكم فينبغي مراجعتها قانونياً.",
              )}
            </p>
          </div>
        </Card>
      </div>
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

function BenchmarkCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border bg-card-strong p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}
