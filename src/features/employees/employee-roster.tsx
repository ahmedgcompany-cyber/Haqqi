"use client";

import * as XLSX from "xlsx";
import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { copy, type Locale } from "@/lib/i18n";
import type { Company, Employee } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getCompanies } from "@/lib/data/companies";
import { getEmployees, createEmployee, deleteEmployee } from "@/lib/data/employees";
import { checkUsageLimit, logUsage } from "@/lib/data/usage";
import { logAudit } from "@/lib/data/audit";
import { UsageBanner } from "@/components/billing/usage-banner";

export function EmployeeRoster({ locale }: { locale: Locale }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);
  const [tier, setTier] = useState("free");

  const [form, setForm] = useState<Omit<Employee, "id" | "userId">>({
    companyId: "",
    name: "",
    nationality: "",
    salary: 0,
    basicSalary: 0,
    startDate: "2026-01-01",
    contractType: "limited",
    country: "UAE",
    iban: "",
    employeeNumber: "",
    status: "active",
    unusedLeaveDays: 0,
  });

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
        const [companiesData, employeesData, usageResult, profile] = await Promise.all([
          getCompanies(supabase, uid),
          getEmployees(supabase, uid),
          checkUsageLimit(supabase, uid, "employee_add", "free"),
          supabase.from("profiles").select("subscriptionTier").eq("id", uid).single(),
        ]);

        setCompanies(companiesData);
        setEmployees(employeesData);
        setUsage({ current: usageResult.current, limit: usageResult.limit });
        setTier(profile.data?.subscriptionTier ?? "free");

        if (companiesData.length > 0) {
          setForm((f) => ({ ...f, companyId: companiesData[0].id }));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const filtered = useMemo(
    () =>
      employees.filter((employee) =>
        `${employee.name} ${employee.nationality} ${employee.employeeNumber}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [employees, search],
  );

  async function addEmployee() {
    if (!form.name || !form.employeeNumber || !userId) {
      return;
    }

    const supabase = createClient();
    const limit = await checkUsageLimit(supabase, userId, "employee_add", tier);
    if (!limit.allowed) {
      alert(copy(locale, "Employee limit reached. Upgrade to add more.", "تم الوصول لحد الموظفين. رقي خطتك لإضافة المزيد."));
      return;
    }

    try {
      const created = await createEmployee(supabase, userId, form);
      setEmployees((current) => [created, ...current]);
      await logUsage(supabase, userId, "employee_add");
      await logAudit(supabase, userId, "User", "employee_added", created.name);
      setUsage((u) => (u ? { ...u, current: u.current + 1 } : null));
      setForm((current) => ({
        ...current,
        name: "",
        nationality: "",
        salary: 0,
        basicSalary: 0,
        iban: "",
        employeeNumber: "",
        unusedLeaveDays: 0,
      }));
    } catch {
      alert(copy(locale, "Failed to add employee", "فشل إضافة الموظف"));
    }
  }

  async function removeEmployee(id: string) {
    if (!userId) return;
    const supabase = createClient();
    try {
      await deleteEmployee(supabase, userId, id);
      setEmployees((current) => current.filter((e) => e.id !== id));
      await logAudit(supabase, userId, "User", "employee_deleted", id);
    } catch {
      alert(copy(locale, "Failed to delete employee", "فشل حذف الموظف"));
    }
  }

  function exportRoster() {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((employee) => ({
        Name: employee.name,
        Company: companies.find((company) => company.id === employee.companyId)?.name ?? "",
        Nationality: employee.nationality,
        Country: employee.country,
        Salary: employee.salary,
        BasicSalary: employee.basicSalary,
        StartDate: employee.startDate,
        ContractType: employee.contractType,
        EmployeeNumber: employee.employeeNumber,
        Status: employee.status,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "haqqi-employee-roster.xlsx");
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted">{copy(locale, "Loading...", "جاري التحميل...")}</p>
      </div>
    );
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy(locale, "Employee roster", "سجل الموظفين")}</CardTitle>
            <CardDescription>
              {copy(
                locale,
                "Manage employee basics, compensation, and contract data across companies.",
                "أدر بيانات الموظفين الأساسية والتعويضات والعقود عبر الشركات.",
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={exportRoster}>
              <Download className="h-4 w-4" />
              {copy(locale, "Export Excel", "تصدير إكسل")}
            </Button>
          </div>
        </CardHeader>

        {usage && <UsageBanner locale={locale} feature={copy(locale, "Employees", "الموظفون")} current={usage.current} limit={usage.limit} />}

        <div className="mb-5 flex items-center gap-3 rounded-[1.4rem] border border-border bg-card-strong p-4">
          <Search className="h-4 w-4 text-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy(locale, "Search employees...", "ابحث عن الموظفين...")}
            className="border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0"
          />
        </div>

        <div className="overflow-hidden rounded-[1.4rem] border border-border bg-card-strong">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.5fr] gap-4 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
            <span>{copy(locale, "Employee", "الموظف")}</span>
            <span>{copy(locale, "Salary", "الراتب")}</span>
            <span>{copy(locale, "Start date", "تاريخ البداية")}</span>
            <span>{copy(locale, "Status", "الحالة")}</span>
            <span />
          </div>
          {filtered.map((employee) => (
            <div
              key={employee.id}
              className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.5fr] gap-4 border-b border-border/80 px-4 py-4 text-sm last:border-b-0"
            >
              <div>
                <p className="font-semibold text-foreground">{employee.name}</p>
                <p className="text-muted">
                  {employee.nationality} • {employee.employeeNumber}
                </p>
              </div>
              <div className="text-foreground">
                {formatCurrency(employee.salary, locale, employee.country === "Saudi Arabia" ? "SAR" : "AED")}
              </div>
              <div className="text-muted">{formatDate(employee.startDate, locale)}</div>
              <div>
                <Badge
                  variant={
                    employee.status === "active"
                      ? "success"
                      : employee.status === "notice"
                        ? "gold"
                        : "default"
                  }
                >
                  {employee.status}
                </Badge>
              </div>
              <div>
                <Button variant="ghost" size="sm" onClick={() => removeEmployee(employee.id)}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy(locale, "Add employee", "إضافة موظف")}</CardTitle>
            <CardDescription>
              {copy(
                locale,
                "Keep payroll and settlement inputs current with a lightweight editor.",
                "حافظ على حداثة مدخلات الرواتب والتسويات عبر محرر خفيف.",
              )}
            </CardDescription>
          </div>
          <Users className="h-6 w-6 text-primary" />
        </CardHeader>
        <div className="grid gap-4">
          <Field label={copy(locale, "Company", "الشركة")}>
            <Select
              value={form.companyId}
              onChange={(event) => setForm({ ...form, companyId: event.target.value })}
            >
              <option value="">{copy(locale, "Select company...", "اختر شركة...")}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={copy(locale, "Full name", "الاسم الكامل")}>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label={copy(locale, "Nationality", "الجنسية")}>
            <Input
              value={form.nationality}
              onChange={(event) => setForm({ ...form, nationality: event.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy(locale, "Monthly salary", "الراتب الشهري")}>
              <Input
                type="number"
                value={form.salary}
                onChange={(event) =>
                  setForm({ ...form, salary: Number(event.target.value) })
                }
              />
            </Field>
            <Field label={copy(locale, "Basic salary", "الراتب الأساسي")}>
              <Input
                type="number"
                value={form.basicSalary}
                onChange={(event) =>
                  setForm({ ...form, basicSalary: Number(event.target.value) })
                }
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy(locale, "Employee number", "الرقم الوظيفي")}>
              <Input
                value={form.employeeNumber}
                onChange={(event) =>
                  setForm({ ...form, employeeNumber: event.target.value })
                }
              />
            </Field>
            <Field label={copy(locale, "Start date", "تاريخ البداية")}>
              <Input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy(locale, "Contract type", "نوع العقد")}>
              <Select
                value={form.contractType}
                onChange={(event) => setForm({ ...form, contractType: event.target.value as "limited" | "unlimited" })}
              >
                <option value="limited">{copy(locale, "Limited", "محدد المدة")}</option>
                <option value="unlimited">{copy(locale, "Unlimited", "غير محدد المدة")}</option>
              </Select>
            </Field>
            <Field label={copy(locale, "Status", "الحالة")}>
              <Select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as "active" | "notice" | "terminated" })}
              >
                <option value="active">{copy(locale, "Active", "نشط")}</option>
                <option value="notice">{copy(locale, "Notice", "إشعار")}</option>
                <option value="terminated">{copy(locale, "Terminated", "منتهي")}</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy(locale, "Country", "الدولة")}>
              <Select
                value={form.country}
                onChange={(event) => setForm({ ...form, country: event.target.value as import("@/lib/types").Country })}
              >
                {["UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label={copy(locale, "Unused leave days", "أيام الإجازة غير المستخدمة")}>
              <Input
                type="number"
                value={form.unusedLeaveDays}
                onChange={(event) => setForm({ ...form, unusedLeaveDays: Number(event.target.value) })}
              />
            </Field>
          </div>
          <Field label={copy(locale, "IBAN", "الآيبان")}>
            <Input
              value={form.iban}
              onChange={(event) => setForm({ ...form, iban: event.target.value })}
            />
          </Field>
          <Button onClick={addEmployee}>
            <Plus className="h-4 w-4" />
            {copy(locale, "Save employee", "حفظ الموظف")}
          </Button>
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
