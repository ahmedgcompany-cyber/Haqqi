"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?locale=${locale}`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <Card className="glass-panel surface-border w-full max-w-md">
        <CardHeader>
          <CardTitle>{copy(locale, "Check your email", "تحقق من بريدك الإلكتروني")}</CardTitle>
          <CardDescription>
            {copy(locale, "We sent you a password reset link.", "أرسلنا لك رابط إعادة تعيين كلمة المرور.")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-panel surface-border w-full max-w-md">
      <CardHeader>
        <CardTitle>{copy(locale, "Reset password", "إعادة تعيين كلمة المرور")}</CardTitle>
        <CardDescription>
          {copy(locale, "Enter your email to receive a reset link.", "أدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleReset} className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">{copy(locale, "Email", "البريد الإلكتروني")}</span>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy(locale, "you@company.com", "name@company.com")}
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading
              ? copy(locale, "Sending...", "جاري الإرسال...")
              : copy(locale, "Send reset link", "إرسال رابط إعادة التعيين")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          {copy(locale, "Remember your password?", "تتذكر كلمة المرور؟")}{" "}
          <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
            {copy(locale, "Sign in", "تسجيل الدخول")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
