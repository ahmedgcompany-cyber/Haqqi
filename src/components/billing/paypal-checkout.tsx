"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { copy } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

const PAYPAL_PLAN_MAP: Record<string, string> = {
  growth: process.env.NEXT_PUBLIC_PAYPAL_PLAN_GROWTH ?? "",
  scale: process.env.NEXT_PUBLIC_PAYPAL_PLAN_SCALE ?? "",
};

export function PayPalCheckout({ locale, planId }: { locale: Locale; planId: string }) {
  const paypalPlanId = PAYPAL_PLAN_MAP[planId];
  if (!PAYPAL_CLIENT_ID || !paypalPlanId) return null;

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        vault: true,
        intent: "subscription",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "blue", label: "subscribe" }}
        createSubscription={(_data, actions) => {
          return actions.subscription.create({
            plan_id: paypalPlanId,
          });
        }}
        onApprove={async (data) => {
          const res = await fetch("/api/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: data.subscriptionID, planId }),
          });
          const result = await res.json();
          if (result.success) {
            window.location.href = "/dashboard?success=true";
          } else {
            alert(copy(locale, "Payment verification failed", "فشل التحقق من الدفع"));
          }
        }}
      />
    </PayPalScriptProvider>
  );
}
