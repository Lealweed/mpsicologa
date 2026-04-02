import { NextResponse } from "next/server";
import { readSettingArray } from "../../dashboard/_store";
import {
  getPortalPatientFromRequest,
  matchesPatientByRecord,
  type DashboardFinanceRecord,
} from "../_session";

export async function GET(request: Request) {
  try {
    const patient = await getPortalPatientFromRequest(request);
    const finances = await readSettingArray<DashboardFinanceRecord>("dashboard_finance_entries");

    const items = finances
      .filter((item) => matchesPatientByRecord(patient, item))
      .sort((a, b) => `${b.data}`.localeCompare(a.data))
      .map((item) => ({
        id: item.id,
        description: item.referencia || item.plano || "Sessão / atendimento",
        due_date: item.data,
        status: item.status.toLowerCase(),
        value: item.valor,
        payment_method: item.formaPagamento,
        notes: item.observacoes,
      }));

    return NextResponse.json(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar o financeiro.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
