import { NextResponse } from "next/server";
import { readSettingArray } from "../../dashboard/_store";
import {
  createPortalSessionToken,
  normalizeCpfDigits,
  verifyPortalPasswordHash,
} from "@/lib/patient-portal";
import type { StoredDashboardPatient } from "../_session";

function maskCpf(value: string) {
  const digits = normalizeCpfDigits(value);

  if (digits.length !== 11) {
    return value;
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      cpf?: string;
      password?: string;
      pin?: string;
    };

    const cpf = normalizeCpfDigits(body.cpf);
    const password = String(body.password ?? body.pin ?? "").trim();

    if (!cpf || !password) {
      return NextResponse.json(
        { error: "Informe CPF e senha para acessar o portal." },
        { status: 400 },
      );
    }

    const patients = await readSettingArray<StoredDashboardPatient>("dashboard_patients");
    const patient = patients.find(
      (item) => normalizeCpfDigits(item.normalizedCpf || item.cpf) === cpf,
    );

    if (
      !patient ||
      !patient.portalEnabled ||
      !verifyPortalPasswordHash(patient.portalPasswordHash, password, patient.cpf)
    ) {
      return NextResponse.json(
        { error: "CPF ou senha inválidos para o portal do paciente." },
        { status: 401 },
      );
    }

    const sessionToken = createPortalSessionToken({ patientId: patient.id, cpf });

    return NextResponse.json({
      session_token: sessionToken,
      patient: {
        id: patient.id,
        name: patient.nome,
        plan: patient.plano,
        cpfMasked: maskCpf(patient.cpf),
        whatsapp: patient.whatsapp,
        email: patient.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao entrar no portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
