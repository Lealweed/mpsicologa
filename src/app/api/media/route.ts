import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  encodeCategory,
  mapRowToMediaItem,
  type MediaKind,
  type SiteMediaRow,
  uploadMediaFile,
} from "./_utils";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("site_media")
      .select("id, title, category, url")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Nao foi possivel carregar as midias: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      ((data ?? []) as SiteMediaRow[]).map(mapRowToMediaItem),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao carregar as midias.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const rawKind = String(formData.get("kind") ?? "image").trim();
    const kind: MediaKind = rawKind === "video" ? "video" : "image";
    const file = formData.get("file");

    if (!title || !category || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Preencha titulo, categoria e selecione um arquivo valido." },
        { status: 400 },
      );
    }

    const upload = await uploadMediaFile(file, kind);
    const { data, error } = await supabaseAdmin
      .from("site_media")
      .insert([
        {
          title,
          category: encodeCategory(kind, category),
          url: upload.publicUrl,
        },
      ])
      .select("id, title, category, url")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          error:
            error?.message ?? "Nao foi possivel salvar o registro da midia no banco.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(mapRowToMediaItem(data as SiteMediaRow), {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha inesperada ao enviar a midia.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
