import { getSupabaseAdmin } from "@/lib/supabase/admin";

const PUBLIC_MEDIA_BUCKET = "public_media";
const PUBLIC_MEDIA_FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB (limite do plano Supabase)
const PUBLIC_MEDIA_ALLOWED_MIME_TYPES = [
  "image/*",
  "video/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const VIDEO_CATEGORY_PREFIX = "video:";

export type MediaKind = "image" | "video" | "document";

export type SiteMediaRow = {
  id: string;
  title: string;
  category: string;
  url: string;
};

export type MediaApiItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  kind: MediaKind;
};

export function mapRowToMediaItem(row: SiteMediaRow): MediaApiItem {
  const kind = row.category.startsWith(VIDEO_CATEGORY_PREFIX) ? "video" : "image";

  return {
    id: row.id,
    title: row.title,
    category:
      kind === "video"
        ? row.category.slice(VIDEO_CATEGORY_PREFIX.length)
        : row.category,
    url: row.url,
    kind,
  };
}

export function encodeCategory(kind: MediaKind, category: string) {
  return kind === "video" ? `${VIDEO_CATEGORY_PREFIX}${category}` : category;
}

export function extractStoragePath(publicUrl: string) {
  const marker = `/${PUBLIC_MEDIA_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return publicUrl.slice(markerIndex + marker.length);
}

export function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_");
}

export async function ensurePublicMediaBucket() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

  if (error) {
    throw new Error(`Nao foi possivel listar os buckets: ${error.message}`);
  }

  const bucket = buckets.find((entry) => entry.name === PUBLIC_MEDIA_BUCKET);

  if (bucket) {
    const supportsConfiguredLimit =
      bucket.file_size_limit == null ||
      bucket.file_size_limit >= PUBLIC_MEDIA_FILE_SIZE_LIMIT;
    const supportsConfiguredTypes =
      !bucket.allowed_mime_types ||
      PUBLIC_MEDIA_ALLOWED_MIME_TYPES.every((type) =>
        bucket.allowed_mime_types?.includes(type),
      );

    if (bucket.public && supportsConfiguredLimit && supportsConfiguredTypes) {
      return;
    }

    const { error: updateError } = await supabaseAdmin.storage.updateBucket(
      PUBLIC_MEDIA_BUCKET,
      {
        public: true,
        fileSizeLimit: PUBLIC_MEDIA_FILE_SIZE_LIMIT,
        allowedMimeTypes: PUBLIC_MEDIA_ALLOWED_MIME_TYPES,
      },
    );

    if (updateError) {
      throw new Error(
        `Nao foi possivel atualizar o bucket de midia: ${updateError.message}`,
      );
    }

    return;
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(
    PUBLIC_MEDIA_BUCKET,
    {
      public: true,
      fileSizeLimit: PUBLIC_MEDIA_FILE_SIZE_LIMIT,
      allowedMimeTypes: PUBLIC_MEDIA_ALLOWED_MIME_TYPES,
    },
  );

  if (createError) {
    throw new Error(`Nao foi possivel criar o bucket de midia: ${createError.message}`);
  }
}

export async function uploadMediaFile(file: File, kind: MediaKind) {
  const supabaseAdmin = getSupabaseAdmin();
  await ensurePublicMediaBucket();

  const sanitizedName = sanitizeFileName(file.name);
  const storagePath = `${kind}/${Date.now()}_${sanitizedName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (error) {
    throw new Error(`Nao foi possivel enviar o arquivo: ${error.message}`);
  }

  return {
    storagePath,
    publicUrl: supabaseAdmin.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .getPublicUrl(storagePath).data.publicUrl,
  };
}

export async function createSignedUploadData(fileName: string, kind: MediaKind) {
  const supabaseAdmin = getSupabaseAdmin();
  await ensurePublicMediaBucket();

  const sanitizedName = sanitizeFileName(fileName);
  const storagePath = `${kind}/${Date.now()}_${sanitizedName}`;
  const { data, error } = await supabaseAdmin.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new Error(
      error?.message ?? "Nao foi possivel criar o token de upload da midia.",
    );
  }

  return {
    path: data.path,
    token: data.token,
    publicUrl: supabaseAdmin.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .getPublicUrl(storagePath).data.publicUrl,
  };
}

export async function removeMediaFile(publicUrl: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const storagePath = extractStoragePath(publicUrl);

  if (!storagePath) {
    return;
  }

  await supabaseAdmin.storage.from(PUBLIC_MEDIA_BUCKET).remove([storagePath]);
}
