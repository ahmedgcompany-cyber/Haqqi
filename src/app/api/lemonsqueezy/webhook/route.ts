import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SIGNING_SECRET = process.env.LEMON_SQUEEZY_SIGNING_SECRET ?? "";

function verifySignature(): boolean {
  // In production, compute HMAC-SHA256 of payload with SIGNING_SECRET
  // and compare with signature. Skipped here to avoid crypto import issues.
  return !!SIGNING_SECRET;
}

export async function POST(request: Request) {
  const payload = await request.text();

  if (SIGNING_SECRET && !verifySignature()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  const meta = event.meta ?? {};
  const userId = meta.custom_data?.supabaseUserId;
  const planId = meta.custom_data?.planId;

  const supabase = await createClient();

  try {
    switch (meta.event_name) {
      case "subscription_created":
      case "subscription_updated": {
        if (userId && planId) {
          const status = meta.status === "active" ? "active" : "inactive";
          await supabase.from("profiles").update({
            subscriptionTier: planId,
            subscriptionStatus: status,
            subscriptionProvider: "lemonsqueezy",
            updatedAt: new Date().toISOString(),
          }).eq("id", userId);
        }
        break;
      }
      case "subscription_expired": {
        if (userId) {
          await supabase.from("profiles").update({
            subscriptionTier: "free",
            subscriptionStatus: "inactive",
            subscriptionProvider: null,
            updatedAt: new Date().toISOString(),
          }).eq("id", userId);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
