import { NextResponse } from "next/server";
import { createSignedUploadData, type MediaKind } from "../_utils";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fileName?: string;
      kind?: MediaKind;
    };
    const fileName = String(body.fileName ?? "").trim();
    const kind: MediaKind = body.kind === "video" ? "video" : "image";

    if (!fileName) {
      return NextResponse.json(
        { error: "Informe o nome do arquivo para gerar o upload." },
        { status: 400 },
      );
    }

    return NextResponse.json(await createSignedUploadData(fileName, kind));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha ao criar o upload assinado da midia.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
