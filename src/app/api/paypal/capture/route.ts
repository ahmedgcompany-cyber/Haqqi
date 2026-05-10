import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? "";

async function getPayPalAccessToken(): Promise<string> {
  const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const json = await res.json();
  return json.access_token;
}

export async function POST(request: Request) {
  try {
    const { subscriptionId, planId } = await request.json();

    if (!subscriptionId || !planId || !PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return NextResponse.json({ error: "Missing PayPal config or subscription ID" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getPayPalAccessToken();
    const res = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const subscription = await res.json();

    if (subscription.status === "ACTIVE" || subscription.status === "APPROVED") {
      await supabase.from("profiles").update({
        subscriptionTier: planId,
        subscriptionStatus: "active",
        subscriptionProvider: "paypal",
        updatedAt: new Date().toISOString(),
      }).eq("id", user.id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Subscription not active" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
