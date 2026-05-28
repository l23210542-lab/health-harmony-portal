export type UserRole = "doctor" | "patient";

export type MockSession = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
};

const STORAGE_KEYS: Record<UserRole, string> = {
  doctor: "care-sync-doctor-session",
  patient: "care-sync-patient-session",
};

function readSession(role: UserRole): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[role]);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockSession;
    return parsed.role === role ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session: MockSession): void {
  localStorage.setItem(STORAGE_KEYS[session.role], JSON.stringify(session));
}

function clearSession(role: UserRole): void {
  localStorage.removeItem(STORAGE_KEYS[role]);
}

export function getDoctorSession(): MockSession | null {
  return readSession("doctor");
}

export function getPatientSession(): MockSession | null {
  return readSession("patient");
}

export function isDoctorLoggedIn(): boolean {
  return getDoctorSession() !== null;
}

export function isPatientLoggedIn(): boolean {
  return getPatientSession() !== null;
}

function doctorFromApi(data: {
  id: string;
  name: string;
  email: string;
  specialty: string;
}): MockSession {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: "doctor",
    specialty: data.specialty,
  };
}

function patientFromApi(data: { id: string; name: string; email: string }): MockSession {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: "patient",
  };
}

async function parseAuthError(response: Response, payload: { error?: string }): Promise<never> {
  if (payload.error === "invalid_credentials") {
    throw new Error("Correo o contraseña incorrectos.");
  }
  if (payload.error === "email_already_exists") {
    throw new Error("Ya existe una cuenta con ese correo. Inicia sesión.");
  }
  if (payload.error === "supabase_not_configured") {
    throw new Error("Supabase no está configurado. Revisa las variables de entorno.");
  }
  throw new Error(response.status === 401 ? "Correo o contraseña incorrectos." : "Ocurrió un error. Intenta de nuevo.");
}

export async function loginDoctor(input: { email: string; password: string }): Promise<MockSession> {
  const response = await fetch("/api/auth/doctor/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: input.email.trim(), password: input.password }),
  });

  const payload = (await response.json()) as { data?: { id: string; name: string; email: string; specialty: string }; error?: string };

  if (!response.ok) await parseAuthError(response, payload);

  if (!payload.data) throw new Error("Respuesta inválida del servidor.");

  const session = doctorFromApi(payload.data);
  writeSession(session);
  return session;
}

export async function registerDoctor(input: {
  name: string;
  email: string;
  password: string;
  specialty?: string;
}): Promise<MockSession> {
  const response = await fetch("/api/auth/doctor/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      specialty: input.specialty?.trim(),
    }),
  });

  const payload = (await response.json()) as { data?: { id: string; name: string; email: string; specialty: string }; error?: string };

  if (!response.ok) await parseAuthError(response, payload);

  if (!payload.data) throw new Error("Respuesta inválida del servidor.");

  const session = doctorFromApi(payload.data);
  writeSession(session);
  return session;
}

export function logoutDoctor(): void {
  clearSession("doctor");
}

export async function loginPatient(input: { email: string; password: string }): Promise<MockSession> {
  const response = await fetch("/api/auth/patient/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: input.email.trim(), password: input.password }),
  });

  const payload = (await response.json()) as { data?: { id: string; name: string; email: string }; error?: string };

  if (!response.ok) await parseAuthError(response, payload);

  if (!payload.data) throw new Error("Respuesta inválida del servidor.");

  const session = patientFromApi(payload.data);
  writeSession(session);
  return session;
}

export async function registerPatient(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
}): Promise<MockSession> {
  const response = await fetch("/api/auth/patient/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      phone: input.phone?.trim(),
      birthDate: input.birthDate,
    }),
  });

  const payload = (await response.json()) as { data?: { id: string; name: string; email: string }; error?: string };

  if (!response.ok) await parseAuthError(response, payload);

  if (!payload.data) throw new Error("Respuesta inválida del servidor.");

  const session = patientFromApi(payload.data);
  writeSession(session);
  return session;
}

export function logoutPatient(): void {
  clearSession("patient");
}

export function isDoctorAuthPath(pathname: string): boolean {
  return pathname === "/doctor/login" || pathname === "/doctor/register";
}

export function isPatientAuthPath(pathname: string): boolean {
  return pathname === "/patient/login" || pathname === "/patient/register";
}
