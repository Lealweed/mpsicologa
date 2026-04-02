import { NextResponse } from "next/server";
import {
  getPortalPatientFromRequest,
  matchesPatientByRecord,
  type DashboardAppointmentRecord,
} from "../_session";
import { readSettingArray } from "../../dashboard/_store";

export async function GET(request: Request) {
  try {
    const patient = await getPortalPatientFromRequest(request);
    const appointments = await readSettingArray<DashboardAppointmentRecord>("dashboard_appointments");

    const today = new Date().toISOString().slice(0, 10);
    const history = appointments
      .filter((item) => matchesPatientByRecord(patient, item) && item.data < today)
      .sort((a, b) => `${b.data}T${b.hora}`.localeCompare(`${a.data}T${a.hora}`))
      .map((item) => ({
        id: item.id,
        date: item.data,
        time: item.hora,
        title: item.tipo,
        status: item.status,
        description: item.observacoes || "Sessão registrada no prontuário.",
      }));

    if (patient.observacoes) {
      history.unshift({
        id: `obs-${patient.id}`,
        date: patient.createdAt.slice(0, 10),
        time: "",
        title: "Observações iniciais",
        status: "Registro",
        description: patient.observacoes,
      });
    }

    return NextResponse.json(history);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar o histórico.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
