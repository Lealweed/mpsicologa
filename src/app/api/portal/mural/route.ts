import { NextResponse } from "next/server";
import { getPortalPatientFromRequest, type PortalAnnouncement } from "../_session";
import { readSettingArray } from "../../dashboard/_store";

export async function GET(request: Request) {
  try {
    const patient = await getPortalPatientFromRequest(request);
    const announcements = await readSettingArray<PortalAnnouncement>("portal_mural");

    const fallback = [
      {
        id: "welcome",
        title: "Bem-vindo ao portal do paciente",
        body: `Olá, ${patient.nome}. Aqui você acompanha próximos atendimentos, histórico, informações financeiras e avisos importantes da clínica.`,
        createdAt: new Date().toISOString(),
      },
      {
        id: "support",
        title: "Dúvidas sobre seu atendimento",
        body: "Se precisar remarcar, confirmar horário ou tirar dúvidas, utilize o WhatsApp informado no seu cadastro.",
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(announcements.length > 0 ? announcements : fallback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar o mural.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
