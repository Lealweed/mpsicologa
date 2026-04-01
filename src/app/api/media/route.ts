import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  encodeCategory,
  mapRowToMediaItem,
  removeMediaFile,
  type MediaKind,
  type SiteMediaRow,
  uploadMediaFile,
} from "./_utils";

type CreateMediaPayload = {
  title: string;
  category: string;
  kind: MediaKind;
  url: string;
};

type DeleteMediaPayload = {
  id?: number;
};

type PatchMediaPayload = {
  id?: number;
  title?: string;
  category?: string;
  kind?: MediaKind;
  url?: string;
};

function normalizeMediaId(raw: unknown): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function inferKindFromCategory(category: string): MediaKind {
  return category.startsWith("video:") ? "video" : "image";
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

async function parseCreatePayload(request: Request): Promise<CreateMediaPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      title?: string;
      category?: string;
      kind?: MediaKind;
      url?: string;
    };

    return {
      title: String(body.title ?? "").trim(),
      category: String(body.category ?? "").trim(),
      kind: body.kind === "video" ? "video" : "image",
      url: String(body.url ?? "").trim(),
    };
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const rawKind = String(formData.get("kind") ?? "image").trim();
  const kind: MediaKind = rawKind === "video" ? "video" : "image";
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { title, category, kind, url: "" };
  }

  const upload = await uploadMediaFile(file, kind);

  return {
    title,
    category,
    kind,
    url: upload.publicUrl,
  };
}

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
    const { title, category, kind, url } = await parseCreatePayload(request);

    if (!title || !category || !url) {
      return NextResponse.json(
        { error: "Preencha titulo, categoria e selecione um arquivo valido." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("site_media")
      .insert([
        {
          title,
          category: encodeCategory(kind, category),
          url,
        },
      ])
      .select("id, title, category, url")
      .single();

    if (error || !data) {
      await removeMediaFile(url);

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

export async function DELETE(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let mediaId: number | null = null;

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as DeleteMediaPayload;
      mediaId = normalizeMediaId(body.id);
    }

    if (mediaId === null) {
      const queryId = new URL(request.url).searchParams.get("id");
      mediaId = normalizeMediaId(queryId);
    }

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

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as PatchMediaPayload;
    const mediaId = normalizeMediaId(body.id);

    if (mediaId === null) {
      return NextResponse.json({ error: "ID de midia invalido." }, { status: 400 });
    }

    const row = await getMediaRowById(mediaId);

    if (!row) {
      return NextResponse.json({ error: "Midia nao encontrada." }, { status: 404 });
    }

    const nextTitle =
      typeof body.title === "string" ? body.title.trim() : row.title;
    const rawCategory =
      typeof body.category === "string" ? body.category.trim() : "";
    const currentKind = inferKindFromCategory(row.category);
    const nextKind = body.kind === "video" || body.kind === "image" ? body.kind : currentKind;
    const nextCategory = rawCategory ? encodeCategory(nextKind, rawCategory) : row.category;
    const nextUrl = typeof body.url === "string" ? body.url.trim() : row.url;

    if (!nextTitle || !nextCategory || !nextUrl) {
      return NextResponse.json(
        { error: "Preencha titulo, categoria e URL validos para atualizar." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("site_media")
      .update({
        title: nextTitle,
        category: nextCategory,
        url: nextUrl,
      })
      .eq("id", mediaId)
      .select("id, title, category, url")
      .single();

    if (error || !data) {
      if (nextUrl !== row.url) {
        await removeMediaFile(nextUrl);
      }

      throw new Error(
        error?.message ?? "Nao foi possivel atualizar os dados da midia.",
      );
    }

    if (nextUrl !== row.url) {
      await removeMediaFile(row.url);
    }

    return NextResponse.json(mapRowToMediaItem(data as SiteMediaRow));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha inesperada ao atualizar os dados da midia.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
