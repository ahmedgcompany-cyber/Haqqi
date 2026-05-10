"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { OAuthButtons } from "./oauth-buttons";

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
    router.refresh();
  };

  return (
    <Card className="glass-panel surface-border w-full max-w-md">
      <CardHeader>
        <CardTitle>{copy(locale, "Sign in", "تسجيل الدخول")}</CardTitle>
        <CardDescription>
          {copy(locale, "Welcome back to Haqqi", "مرحبًا بك في حقي")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <OAuthButtons locale={locale} />

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-border" />
          <span className="relative bg-card px-2 text-xs text-muted">
            {copy(locale, "or continue with email", "أو تابع بالبريد الإلكتروني")}
          </span>
        </div>

        <form onSubmit={handleLogin} className="grid gap-3">
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
              placeholder={copy(locale, "••••••••", "••••••••")}
            />
          </label>
          <div className="flex items-center justify-between">
            <Link href={`/${locale}/auth/reset-password`} className="text-xs text-primary hover:underline">
              {copy(locale, "Forgot password?", "نسيت كلمة المرور؟")}
            </Link>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading
              ? copy(locale, "Signing in...", "جاري تسجيل الدخول...")
              : copy(locale, "Sign in", "تسجيل الدخول")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          {copy(locale, "Don't have an account?", "ليس لديك حساب؟")}{" "}
          <Link href={`/${locale}/auth/signup`} className="text-primary hover:underline">
            {copy(locale, "Sign up", "إنشاء حساب")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
