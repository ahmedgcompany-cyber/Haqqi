"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { copy, type Locale } from "@/lib/i18n";
import type { Company, Country } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getCompanies, createCompany, deleteCompany } from "@/lib/data/companies";
import { checkUsageLimit, logUsage } from "@/lib/data/usage";
import { logAudit } from "@/lib/data/audit";
import { UsageBanner } from "@/components/billing/usage-banner";

const countries: Country[] = ["UAE", "Saudi Arabia", "Kuwait", "Qatar", "Bahrain", "Oman"];

export function CompanyManager({ locale }: { locale: Locale }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);
  const [tier, setTier] = useState("free");

  const [form, setForm] = useState<Omit<Company, "id" | "userId">>({
    name: "",
    tradeLicense: "",
    country: "UAE",
    bankCode: "",
    wpsEstablishmentId: "",
    email: "",
    contactName: "",
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
        const [companiesData, usageResult, profile] = await Promise.all([
          getCompanies(supabase, uid),
          checkUsageLimit(supabase, uid, "company_add", "free"),
          supabase.from("profiles").select("subscriptionTier").eq("id", uid).single(),
        ]);

        setCompanies(companiesData);
        setUsage({ current: usageResult.current, limit: usageResult.limit });
        setTier(profile.data?.subscriptionTier ?? "free");
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function addCompany() {
    if (!form.name || !userId) return;

    const supabase = createClient();
    const limit = await checkUsageLimit(supabase, userId, "company_add", tier);
    if (!limit.allowed) {
      alert(copy(locale, "Company limit reached. Upgrade to add more.", "تم الوصول لحد الشركات. رقي خطتك لإضافة المزيد."));
      return;
    }

    try {
      const created = await createCompany(supabase, userId, form);
      setCompanies((current) => [created, ...current]);
      await logUsage(supabase, userId, "company_add");
      await logAudit(supabase, userId, "User", "company_added", created.name);
      setUsage((u) => (u ? { ...u, current: u.current + 1 } : null));
      setForm({
        name: "",
        tradeLicense: "",
        country: "UAE",
        bankCode: "",
        wpsEstablishmentId: "",
        email: "",
        contactName: "",
      });
    } catch {
      alert(copy(locale, "Failed to add company", "فشل إضافة الشركة"));
    }
  }

  async function removeCompany(id: string) {
    if (!userId) return;
    const supabase = createClient();
    try {
      await deleteCompany(supabase, userId, id);
      setCompanies((current) => current.filter((c) => c.id !== id));
      await logAudit(supabase, userId, "User", "company_deleted", id);
    } catch {
      alert(copy(locale, "Failed to delete company", "فشل حذف الشركة"));
    }
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
            <CardTitle>{copy(locale, "Companies", "الشركات")}</CardTitle>
            <CardDescription>
              {copy(locale, "Manage your company profiles and jurisdiction settings.", "أدر ملفات الشركات وإعدادات الاختصاص القضائي.")}
            </CardDescription>
          </div>
          <Building2 className="h-6 w-6 text-primary" />
        </CardHeader>

        {usage && <UsageBanner locale={locale} feature={copy(locale, "Companies", "الشركات")} current={usage.current} limit={usage.limit} />}

        <div className="space-y-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between rounded-[1.4rem] border border-border bg-card-strong p-4"
            >
              <div>
                <p className="font-semibold text-foreground">{company.name}</p>
                <p className="text-sm text-muted">
                  {company.country} • {company.tradeLicense}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeCompany(company.id)}>
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          ))}
          {companies.length === 0 && (
            <p className="text-sm text-muted">
              {copy(locale, "No companies yet.", "لا توجد شركات بعد.")}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{copy(locale, "Add company", "إضافة شركة")}</CardTitle>
            <CardDescription>
              {copy(locale, "Register a new company for compliance tracking.", "سجل شركة جديدة لتتبع الامتثال.")}
            </CardDescription>
          </div>
          <Building2 className="h-6 w-6 text-primary" />
        </CardHeader>
        <div className="grid gap-4">
          <Field label={copy(locale, "Company name", "اسم الشركة")}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label={copy(locale, "Trade license", "الرخصة التجارية")}>
            <Input value={form.tradeLicense} onChange={(e) => setForm({ ...form, tradeLicense: e.target.value })} />
          </Field>
          <Field label={copy(locale, "Country", "الدولة")}>
            <Select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value as Country })}>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label={copy(locale, "Bank code", "رمز البنك")}>
            <Input value={form.bankCode} onChange={(e) => setForm({ ...form, bankCode: e.target.value })} />
          </Field>
          <Field label={copy(locale, "WPS establishment ID", "معرف منشأة WPS")}>
            <Input value={form.wpsEstablishmentId} onChange={(e) => setForm({ ...form, wpsEstablishmentId: e.target.value })} />
          </Field>
          <Field label={copy(locale, "Email", "البريد الإلكتروني")}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label={copy(locale, "Contact name", "اسم المسؤول")}>
            <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          </Field>
          <Button onClick={addCompany}>
            <Plus className="h-4 w-4" />
            {copy(locale, "Save company", "حفظ الشركة")}
          </Button>
        </div>
      </Card>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
