import { readSettingArray } from "../dashboard/_store";
import { normalizeCpfDigits, verifyPortalSessionToken } from "@/lib/patient-portal";

export type StoredDashboardPatient = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  telefone: string;
  endereco: string;
  sexo: string;
  idade: string;
  dataNascimento: string;
  numeroSus: string;
  cpf: string;
  convenio: string;
  plano: string;
  observacoes: string;
  createdAt: string;
  portalEnabled?: boolean;
  portalPasswordHash?: string;
  normalizedCpf?: string;
};

export type DashboardAppointmentRecord = {
  id: string;
  paciente: string;
  data: string;
  hora: string;
  tipo: string;
  canal: string;
  status: string;
  observacoes: string;
  createdAt: string;
  patientId?: string;
  patientCpf?: string;
};

export type DashboardFinanceRecord = {
  id: string;
  paciente: string;
  plano: string;
  valor: number;
  data: string;
  status: "Pago" | "Pendente" | "Parcial";
  formaPagamento: string;
  referencia: string;
  observacoes: string;
  createdAt: string;
  patientId?: string;
  patientCpf?: string;
};

export type PortalAnnouncement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  audience?: "all" | "portal";
};

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export async function readPatients() {
  return readSettingArray<StoredDashboardPatient>("dashboard_patients");
}

export async function getPortalPatientFromRequest(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim() ?? "";

  if (!token) {
    throw new Error("Sessão inválida. Faça login novamente.");
  }

  const payload = verifyPortalSessionToken(token);

  if (!payload) {
    throw new Error("Sessão expirada. Entre novamente no portal.");
  }

  const patients = await readPatients();
  const patient = patients.find(
    (item) =>
      item.id === payload.patientId &&
      normalizeCpfDigits(item.normalizedCpf || item.cpf) === payload.cpf,
  );

  if (!patient) {
    throw new Error("Paciente não encontrado para esta sessão.");
  }

  return patient;
}

export function matchesPatientByRecord(
  patient: StoredDashboardPatient,
  record: { paciente?: string; patientId?: string; patientCpf?: string },
) {
  const patientCpf = normalizeCpfDigits(patient.normalizedCpf || patient.cpf);

  if (record.patientId && record.patientId === patient.id) {
    return true;
  }

  if (record.patientCpf && normalizeCpfDigits(record.patientCpf) === patientCpf) {
    return true;
  }

  if (record.paciente && normalizeName(record.paciente) === normalizeName(patient.nome)) {
    return true;
  }

  return false;
}
