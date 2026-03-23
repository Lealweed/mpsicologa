// Tipos gerados para Supabase
export type user_role = 'admin' | 'psychologist' | 'assistant' | 'patient';
export type appointment_status = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type appointment_origin = 'manual' | 'online' | 'whatsapp';
export type appointment_channel = 'video' | 'audio' | 'chat';
export type notification_status = 'queued' | 'sent' | 'delivered' | 'failed';
export type report_status = 'draft' | 'signed' | 'issued' | 'archived';
export type subscription_status = 'active' | 'inactive' | 'cancelled' | 'expired';

export interface Profiles {
  id: string;
  user_id: string;
  role: user_role;
  full_name: string;
  created_at: string;
  updated_at: string;
}
export interface Psychologists {
  id: string;
  profile_id: string;
  crp: string;
  specialty?: string;
  created_at: string;
  updated_at: string;
}
export interface Patients {
  id: string;
  profile_id: string;
  birth_date?: string;
  gender?: string;
  created_at: string;
  updated_at: string;
}
export interface PatientContacts {
  id: string;
  patient_id: string;
  contact_type: string;
  contact_value: string;
  created_at: string;
  updated_at: string;
}
export interface TherapyPlans {
  id: string;
  name: string;
  included_sessions: number;
  validity_days: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
export interface PlanPrices {
  id: string;
  plan_id: string;
  price_cents: number;
  currency: string;
  stripe_price_id?: string;
  created_at: string;
  updated_at: string;
}
export interface Subscriptions {
  id: string;
  patient_id: string;
  plan_id: string;
  status: subscription_status;
  total_sessions: number;
  sessions_remaining: number;
  stripe_subscription_id?: string;
  started_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
export interface Appointments {
  id: string;
  psychologist_id: string;
  patient_id: string;
  scheduled_for: string;
  status: appointment_status;
  origin: appointment_origin;
  channel: appointment_channel;
  created_at: string;
  updated_at: string;
}
export interface SessionNotes {
  id: string;
  appointment_id: string;
  note: string;
  created_at: string;
  updated_at: string;
}
export interface SessionAttendance {
  id: string;
  appointment_id: string;
  attended: boolean;
  cancel_reason?: string;
  created_at: string;
  updated_at: string;
}
export interface AvailabilitySlots {
  id: string;
  psychologist_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}
export interface BlockedDates {
  id: string;
  psychologist_id: string;
  blocked_date: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}
export interface BariatricIntakeForms {
  id: string;
  patient_id: string;
  data: unknown;
  created_at: string;
  updated_at: string;
}
export interface BariatricEvaluations {
  id: string;
  intake_form_id: string;
  psychologist_id: string;
  evaluation: unknown;
  created_at: string;
  updated_at: string;
}
export interface BariatricReports {
  id: string;
  evaluation_id: string;
  report_status: report_status;
  version: number;
  issued_at?: string;
  created_at: string;
  updated_at: string;
}
export interface ReportFiles {
  id: string;
  report_id: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}
export interface Payments {
  id: string;
  patient_id: string;
  amount_cents: number;
  currency: string;
  payment_date: string;
  stripe_payment_id?: string;
  created_at: string;
  updated_at: string;
}
export interface Invoices {
  id: string;
  payment_id: string;
  invoice_number: string;
  issued_at: string;
  created_at: string;
  updated_at: string;
}
export interface Refunds {
  id: string;
  payment_id: string;
  amount_cents: number;
  reason?: string;
  created_at: string;
  updated_at: string;
}
export interface StripeCustomers {
  id: string;
  patient_id: string;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
}
export interface StripeEventsLog {
  id: string;
  event_id: string;
  event_type: string;
  payload: unknown;
  created_at: string;
}
export interface WhatsappTemplates {
  id: string;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
}
export interface NotificationJobs {
  id: string;
  template_id: string;
  recipient_number: string;
  status: notification_status;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}
export interface NotificationLogs {
  id: string;
  job_id: string;
  status: notification_status;
  sent_at?: string;
  delivered_at?: string;
  failed_reason?: string;
  created_at: string;
  updated_at: string;
}
export interface MessageThreads {
  id: string;
  patient_id: string;
  started_at: string;
  created_at: string;
  updated_at: string;
}
export interface MessageEvents {
  id: string;
  thread_id: string;
  event_type: string;
  payload?: unknown;
  created_at: string;
}
export interface AuditLogs {
  id: string;
  user_id?: string;
  action: string;
  entity?: string;
  entity_id?: string;
  details?: unknown;
  created_at: string;
}
export interface SystemSettings {
  id: string;
  key: string;
  value: unknown;
  created_at: string;
  updated_at: string;
}
export interface WebhookLogs {
  id: string;
  event: string;
  payload: unknown;
  received_at: string;
}
export interface ApiKeysInternal {
  id: string;
  hash: string;
  scope: string;
  created_at: string;
  updated_at: string;
}
