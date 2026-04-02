import { NextResponse } from "next/server";
import { getPortalPatientFromRequest } from "../_session";

export async function GET(request: Request) {
  try {
    const patient = await getPortalPatientFromRequest(request);

    return NextResponse.json({
      id: patient.id,
      name: patient.nome,
      email: patient.email,
      whatsapp: patient.whatsapp,
      telefone: patient.telefone,
      endereco: patient.endereco,
      sexo: patient.sexo,
      idade: patient.idade,
      dataNascimento: patient.dataNascimento,
      numeroSus: patient.numeroSus,
      cpf: patient.cpf,
      convenio: patient.convenio,
      plano: patient.plano,
      observacoes: patient.observacoes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar o perfil do paciente.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
