import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  encodeCategory,
  mapRowToMediaItem,
  removeMediaFile,
  type MediaKind,
  type SiteMediaRow,
} from "../_utils";

type UpdateMediaPayload = {
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

export async function POST(request: Request) {
  let body: UpdateMediaPayload = {};
  let mediaId: number | null = null;

  try {
    body = (await request.json()) as UpdateMediaPayload;
    mediaId = normalizeMediaId(body.id);

    if (mediaId === null) {
      return NextResponse.json(
        {
          error: "ID de midia invalido.",
          debug: {
            operation: "media-update",
            receivedId: body.id ?? null,
            normalizedId: mediaId,
            receivedTitle: body.title ?? null,
            receivedCategory: body.category ?? null,
            receivedKind: body.kind ?? null,
          },
        },
        { status: 400 },
      );
    }

    const row = await getMediaRowById(mediaId);

    if (!row) {
      return NextResponse.json(
        {
          error: "Midia nao encontrada.",
          debug: {
            operation: "media-update",
            receivedId: body.id ?? null,
            normalizedId: mediaId,
          },
        },
        { status: 404 },
      );
    }

    const nextTitle = typeof body.title === "string" ? body.title.trim() : row.title;
    const rawCategory = typeof body.category === "string" ? body.category.trim() : "";
    const currentKind = inferKindFromCategory(row.category);
    const nextKind = body.kind === "video" || body.kind === "image" ? body.kind : currentKind;
    const nextCategory = rawCategory ? encodeCategory(nextKind, rawCategory) : row.category;
    const nextUrl = typeof body.url === "string" ? body.url.trim() : row.url;

    if (!nextTitle || !nextCategory || !nextUrl) {
      return NextResponse.json(
        {
          error: "Preencha titulo, categoria e URL validos para atualizar.",
          debug: {
            operation: "media-update",
            receivedId: body.id ?? null,
            normalizedId: mediaId,
            receivedTitle: body.title ?? null,
            receivedCategory: body.category ?? null,
            receivedKind: body.kind ?? null,
            receivedUrl: body.url ?? null,
            resolvedTitle: nextTitle,
            resolvedCategory: nextCategory,
            resolvedUrl: nextUrl,
          },
        },
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

      return NextResponse.json(
        {
          error: error?.message ?? "Nao foi possivel atualizar os dados da midia.",
          debug: {
            operation: "media-update",
            receivedId: body.id ?? null,
            normalizedId: mediaId,
            code: error?.code ?? null,
            details: error?.details ?? null,
            hint: error?.hint ?? null,
            resolvedTitle: nextTitle,
            resolvedCategory: nextCategory,
            resolvedUrl: nextUrl,
          },
        },
        { status: 500 },
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

    return NextResponse.json(
      {
        error: message,
        debug: {
          operation: "media-update",
          receivedId: body.id ?? null,
          normalizedId: mediaId,
          receivedTitle: body.title ?? null,
          receivedCategory: body.category ?? null,
          receivedKind: body.kind ?? null,
          receivedUrl: body.url ?? null,
        },
      },
      { status: 500 },
    );
  }
}