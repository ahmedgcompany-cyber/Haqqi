import type { SupabaseClient } from "@supabase/supabase-js";

export type ContactSubmission = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
};

export async function submitContact(
  supabase: SupabaseClient,
  payload: ContactSubmission,
): Promise<void> {
  const { error } = await supabase.from("contact_submissions").insert(payload);
  if (error) throw error;
}
