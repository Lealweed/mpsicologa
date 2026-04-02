import { NextResponse } from "next/server";
import {
  DashboardAuthError,
  ensureDashboardUser,
  readSettingArray,
  writeSettingArray,
} from "../_store";

type DashboardAppointment = {
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

const SETTINGS_KEY = "dashboard_appointments";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export async function GET(request: Request) {
  try {
    await ensureDashboardUser(request);
    const items = await readSettingArray<DashboardAppointment>(SETTINGS_KEY);
    const sorted = [...items].sort((a, b) => {
      const aKey = `${a.data}T${a.hora}`;
      const bKey = `${b.data}T${b.hora}`;
      return aKey.localeCompare(bKey);
    });
    return NextResponse.json(sorted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar agendamentos.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<DashboardAppointment>;
    const patients = await readSettingArray<{ id: string; nome: string; cpf?: string }>(
      "dashboard_patients",
    );
    const linkedPatient = patients.find(
      (item) => normalizeName(item.nome) === normalizeName(normalizeString(body.paciente)),
    );

    const item: DashboardAppointment = {
      id: crypto.randomUUID(),
      paciente: normalizeString(body.paciente),
      data: normalizeString(body.data),
      hora: normalizeString(body.hora),
      tipo: normalizeString(body.tipo),
      canal: normalizeString(body.canal),
      status: normalizeString(body.status) || "Pendente",
      observacoes: normalizeString(body.observacoes),
      createdAt: new Date().toISOString(),
      patientId: linkedPatient?.id,
      patientCpf: linkedPatient?.cpf,
    };

    if (!item.paciente || !item.data || !item.hora) {
      return NextResponse.json(
        { error: "Preencha paciente, data e hora para criar o agendamento." },
        { status: 400 },
      );
    }

    const items = await readSettingArray<DashboardAppointment>(SETTINGS_KEY);
    await writeSettingArray(SETTINGS_KEY, [...items, item]);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao salvar o agendamento.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
