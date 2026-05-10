import type { SupabaseClient } from "@supabase/supabase-js";

export type FeatureKey =
  | "gratuity_calc"
  | "wps_export"
  | "settlement_pdf"
  | "employee_add"
  | "company_add";

const FREE_LIMITS: Record<FeatureKey, number> = {
  gratuity_calc: 5,
  wps_export: 2,
  settlement_pdf: 2,
  employee_add: 10,
  company_add: 1,
};

export async function checkUsageLimit(
  supabase: SupabaseClient,
  userId: string,
  feature: FeatureKey,
  tier: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  if (tier === "scale") {
    return { allowed: true, current: 0, limit: Infinity };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("usage_logs")
    .select("quantity")
    .eq("userId", userId)
    .eq("feature", feature)
    .gte("createdAt", startOfMonth.toISOString());

  if (error) throw error;

  const current = (data ?? []).reduce((sum, row) => sum + (row.quantity ?? 1), 0);

  if (tier === "growth") {
    const growthLimits: Record<FeatureKey, number> = {
      gratuity_calc: 100,
      wps_export: 9999,
      settlement_pdf: 9999,
      employee_add: 100,
      company_add: 5,
    };
    const limit = growthLimits[feature];
    return { allowed: current < limit, current, limit };
  }

  const limit = FREE_LIMITS[feature];
  return { allowed: current < limit, current, limit };
}

export async function logUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: FeatureKey,
  quantity = 1,
): Promise<void> {
  const { error } = await supabase.from("usage_logs").insert({
    userId,
    feature,
    quantity,
  });

  if (error) throw error;
}

export async function getUsageStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<Record<FeatureKey, number>> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("usage_logs")
    .select("feature,quantity")
    .eq("userId", userId)
    .gte("createdAt", startOfMonth.toISOString());

  if (error) throw error;

  const stats: Record<FeatureKey, number> = {
    gratuity_calc: 0,
    wps_export: 0,
    settlement_pdf: 0,
    employee_add: 0,
    company_add: 0,
  };

  for (const row of data ?? []) {
    const key = row.feature as FeatureKey;
    if (key in stats) {
      stats[key] += row.quantity ?? 1;
    }
  }

  return stats;
}
