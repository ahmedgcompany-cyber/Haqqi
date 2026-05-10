import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionTier } from "@/lib/types";

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubscription(
  supabase: SupabaseClient,
  userId: string,
  tier: SubscriptionTier,
  status: string,
  provider?: string,
  expiresAt?: string,
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscriptionTier: tier,
      subscriptionStatus: status,
      subscriptionProvider: provider ?? null,
      subscriptionExpiresAt: expiresAt ?? null,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function getPlans(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("priceMonthly", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
