import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type UserRole = "doctor" | "patient";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled";
export type AlertStatus = "pending" | "taken" | "missed";

export type User = {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
};

export type Appointment = {
  id: string;
  doctor_id: string;
  patient_id: string;
  date_time: string;
  status: AppointmentStatus;
};

export type Prescription = {
  id: string;
  doctor_id: string;
  patient_id: string;
  created_at: string;
  notes: string;
};

export type Medication = {
  id: string;
  prescription_id: string;
  name: string;
  dose: string;
  purpose: string;
  instructions: string;
  frequency_hours: number;
  duration_days: number;
};

export type AlertLog = {
  id: string;
  patient_id: string;
  medication_id: string;
  scheduled_time: string;
  status: AlertStatus;
};

export type DatabaseSchema = {
  users: User[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  medications: Medication[];
  alerts: AlertLog[];
};

export const DB_FILE_PATH = resolve(process.cwd(), "data", "db.json");

const initialData: DatabaseSchema = {
  users: [
    {
      id: "doc-1",
      role: "doctor",
      name: "Dra. Andrea Morales",
      email: "andrea.morales@caresync.test",
      phone: "+52 55 1000 2000",
    },
    {
      id: "pat-1",
      role: "patient",
      name: "Carlos Méndez",
      email: "carlos.mendez@caresync.test",
      phone: "+52 55 3000 4001",
    },
    {
      id: "pat-2",
      role: "patient",
      name: "Lucía Herrera",
      email: "lucia.herrera@caresync.test",
      phone: "+52 55 3000 4002",
    },
  ],
  appointments: [],
  prescriptions: [],
  medications: [],
  alerts: [],
};

let writeQueue = Promise.resolve();

async function ensureDatabaseFile() {
  try {
    await readFile(DB_FILE_PATH, "utf8");
  } catch {
    await mkdir(dirname(DB_FILE_PATH), { recursive: true });
    await writeFile(DB_FILE_PATH, JSON.stringify(initialData, null, 2), "utf8");
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  await ensureDatabaseFile();
  const raw = await readFile(DB_FILE_PATH, "utf8");
  return JSON.parse(raw) as DatabaseSchema;
}

export async function writeDb(nextDb: DatabaseSchema): Promise<void> {
  await ensureDatabaseFile();
  writeQueue = writeQueue.then(() => writeFile(DB_FILE_PATH, JSON.stringify(nextDb, null, 2), "utf8"));
  await writeQueue;
}

export async function mutateDb<T>(mutator: (db: DatabaseSchema) => T): Promise<T> {
  const db = await readDb();
  const result = mutator(db);
  await writeDb(db);
  return result;
}
