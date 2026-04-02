import { NextResponse } from "next/server";
import { readSettingArray } from "../../dashboard/_store";
import { getPortalPatientFromRequest, matchesPatientByRecord } from "../_session";

type PortalDocument = {
  id: string;
  title: string;
  type: string;
  url: string;
  createdAt: string;
  active?: boolean;
  patientId?: string;
  patientCpf?: string;
  paciente?: string;
};

export async function GET(request: Request) {
  try {
    const patient = await getPortalPatientFromRequest(request);
    const documents = await readSettingArray<PortalDocument>("patient_documents");

    const items = documents
      .filter((item) => item.active !== false)
      .filter((item) => matchesPatientByRecord(patient, item))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar os documentos.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
