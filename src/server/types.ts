export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled";
export type AlertStatus = "pending" | "taken" | "missed";
export type AppointmentMode = "in_person" | "video";

export type Prescription = {
  id: string;
  doctor_id: string;
  patient_id: string;
  created_at: string;
  notes: string | null;
};

export type Medication = {
  id: string;
  prescription_id: string;
  name: string;
  dose: string;
  purpose: string;
  instructions: string | null;
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

export type Appointment = {
  id: string;
  doctor_id: string;
  patient_id: string;
  date_time: string;
  status: AppointmentStatus;
  visit_mode: AppointmentMode;
  place: string;
  reason: string;
};
