import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  mapRowToMediaItem,
  removeMediaFile,
  type MediaKind,
  type SiteMediaRow,
  uploadMediaFile,
} from "../_utils";

type UpdateMediaPayload = {
  kind: MediaKind;
  url: string;
};

function extractIdFromUrl(request: NextRequest): number | null {
  const segments = request.nextUrl.pathname.split("/");
  const last = segments[segments.length - 1];
  const id = Number(last);
  return Number.isNaN(id) ? null : id;
}

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

async function parseUpdatePayload(
  request: Request,
  currentRow: SiteMediaRow,
): Promise<UpdateMediaPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      kind?: MediaKind;
      url?: string;
    };

    return {
      kind:
        body.kind === "video" || currentRow.category.startsWith("video:")
          ? "video"
          : "image",
      url: String(body.url ?? "").trim(),
    };
  }

  const formData = await request.formData();
  const rawKind = String(formData.get("kind") ?? "").trim();
  const kind: MediaKind =
    rawKind === "video" || currentRow.category.startsWith("video:")
      ? "video"
      : "image";
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { kind, url: "" };
  }

  const upload = await uploadMediaFile(file, kind);

  return {
    kind,
    url: upload.publicUrl,
  };
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const mediaId = extractIdFromUrl(request);

    if (mediaId === null) {
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
  request: NextRequest,
) {
  try {
    const mediaId = extractIdFromUrl(request);

    if (mediaId === null) {
      return NextResponse.json({ error: "ID de midia invalido." }, { status: 400 });
    }

    const row = await getMediaRow(mediaId);

    if (!row) {
      return NextResponse.json({ error: "Midia nao encontrada." }, { status: 404 });
    }

    const { url } = await parseUpdatePayload(request, row);

    if (!url) {
      return NextResponse.json(
        { error: "Selecione um arquivo valido para substituir." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("site_media")
      .update({ url })
      .eq("id", mediaId)
      .select("id, title, category, url")
      .single();

    if (error || !data) {
      await removeMediaFile(url);

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
