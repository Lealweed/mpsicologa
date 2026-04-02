import { NextResponse } from "next/server";
import {
  DashboardAuthError,
  ensureDashboardUser,
  readSettingArray,
  writeSettingArray,
} from "../_store";

type PortalMuralItem = {
  id: string;
  title: string;
  body: string;
  active: boolean;
  audience: "all" | "portal";
  createdAt: string;
};

const SETTINGS_KEY = "portal_mural";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBoolean(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

function buildMuralItem(
  body: Partial<PortalMuralItem>,
  existing?: PortalMuralItem,
): PortalMuralItem {
  return {
    id: normalizeString(body.id) || existing?.id || crypto.randomUUID(),
    title: normalizeString(body.title) || existing?.title || "",
    body: normalizeString(body.body) || existing?.body || "",
    active: normalizeBoolean(body.active, existing?.active ?? true),
    audience: body.audience === "all" ? "all" : existing?.audience || "portal",
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
}

function resolveId(request: Request, body?: { id?: string }) {
  return normalizeString(body?.id) || new URL(request.url).searchParams.get("id") || "";
}

function sortItems(items: PortalMuralItem[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function GET(request: Request) {
  try {
    await ensureDashboardUser(request);
    const items = await readSettingArray<PortalMuralItem>(SETTINGS_KEY);
    return NextResponse.json(sortItems(items));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar o mural do portal.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<PortalMuralItem>;
    const item = buildMuralItem(body);

    if (!item.title || !item.body) {
      return NextResponse.json(
        { error: "Preencha o título e a mensagem para publicar no mural." },
        { status: 400 },
      );
    }

    const items = await readSettingArray<PortalMuralItem>(SETTINGS_KEY);
    const next = sortItems([item, ...items]);
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao publicar o aviso.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<PortalMuralItem>;
    const id = resolveId(request, body);

    if (!id) {
      return NextResponse.json({ error: "ID do aviso inválido." }, { status: 400 });
    }

    const items = await readSettingArray<PortalMuralItem>(SETTINGS_KEY);
    const current = items.find((item) => item.id === id);

    if (!current) {
      return NextResponse.json({ error: "Aviso não encontrado." }, { status: 404 });
    }

    const updated = buildMuralItem({ ...body, id }, current);

    if (!updated.title || !updated.body) {
      return NextResponse.json(
        { error: "Preencha o título e a mensagem para publicar no mural." },
        { status: 400 },
      );
    }

    const next = sortItems(items.map((item) => (item.id === id ? updated : item)));
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao atualizar o aviso.";
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
      return NextResponse.json({ error: "ID do aviso inválido." }, { status: 400 });
    }

    const items = await readSettingArray<PortalMuralItem>(SETTINGS_KEY);
    const next = items.filter((item) => item.id !== id);
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao excluir o aviso.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
