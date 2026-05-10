"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { OAuthButtons } from "./oauth-buttons";

export function SignupForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirm) {
      setError(copy(locale, "Passwords do not match", "كلمتا المرور غير متطابقتين"));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
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
            {copy(locale, "We sent you a confirmation link. Click it to activate your account.", "أرسلنا لك رابط التأكيد. انقر عليه لتفعيل حسابك.")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-panel surface-border w-full max-w-md">
      <CardHeader>
        <CardTitle>{copy(locale, "Create an account", "إنشاء حساب")}</CardTitle>
        <CardDescription>
          {copy(locale, "Get started with Haqqi", "ابدأ مع حقي")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <OAuthButtons locale={locale} />

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-border" />
          <span className="relative bg-card px-2 text-xs text-muted">
            {copy(locale, "or use email", "أو استخدم البريد")}
          </span>
        </div>

        <form onSubmit={handleSignup} className="grid gap-3">
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
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">{copy(locale, "Password", "كلمة المرور")}</span>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={copy(locale, "Min 6 characters", "6 أحرف على الأقل")}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">{copy(locale, "Confirm password", "تأكيد كلمة المرور")}</span>
            <Input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading
              ? copy(locale, "Creating account...", "جاري إنشاء الحساب...")
              : copy(locale, "Create account", "إنشاء حساب")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          {copy(locale, "Already have an account?", "لديك حساب بالفعل؟")}{" "}
          <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
            {copy(locale, "Sign in", "تسجيل الدخول")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
