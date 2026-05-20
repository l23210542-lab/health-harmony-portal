import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DoctorRow = {
  id: string;
  name: string;
  email: string;
  specialty: string | null;
  password: string;
  created_at: string;
};

export type DoctorPublic = {
  id: string;
  name: string;
  email: string;
  specialty: string;
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("supabase_not_configured");
  }

  client = createClient(url, key);
  return client;
}
