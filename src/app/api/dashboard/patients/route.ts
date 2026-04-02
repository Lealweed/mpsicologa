import { NextResponse } from "next/server";
import { hashPortalPassword, normalizeCpfDigits } from "@/lib/patient-portal";
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
  portalEnabled: boolean;
};

type StoredDashboardPatient = DashboardPatient & {
  normalizedCpf: string;
  portalPasswordHash: string;
};

const SETTINGS_KEY = "dashboard_patients";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizePatient(item: StoredDashboardPatient): DashboardPatient {
  return {
    ...item,
    portalEnabled: Boolean(item.portalEnabled),
  };
}

function buildPatient(
  body: Partial<StoredDashboardPatient> & { portalPassword?: string },
  current?: StoredDashboardPatient,
): StoredDashboardPatient {
  const cpf = normalizeString(body.cpf) || current?.cpf || "";
  const normalizedCpf = normalizeCpfDigits(cpf);
  const portalPassword = normalizeString(body.portalPassword);
  const portalEnabled = Boolean(
    (body.portalEnabled ?? current?.portalEnabled ?? false) || Boolean(portalPassword),
  );

  return {
    id: current?.id ?? crypto.randomUUID(),
    nome: normalizeString(body.nome) || current?.nome || "",
    email: normalizeString(body.email) || current?.email || "",
    whatsapp: normalizeString(body.whatsapp) || current?.whatsapp || "",
    telefone: normalizeString(body.telefone) || current?.telefone || "",
    endereco: normalizeString(body.endereco) || current?.endereco || "",
    sexo: normalizeString(body.sexo) || current?.sexo || "",
    idade: normalizeString(body.idade) || current?.idade || "",
    dataNascimento: normalizeString(body.dataNascimento) || current?.dataNascimento || "",
    numeroSus: normalizeString(body.numeroSus) || current?.numeroSus || "",
    cpf,
    convenio: normalizeString(body.convenio) || current?.convenio || "",
    plano: normalizeString(body.plano) || current?.plano || "",
    observacoes: normalizeString(body.observacoes) || current?.observacoes || "",
    createdAt: current?.createdAt ?? new Date().toISOString(),
    portalEnabled,
    normalizedCpf,
    portalPasswordHash: portalEnabled
      ? portalPassword
        ? hashPortalPassword(portalPassword, cpf)
        : current?.portalPasswordHash || ""
      : "",
  };
}

function validatePatient(item: StoredDashboardPatient) {
  if (!item.nome || !item.email || !item.whatsapp) {
    return "Preencha nome, e-mail e WhatsApp para cadastrar o paciente.";
  }

  if (item.portalEnabled && !item.normalizedCpf) {
    return "Informe o CPF para liberar o acesso ao portal do paciente.";
  }

  if (item.portalEnabled && !item.portalPasswordHash) {
    return "Defina uma senha para liberar o acesso ao portal do paciente.";
  }

  return "";
}

export async function GET(request: Request) {
  try {
    await ensureDashboardUser(request);
    const items = await readSettingArray<StoredDashboardPatient>(SETTINGS_KEY);
    const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json(sorted.map(sanitizePatient));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar pacientes.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<StoredDashboardPatient> & {
      portalPassword?: string;
    };

    const items = await readSettingArray<StoredDashboardPatient>(SETTINGS_KEY);
    const item = buildPatient(body);
    const validationMessage = validatePatient(item);

    if (validationMessage) {
      return NextResponse.json({ error: validationMessage }, { status: 400 });
    }

    if (
      item.normalizedCpf &&
      items.some((existing) => normalizeCpfDigits(existing.normalizedCpf || existing.cpf) === item.normalizedCpf)
    ) {
      return NextResponse.json(
        { error: "Já existe um paciente cadastrado com este CPF." },
        { status: 409 },
      );
    }

    await writeSettingArray(SETTINGS_KEY, [item, ...items]);

    return NextResponse.json(sanitizePatient(item), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao salvar o paciente.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<StoredDashboardPatient> & {
      portalPassword?: string;
    };
    const patientId = normalizeString(body.id);

    if (!patientId) {
      return NextResponse.json({ error: "Paciente inválido para atualização." }, { status: 400 });
    }

    const items = await readSettingArray<StoredDashboardPatient>(SETTINGS_KEY);
    const current = items.find((item) => item.id === patientId);

    if (!current) {
      return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
    }

    const updated = buildPatient(body, current);
    const validationMessage = validatePatient(updated);

    if (validationMessage) {
      return NextResponse.json({ error: validationMessage }, { status: 400 });
    }

    if (
      updated.normalizedCpf &&
      items.some(
        (existing) =>
          existing.id !== updated.id &&
          normalizeCpfDigits(existing.normalizedCpf || existing.cpf) === updated.normalizedCpf,
      )
    ) {
      return NextResponse.json(
        { error: "Já existe outro paciente cadastrado com este CPF." },
        { status: 409 },
      );
    }

    const nextItems = items.map((item) => (item.id === updated.id ? updated : item));
    await writeSettingArray(SETTINGS_KEY, nextItems);

    return NextResponse.json(sanitizePatient(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao atualizar o paciente.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
