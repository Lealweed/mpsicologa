import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { removeMediaFile, type SiteMediaRow } from "../_utils";

type DeleteMediaPayload = {
  id?: number;
};

function normalizeMediaId(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getMediaRowById(id: number) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("site_media")
    .select("id, title, category, url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel localizar a midia: ${error.message}`);
  }

  return (data ?? null) as SiteMediaRow | null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DeleteMediaPayload;
    const mediaId = normalizeMediaId(body.id);

    if (mediaId === null) {
      return NextResponse.json({ error: "ID de midia invalido." }, { status: 400 });
    }

    const row = await getMediaRowById(mediaId);

    if (!row) {
      return NextResponse.json({ error: "Midia nao encontrada." }, { status: 404 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("site_media").delete().eq("id", mediaId);

    if (error) {
      throw new Error(`Nao foi possivel excluir a midia: ${error.message}`);
    }

    await removeMediaFile(row.url);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha inesperada ao excluir a midia.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}