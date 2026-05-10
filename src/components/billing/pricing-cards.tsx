"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { PayPalCheckout } from "./paypal-checkout";

type Plan = {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  limits: Record<string, number>;
};

const planFeatures: Record<string, string[]> = {
  free: ["5 gratuity calculations / month", "1 company", "10 employees", "2 WPS exports / month", "2 settlement PDFs / month"],
  growth: ["100 gratuity calculations / month", "5 companies", "100 employees", "Unlimited WPS exports", "Unlimited settlement PDFs"],
  scale: ["Unlimited gratuity calculations", "Unlimited companies", "Unlimited employees", "Unlimited WPS exports", "Unlimited settlement PDFs"],
};

export function PricingCards({ locale }: { locale: Locale }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tier, setTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      try {
        const { data: plansData } = await supabase.from("subscription_plans").select("*");
        setPlans((plansData ?? []) as Plan[]);

        const uid = data.session?.user.id;
        if (uid) {
          const { data: profile } = await supabase.from("profiles").select("subscriptionTier").eq("id", uid).single();
          setTier(profile?.subscriptionTier ?? "free");
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function stripeCheckout(planId: string) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  async function lemonCheckout(planId: string) {
    const res = await fetch("/api/lemonsqueezy/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted">{copy(locale, "Loading...", "جاري التحميل...")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {plans.map((plan) => {
        const active = tier === plan.id;
        const features = planFeatures[plan.id] ?? [];
        return (
          <Card
            key={plan.id}
            className={`relative ${active ? "border-primary/40 ring-1 ring-primary/20" : ""}`}
          >
            {active && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                {copy(locale, "Current plan", "الخطة الحالية")}
              </Badge>
            )}
            <CardHeader>
              <div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.priceMonthly > 0
                    ? `$${(plan.priceMonthly / 100).toFixed(0)}${copy(locale, "/mo", "/شهر")}`
                    : copy(locale, "Free", "مجاني")}
                </CardDescription>
              </div>
            </CardHeader>
            <ul className="space-y-3 px-6 pb-4 text-sm text-muted">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="grid gap-2 px-6 pb-6">
              {!active && plan.priceMonthly > 0 && (
                <>
                  <Button variant="primary" onClick={() => stripeCheckout(plan.id)}>
                    {copy(locale, "Pay with Stripe", "الدفع عبر Stripe")}
                  </Button>
                  <Button variant="secondary" onClick={() => lemonCheckout(plan.id)}>
                    {copy(locale, "Pay with Lemon Squeezy", "الدفع عبر Lemon Squeezy")}
                  </Button>
                  <PayPalCheckout locale={locale} planId={plan.id} />
                </>
              )}
              {active && (
                <Button disabled variant="secondary">
                  {copy(locale, "Active", "نشط")}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
