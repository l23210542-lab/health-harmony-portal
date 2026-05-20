import { getSupabase } from "@/server/supabase";

export type PatientPublic = {
  id: string;
  name: string;
  email: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicPatient(row: { id: string; name: string; email: string }): PatientPublic {
  return { id: row.id, name: row.name, email: row.email };
}

export async function registerPatientInDb(input: {
  name: string;
  email: string;
  password: string;
}): Promise<PatientPublic> {
  const supabase = getSupabase();
  const email = normalizeEmail(input.email);

  const { data, error } = await supabase
    .from("patients")
    .insert({
      name: input.name.trim(),
      email,
      password: input.password,
    })
    .select("id, name, email")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("email_already_exists");
    throw new Error(error.message || "register_failed");
  }

  return toPublicPatient(data);
}

export async function loginPatientFromDb(email: string, password: string): Promise<PatientPublic> {
  const supabase = getSupabase();
  const normalized = normalizeEmail(email);

  const { data, error } = await supabase
    .from("patients")
    .select("id, name, email, password")
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw new Error(error.message || "login_failed");
  if (!data || data.password !== password) throw new Error("invalid_credentials");

  return toPublicPatient(data);
}

export async function getPatientById(id: string): Promise<PatientPublic | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("patients")
    .select("id, name, email")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message || "fetch_failed");
  return data ? toPublicPatient(data) : null;
}

export async function searchPatients(query?: string): Promise<PatientPublic[]> {
  const supabase = getSupabase();
  const normalized = query?.trim().toLowerCase() ?? "";

  const { data, error } = await supabase.from("patients").select("id, name, email").order("name");

  if (error) throw new Error(error.message || "search_failed");

  const patients = (data ?? []).map(toPublicPatient);

  if (!normalized) return patients;

  return patients.filter(
    (p) => p.name.toLowerCase().includes(normalized) || p.email.toLowerCase().includes(normalized),
  );
}
