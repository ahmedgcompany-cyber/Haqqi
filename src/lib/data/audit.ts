import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditEvent } from "@/lib/types";

export async function getAuditTrail(supabase: SupabaseClient, userId: string): Promise<AuditEvent[]> {
  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as AuditEvent[];
}

export async function logAudit(
  supabase: SupabaseClient,
  userId: string,
  actor: string,
  action: string,
  entity: string,
): Promise<void> {
  const { error } = await supabase.from("audit_events").insert({
    userId,
    actor,
    action,
    entity,
  });

  if (error) throw error;
}
