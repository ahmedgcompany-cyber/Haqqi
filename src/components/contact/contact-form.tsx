"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { submitContact } from "@/lib/data/contact";

export function ContactForm({ locale }: { locale: Locale }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.name || !form.email || !form.message) {
      setError(copy(locale, "Name, email, and message are required.", "الاسم والبريد والرسالة مطلوبة."));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    try {
      await submitContact(supabase, {
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        phone: form.phone || undefined,
        message: form.message,
      });
      setSent(true);
    } catch {
      setError(copy(locale, "Failed to send message. Try again.", "فشل إرسال الرسالة. حاول مرة أخرى."));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="glass-panel surface-border w-full max-w-lg">
        <CardHeader>
          <CardTitle>{copy(locale, "Message sent", "تم إرسال الرسالة")}</CardTitle>
          <CardDescription>
            {copy(
              locale,
              "We received your inquiry and will reply within 24 hours.",
              "تلقينا استفسارك وسنرد خلال 24 ساعة.",
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-panel surface-border w-full max-w-lg">
      <CardHeader>
        <CardTitle>{copy(locale, "Contact us", "تواصل معنا")}</CardTitle>
        <CardDescription>
          {copy(
            locale,
            "Tell us about your company and payroll needs. We will get back to you with a custom plan.",
            "اخبرنا عن شركتك واحتياجات الرواتب. سنعود إليك بخطة مخصصة.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit} className="grid gap-3">
          <Field label={copy(locale, "Full name", "الاسم الكامل")}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={copy(locale, "Your name", "اسمك")}
            />
          </Field>
          <Field label={copy(locale, "Email", "البريد الإلكتروني")}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={copy(locale, "you@company.com", "name@company.com")}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={copy(locale, "Company", "الشركة")}>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder={copy(locale, "Acme Corp", "شركتك")}
              />
            </Field>
            <Field label={copy(locale, "Phone", "الهاتف")}>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={copy(locale, "+971 50 123 4567", "+971 50 123 4567")}
              />
            </Field>
          </div>
          <Field label={copy(locale, "Message", "الرسالة")}>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={copy(locale, "How can we help?", "كيف يمكننا المساعدة؟")}
              rows={5}
            />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading
              ? copy(locale, "Sending...", "جاري الإرسال...")
              : copy(locale, "Send message", "إرسال الرسالة")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
