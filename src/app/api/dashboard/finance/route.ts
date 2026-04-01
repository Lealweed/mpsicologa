import { NextResponse } from "next/server";
import {
  DashboardAuthError,
  ensureDashboardUser,
  readSettingArray,
  writeSettingArray,
} from "../_store";

type DashboardFinanceEntry = {
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
};

const SETTINGS_KEY = "dashboard_finance_entries";

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  try {
    await ensureDashboardUser(request);
    const items = await readSettingArray<DashboardFinanceEntry>(SETTINGS_KEY);
    const sorted = [...items].sort((a, b) => b.data.localeCompare(a.data));
    return NextResponse.json(sorted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar lançamentos financeiros.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDashboardUser(request);
    const body = (await request.json().catch(() => ({}))) as Partial<DashboardFinanceEntry>;
    const valor = Number(body.valor ?? 0);

    const item: DashboardFinanceEntry = {
      id: crypto.randomUUID(),
      paciente: normalizeString(body.paciente),
      plano: normalizeString(body.plano),
      valor: Number.isFinite(valor) ? valor : 0,
      data: normalizeString(body.data),
      status:
        body.status === "Pago" || body.status === "Parcial"
          ? body.status
          : "Pendente",
      formaPagamento: normalizeString(body.formaPagamento) || "Pix",
      referencia: normalizeString(body.referencia),
      observacoes: normalizeString(body.observacoes),
      createdAt: new Date().toISOString(),
    };

    if (!item.paciente || !item.plano || !item.data || item.valor <= 0) {
      return NextResponse.json(
        { error: "Preencha paciente, serviço, data e valor válido para salvar o lançamento." },
        { status: 400 },
      );
    }

    const items = await readSettingArray<DashboardFinanceEntry>(SETTINGS_KEY);
    await writeSettingArray(SETTINGS_KEY, [item, ...items]);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao salvar o lançamento financeiro.";
    const status = error instanceof DashboardAuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
