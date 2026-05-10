import type { SupabaseClient } from "@supabase/supabase-js";
import type { Employee } from "@/lib/types";

export async function getEmployees(supabase: SupabaseClient, userId: string): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Employee[];
}

export async function getEmployeesByCompany(
  supabase: SupabaseClient,
  userId: string,
  companyId: string,
): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("userId", userId)
    .eq("companyId", companyId)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Employee[];
}

export async function createEmployee(
  supabase: SupabaseClient,
  userId: string,
  payload: Omit<Employee, "id" | "userId">,
): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .insert({ ...payload, userId })
    .select()
    .single();

  if (error) throw error;
  return data as Employee;
}

export async function updateEmployee(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  payload: Partial<Omit<Employee, "id" | "userId">>,
): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .update(payload)
    .eq("id", id)
    .eq("userId", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Employee;
}

export async function deleteEmployee(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id)
    .eq("userId", userId);

  if (error) throw error;
}
