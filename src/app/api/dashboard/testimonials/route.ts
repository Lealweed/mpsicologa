import { NextResponse } from "next/server";
import {
  DashboardAuthError,
  ensureDashboardUser,
  readSettingArray,
  writeSettingArray,
} from "../_store";

type DashboardTestimonial = {
  id: string;
  author: string;
  role: string;
  location: string;
  text: string;
  imageUrl: string;
  rating: number;
  initials: string;
  active: boolean;
  order: number;
  createdAt: string;
};

const SETTINGS_KEY = "marketing_testimonials";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBoolean(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildInitials(author: string) {
  return author
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function sortTestimonials(items: DashboardTestimonial[]) {
  return [...items].sort((a, b) => {
    const orderDiff = Number(a.order ?? 0) - Number(b.order ?? 0);
    return orderDiff !== 0 ? orderDiff : b.createdAt.localeCompare(a.createdAt);
  });
}

function buildTestimonial(
  body: Partial<DashboardTestimonial>,
  existing?: DashboardTestimonial,
): DashboardTestimonial {
  const author = normalizeString(body.author) || existing?.author || "";
  const rating = Math.max(1, Math.min(5, normalizeNumber(body.rating, existing?.rating ?? 5)));

  return {
    id: normalizeString(body.id) || existing?.id || crypto.randomUUID(),
    author,
    role: normalizeString(body.role) || existing?.role || "",
    location: normalizeString(body.location) || existing?.location || "",
    text: normalizeString(body.text) || existing?.text || "",
    imageUrl: normalizeString(body.imageUrl) || existing?.imageUrl || "",
    rating,
    initials: normalizeString(body.initials) || existing?.initials || buildInitials(author),
    active: normalizeBoolean(body.active, existing?.active ?? true),
    order: normalizeNumber(body.order, existing?.order ?? 0),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
}

function resolveId(request: Request, body?: { id?: string }) {
  const raw = normalizeString(body?.id) || new URL(request.url).searchParams.get("id") || "";
  return raw.trim();
}

export async function GET(request: Request) {
  try {
    await ensureDashboardUser(request);
    const items = await readSettingArray<DashboardTestimonial>(SETTINGS_KEY);
    return NextResponse.json(sortTestimonials(items));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar depoimentos.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<DashboardTestimonial>;
    const item = buildTestimonial(body);

    if (!item.author || !item.text) {
      return NextResponse.json(
        { error: "Preencha nome/identificação e o texto do depoimento." },
        { status: 400 },
      );
    }

    const items = await readSettingArray<DashboardTestimonial>(SETTINGS_KEY);
    const next = sortTestimonials([item, ...items]);
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao salvar o depoimento.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<DashboardTestimonial>;
    const id = resolveId(request, { id: typeof body.id === "string" ? body.id : "" });

    if (!id) {
      return NextResponse.json({ error: "ID do depoimento inválido." }, { status: 400 });
    }

    const items = await readSettingArray<DashboardTestimonial>(SETTINGS_KEY);
    const current = items.find((item) => item.id === id);

    if (!current) {
      return NextResponse.json({ error: "Depoimento não encontrado." }, { status: 404 });
    }

    const updated = buildTestimonial({ ...body, id }, current);

    if (!updated.author || !updated.text) {
      return NextResponse.json(
        { error: "Preencha nome/identificação e o texto do depoimento." },
        { status: 400 },
      );
    }

    const next = sortTestimonials(items.map((item) => (item.id === id ? updated : item)));
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao atualizar o depoimento.";
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
      return NextResponse.json({ error: "ID do depoimento inválido." }, { status: 400 });
    }

    const items = await readSettingArray<DashboardTestimonial>(SETTINGS_KEY);
    const next = items.filter((item) => item.id !== id);
    await writeSettingArray(SETTINGS_KEY, next);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao excluir o depoimento.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
