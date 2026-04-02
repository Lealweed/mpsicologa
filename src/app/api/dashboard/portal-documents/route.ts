import { NextResponse } from "next/server";
import {
  DashboardAuthError,
  ensureDashboardUser,
  readSettingArray,
  writeSettingArray,
} from "../_store";

type DashboardPortalDocument = {
  id: string;
  paciente: string;
  patientId?: string;
  patientCpf?: string;
  title: string;
  type: string;
  url: string;
  active: boolean;
  createdAt: string;
};

const SETTINGS_KEY = "patient_documents";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBoolean(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

function sortDocuments(items: DashboardPortalDocument[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildDocument(
  body: Partial<DashboardPortalDocument>,
  existing?: DashboardPortalDocument,
): DashboardPortalDocument {
  return {
    id: normalizeString(body.id) || existing?.id || crypto.randomUUID(),
    paciente: normalizeString(body.paciente) || existing?.paciente || "",
    patientId: normalizeString(body.patientId) || existing?.patientId || "",
    patientCpf: normalizeString(body.patientCpf) || existing?.patientCpf || "",
    title: normalizeString(body.title) || existing?.title || "",
    type: normalizeString(body.type) || existing?.type || "Documento",
    url: normalizeString(body.url) || existing?.url || "",
    active: normalizeBoolean(body.active, existing?.active ?? true),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
}

function resolveId(request: Request, body?: { id?: string }) {
  return normalizeString(body?.id) || new URL(request.url).searchParams.get("id") || "";
}

export async function GET(request: Request) {
  try {
    await ensureDashboardUser(request);
    const items = await readSettingArray<DashboardPortalDocument>(SETTINGS_KEY);
    return NextResponse.json(sortDocuments(items));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar documentos do portal.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<DashboardPortalDocument>;
    const item = buildDocument(body);

    if (!item.paciente || !item.title || !item.url) {
      return NextResponse.json(
        { error: "Selecione o paciente, informe o título e envie o arquivo do documento." },
        { status: 400 },
      );
    }

    const items = await readSettingArray<DashboardPortalDocument>(SETTINGS_KEY);
    const next = sortDocuments([item, ...items]);
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao salvar o documento.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<DashboardPortalDocument>;
    const id = resolveId(request, body);

    if (!id) {
      return NextResponse.json({ error: "ID do documento inválido." }, { status: 400 });
    }

    const items = await readSettingArray<DashboardPortalDocument>(SETTINGS_KEY);
    const current = items.find((item) => item.id === id);

    if (!current) {
      return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });
    }

    const updated = buildDocument({ ...body, id }, current);

    if (!updated.paciente || !updated.title || !updated.url) {
      return NextResponse.json(
        { error: "Selecione o paciente, informe o título e envie o arquivo do documento." },
        { status: 400 },
      );
    }

    const next = sortDocuments(items.map((item) => (item.id === id ? updated : item)));
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao atualizar o documento.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as { id?: string };
    const id = resolveId(request, body);

    if (!id) {
      return NextResponse.json({ error: "ID do documento inválido." }, { status: 400 });
    }

    const items = await readSettingArray<DashboardPortalDocument>(SETTINGS_KEY);
    const next = items.filter((item) => item.id !== id);
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao excluir o documento.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
