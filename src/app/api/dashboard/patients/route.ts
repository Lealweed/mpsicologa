import { NextResponse } from "next/server";
import {
  DashboardAuthError,
  ensureDashboardUser,
  readSettingArray,
  writeSettingArray,
} from "../_store";

type DashboardPatient = {
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
};

const SETTINGS_KEY = "dashboard_patients";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  try {
    await ensureDashboardUser(request);
    const items = await readSettingArray<DashboardPatient>(SETTINGS_KEY);
    const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json(sorted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar pacientes.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<DashboardPatient>;

    const item: DashboardPatient = {
      id: crypto.randomUUID(),
      nome: normalizeString(body.nome),
      email: normalizeString(body.email),
      whatsapp: normalizeString(body.whatsapp),
      telefone: normalizeString(body.telefone),
      endereco: normalizeString(body.endereco),
      sexo: normalizeString(body.sexo),
      idade: normalizeString(body.idade),
      dataNascimento: normalizeString(body.dataNascimento),
      numeroSus: normalizeString(body.numeroSus),
      cpf: normalizeString(body.cpf),
      convenio: normalizeString(body.convenio),
      plano: normalizeString(body.plano),
      observacoes: normalizeString(body.observacoes),
      createdAt: new Date().toISOString(),
    };

    if (!item.nome || !item.email || !item.whatsapp) {
      return NextResponse.json(
        { error: "Preencha nome, e-mail e WhatsApp para cadastrar o paciente." },
        { status: 400 },
      );
    }

    const items = await readSettingArray<DashboardPatient>(SETTINGS_KEY);
    await writeSettingArray(SETTINGS_KEY, [item, ...items]);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao salvar o paciente.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
