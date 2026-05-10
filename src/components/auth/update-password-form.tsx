"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function UpdatePasswordForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirm) {
      setError(copy(locale, "Passwords do not match", "كلمتا المرور غير متطابقتين"));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/dashboard`);
  };

  return (
    <Card className="glass-panel surface-border w-full max-w-md">
      <CardHeader>
        <CardTitle>{copy(locale, "Update password", "تحديث كلمة المرور")}</CardTitle>
        <CardDescription>
          {copy(locale, "Enter your new password below.", "أدخل كلمة المرور الجديدة أدناه.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleUpdate} className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">{copy(locale, "New password", "كلمة المرور الجديدة")}</span>
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
              ? copy(locale, "Updating...", "جاري التحديث...")
              : copy(locale, "Update password", "تحديث كلمة المرور")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
