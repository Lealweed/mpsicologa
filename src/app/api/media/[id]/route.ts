import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  mapRowToMediaItem,
  removeMediaFile,
  type MediaKind,
  type SiteMediaRow,
  uploadMediaFile,
} from "../_utils";

async function getMediaRow(id: number) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("site_media")
    .select("id, title, category, url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nao foi possivel localizar a midia: ${error.message}`);
  }

  return data as SiteMediaRow | null;
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const mediaId = Number(id);

    if (Number.isNaN(mediaId)) {
      return NextResponse.json({ error: "ID de midia invalido." }, { status: 400 });
    }

    const row = await getMediaRow(mediaId);

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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const mediaId = Number(id);

    if (Number.isNaN(mediaId)) {
      return NextResponse.json({ error: "ID de midia invalido." }, { status: 400 });
    }

    const row = await getMediaRow(mediaId);

    if (!row) {
      return NextResponse.json({ error: "Midia nao encontrada." }, { status: 404 });
    }

    const formData = await request.formData();
    const rawKind = String(formData.get("kind") ?? "").trim();
    const kind: MediaKind =
      rawKind === "video" || row.category.startsWith("video:")
        ? "video"
        : "image";
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecione um arquivo valido para substituir." },
        { status: 400 },
      );
    }

    const upload = await uploadMediaFile(file, kind);
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("site_media")
      .update({ url: upload.publicUrl })
      .eq("id", mediaId)
      .select("id, title, category, url")
      .single();

    if (error || !data) {
      throw new Error(
        error?.message ?? "Nao foi possivel atualizar a URL da midia.",
      );
    }

    await removeMediaFile(row.url);

    return NextResponse.json(mapRowToMediaItem(data as SiteMediaRow));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha inesperada ao substituir a midia.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
