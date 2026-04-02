import { NextResponse } from "next/server";
import { readSettingArray } from "../../dashboard/_store";
import {
  getPortalPatientFromRequest,
  matchesPatientByRecord,
  type DashboardAppointmentRecord,
} from "../_session";

function resolveLocation(channel: string) {
  if (channel === "video") return "Atendimento on-line";
  if (channel === "presencial") return "Atendimento presencial";
  if (channel === "telefone") return "Atendimento por telefone";
  return "Atendimento via WhatsApp";
}

export async function GET(request: Request) {
  try {
    const patient = await getPortalPatientFromRequest(request);
    const appointments = await readSettingArray<DashboardAppointmentRecord>("dashboard_appointments");
    const today = new Date().toISOString().slice(0, 10);

    const upcoming = appointments
      .filter((item) => matchesPatientByRecord(patient, item) && item.data >= today)
      .sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`))
      .map((item) => ({
        id: item.id,
        date: item.data,
        time: item.hora,
        type: item.tipo,
        status: item.status,
        professional: "Dra. Mayara",
        location: resolveLocation(item.canal),
        notes: item.observacoes,
      }));

    return NextResponse.json(upcoming);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar próximas sessões.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
