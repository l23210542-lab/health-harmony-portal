import { getSupabase, type DoctorPublic } from "@/server/supabase";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicDoctor(row: {
  id: string;
  name: string;
  email: string;
  specialty: string | null;
}): DoctorPublic {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    specialty: row.specialty ?? "Medicina General",
  };
}

export async function registerDoctorInDb(input: {
  name: string;
  email: string;
  password: string;
  specialty?: string;
}): Promise<DoctorPublic> {
  const supabase = getSupabase();
  const email = normalizeEmail(input.email);

  const { data, error } = await supabase
    .from("doctors")
    .insert({
      name: input.name.trim(),
      email,
      specialty: input.specialty?.trim() || "Medicina General",
      password: input.password,
    })
    .select("id, name, email, specialty")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("email_already_exists");
    throw new Error(error.message || "register_failed");
  }

  return toPublicDoctor(data);
}

export async function loginDoctorFromDb(email: string, password: string): Promise<DoctorPublic> {
  const supabase = getSupabase();
  const normalized = normalizeEmail(email);

  const { data, error } = await supabase
    .from("doctors")
    .select("id, name, email, specialty, password")
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw new Error(error.message || "login_failed");
  if (!data || data.password !== password) throw new Error("invalid_credentials");

  return toPublicDoctor(data);
}

export async function getDoctorById(id: string): Promise<DoctorPublic | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("doctors")
    .select("id, name, email, specialty")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message || "fetch_failed");
  return data ? toPublicDoctor(data) : null;
}
