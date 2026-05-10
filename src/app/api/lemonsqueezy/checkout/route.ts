import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LS_API_KEY = process.env.LEMON_SQUEEZY_API_KEY ?? "";
const LS_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID ?? "";

const VARIANT_MAP: Record<string, string> = {
  growth: process.env.LEMON_VARIANT_GROWTH ?? "",
  scale: process.env.LEMON_VARIANT_SCALE ?? "",
};

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();
    const variantId = VARIANT_MAP[planId];

    if (!variantId || !LS_API_KEY || !LS_STORE_ID) {
      return NextResponse.json({ error: "Invalid plan or missing Lemon Squeezy config" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LS_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: user.email ?? undefined,
              custom: { supabaseUserId: user.id, planId },
            },
            product_options: {
              redirect_url: `${origin}/dashboard?success=true`,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: LS_STORE_ID } },
            variant: { data: { type: "variants", id: variantId } },
          },
        },
      }),
    });

    const json = await res.json();
    const url = json.data?.attributes?.url;

    if (!url) {
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
