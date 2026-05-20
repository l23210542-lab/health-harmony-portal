
PRD: Care Sync - Sistema Médico Interactivo
1. Product Overview
Care Sync es un sistema médico de doble interfaz diseñado para conectar a doctores y pacientes. El sistema digitaliza la creación de recetas médicas, facilita la programación de citas y mejora la adherencia al tratamiento del paciente mediante un sistema automatizado de alertas e información detallada sobre sus medicamentos.
2. Problem Statement
Puntos de dolor de los usuarios:
Los pacientes olvidan los horarios de sus tomas de medicamentos o pierden sus citas médicas.
Las recetas en papel se pierden o la letra del doctor es ilegible, causando confusión en las dosis.
Los pacientes a menudo no entienden para qué sirve cada medicamento o sus efectos secundarios.
Impacto: Si no se resuelve, esto resulta en una mala adherencia al tratamiento, empeoramiento de la salud del paciente y cuellos de botella administrativos para los doctores.
3. Product Goals & Objectives
Para el paciente: Mejorar la adherencia al tratamiento en un 90% mediante alertas precisas y acceso inmediato a sus recetas.
Para el Doctor: Reducir el tiempo de creación de recetas y gestión de citas.
Objetivo del Prototipo: Entregar un MVP funcional que demuestre el flujo completo: agendar cita $\rightarrow$ crear receta $\rightarrow$ notificar al paciente $\rightarrow$ alertas de toma de medicina.
4. Target Users / Personas
Primary User 1 - El Paciente: Necesita interfaces muy sencillas, legibles y notificaciones push/SMS infalibles. Nivel técnico: Bajo-Medio.
Primary User 2 - El Doctor: Necesita eficiencia, creación rápida de recetas y vista clara de su agenda. Nivel técnico: Medio.

5. Core Features / Functional Requirements
Esta sección detalla las funciones exactas para que Cursor genere la lógica y Lovable las pantallas.
5.1 Portal del Doctor
Gestión de Citas: Calendario interactivo para ver, aceptar o reprogramar citas.
Creador de Recetas (Prescription Builder):
Buscador de medicamentos con autocompletado.
Campos obligatorios: Dosis, Frecuencia (ej. cada 8 horas), Duración (ej. 5 días).
Campo de "Explicación/Propósito" (ej. "Para la infección de garganta").
Instrucciones especiales (ej. "Tomar con alimentos").
5.2 Portal del Paciente
Dashboard de Adherencia: Vista principal con el próximo medicamento a tomar.
Gestión de Citas: Seleccionar doctor, ver disponibilidad y agendar cita.
Bóveda de Recetas: Historial de recetas activas y pasadas. Al hacer clic en una medicina, se despliega la explicación detallada y propósito.
Motor de Alertas (Core Feature):
Alertas push/in-app generadas automáticamente basadas en la frecuencia recetada por el doctor (ej. alertas a las 8:00 AM, 4:00 PM, 12:00 AM).
Alertas de recordatorio de cita (24 horas y 1 hora antes).
6. Information Architecture & UX/UI Guidelines
Directrices específicas para Lovable.
Look & Feel / UI:
Estilo: Limpio, moderno, confiable (Trustworthy), accesible.
Paleta de Colores: * Primario: Azul Médico (#0052FF) para acciones principales.
Secundario: Verde Menta (#10B981) para confirmaciones y estados saludables.
Fondo: Blanco (#FFFFFF) y Gris muy suave (#F8FAFC) para legibilidad.
Accesibilidad: Fuentes grandes (mínimo 16px para cuerpo), alto contraste, botones grandes y fáciles de tocar en móvil.
Navegación (Sidebar / Bottom Tab):
Doctor: Dashboard | Calendario | Pacientes | Crear Receta
Paciente: Hoy (Alertas) | Mis Recetas | Citas | Perfil

7. System & Integration Requirements
Directrices específicas para Cursor.
Frontend: React (Next.js) o React Native / Expo (si es app móvil). Componentes de UI limpios (Tailwind CSS o shadcn/ui).
Backend / BaaS: Supabase o Firebase para autenticación rápida, base de datos en tiempo real y almacenamiento.
Notificaciones: Integración con API del navegador (Web Push) o un servicio como OneSignal/Resend para correos transaccionales.
Automatización (Cron Jobs): El sistema debe evaluar constantemente qué medicamentos tocan en la hora actual para disparar las alertas.
8. Data Model Overview
Esquema de base de datos para que Cursor genere los modelos ORM/SQL.

Users
id, role (doctor/patient), name, email, phone

Appointments
id, doctor_id, patient_id, date_time, status
Belongs to Doctor, Patient

Prescriptions
id, doctor_id, patient_id, created_at, notes
Has many Medications

Medications
id, prescription_id, name, purpose, instructions, frequency_hours, duration_days
Belongs to Prescription

Alerts/Logs
id, patient_id, medication_id, scheduled_time, status (pending/taken/missed)
Belongs to Patient, Medication

9. Detailed Application Flows (Endpoints & Routes)
Flujos técnicos paso a paso para el desarrollo.
Flujo 1: Doctor crea receta
El Doctor navega a /doctor/prescriptions/new.
Selecciona al paciente mediante un buscador.
Añade Medications al formulario dinámico (Nombre, Frecuencia, Dosis, Explicación).
Hace clic en "Enviar".
Backend (Cursor): * POST /api/prescriptions
Al guardar, el backend calcula automáticamente los horarios de las tomas y genera los registros en la tabla Alerts para los próximos $X$ días.
Flujo 2: Paciente recibe alerta y marca como tomada
El cron job del servidor verifica Alerts pendientes para la hora actual.
Paciente recibe notificación Push en su dispositivo.
El paciente abre la app en la ruta /patient/dashboard.
Ve un banner destacado: "Es hora de tomar [Nombre del Medicamento]".
Hace clic en "Marcar como tomado".
Backend (Cursor):
PATCH /api/alerts/:id (Actualiza status a 'taken').

