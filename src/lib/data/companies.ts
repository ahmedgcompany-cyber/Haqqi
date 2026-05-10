import type { SupabaseClient } from "@supabase/supabase-js";
import type { Company } from "@/lib/types";

export async function getCompanies(supabase: SupabaseClient, userId: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Company[];
}

export async function createCompany(
  supabase: SupabaseClient,
  userId: string,
  payload: Omit<Company, "id" | "userId">,
): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .insert({ ...payload, userId })
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

export async function updateCompany(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  payload: Partial<Omit<Company, "id" | "userId">>,
): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", id)
    .eq("userId", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

export async function deleteCompany(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id)
    .eq("userId", userId);

  if (error) throw error;
}
