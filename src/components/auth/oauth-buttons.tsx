"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const providers = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "azure", label: "Microsoft" },
  { id: "apple", label: "Apple" },
] as const;

export function OAuthButtons({ locale }: { locale: Locale }) {
  const handleOAuth = async (provider: (typeof providers)[number]["id"]) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      console.error("OAuth error:", error.message);
    }
  };

  return (
    <div className="grid gap-2">
      {providers.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="secondary"
          onClick={() => handleOAuth(p.id)}
        >
          {copy(locale, `Continue with ${p.label}`, `تابع باستخدام ${p.label}`)}
        </Button>
      ))}
    </div>
  );
}
