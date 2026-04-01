"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Play,
  ImageIcon,
  Video,
  Pencil,
} from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import styles from "./midia.module.css";
import {
  MARKETING_IMAGE_SLOTS,
  MARKETING_VIDEO_SLOTS,
} from "@/lib/site-media";
import { supabase } from "@/lib/supabase/client";

type MediaKind = "image" | "video";

type MediaApiItem = {
  id: number;
  title: string;
  category: string;
  url: string;
  kind: MediaKind;
};

type SignedUploadResponse = {
  path: string;
  token: string;
  publicUrl: string;
};

type ImageItem = {
  id: number;
  titulo: string;
  categoria: string;
  url: string;
};

type VideoItem = {
  id: number;
  titulo: string;
  categoria: string;
  url: string;
};

type Tab = "imagens" | "videos";

type AddImageForm = {
  titulo: string;
  categoria: string;
  file: File | null;
};

type AddVideoForm = {
  titulo: string;
  categoria: string;
  file: File | null;
};

type EditMediaForm = {
  id: number | null;
  kind: MediaKind;
  titulo: string;
  categoria: string;
};

const BLANK_IMG: AddImageForm = { titulo: "", categoria: "", file: null };
const BLANK_VID: AddVideoForm = { titulo: "", categoria: "", file: null };
const BLANK_EDIT: EditMediaForm = {
  id: null,
  kind: "image",
  titulo: "",
  categoria: "",
};

function mapImage(item: MediaApiItem): ImageItem {
  return {
    id: item.id,
    titulo: item.title,
    categoria: item.category,
    url: item.url,
  };
}

function mapVideo(item: MediaApiItem): VideoItem {
  return {
    id: item.id,
    titulo: item.title,
    categoria: item.category,
    url: item.url,
  };
}

async function getApiError(response: Response) {
  const raw = (await response.text()).trim();

  if (!raw) {
    return `Falha ao processar a solicitacao (${response.status}).`;
  }

  if (raw.startsWith("<")) {
    return `Falha ao processar a solicitacao (${response.status}).`;
  }

  try {
    const payload = JSON.parse(raw) as { error?: string };
    return payload.error || `Falha ao processar a solicitacao (${response.status}).`;
  } catch {
    return raw;
  }
}

async function uploadFileToStorage(file: File, kind: MediaKind) {
  const signedUploadResponse = await fetch("/api/media/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      kind,
    }),
  });

  if (!signedUploadResponse.ok) {
    throw new Error(await getApiError(signedUploadResponse));
  }

  const { path, token, publicUrl } =
    (await signedUploadResponse.json()) as SignedUploadResponse;
  const { error } = await supabase.storage
    .from("public_media")
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Nao foi possivel enviar o arquivo: ${error.message}`);
  }

  return publicUrl;
}

async function createMediaRecord(payload: {
  title: string;
  category: string;
  kind: MediaKind;
  url: string;
}) {
  const response = await fetch("/api/media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  return (await response.json()) as MediaApiItem;
}

async function replaceMediaRecord(
  id: number,
  payload: { kind: MediaKind; url: string },
) {
  const response = await fetch("/api/media", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...payload }),
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  return (await response.json()) as MediaApiItem;
}

async function updateMediaInfoRecord(payload: {
  id: number;
  kind: MediaKind;
  title: string;
  category: string;
}) {
  const response = await fetch("/api/media", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  return (await response.json()) as MediaApiItem;
}

function ImageCard({
  img,
  active,
  onDelete,
  onReplace,
  onEdit,
}: {
  img: ImageItem;
  active: boolean;
  onDelete: (id: number) => void;
  onReplace: (id: number, file: File) => void;
  onEdit: (item: ImageItem) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onReplace(img.id, file);
    event.target.value = "";
  }

  return (
    <div className={styles.mediaCard}>
      <div className={styles.mediaThumb}>
        <img src={img.url} alt={img.titulo} className={styles.mediaImg} />
        <div className={styles.mediaOverlay}>
          <button
            type="button"
            className={styles.overlayBtn}
            onClick={() => onEdit(img)}
            title="Editar legenda"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className={styles.overlayBtn}
            onClick={() => inputRef.current?.click()}
            title="Substituir"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            className={styles.overlayBtnDanger}
            onClick={() => onDelete(img.id)}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {active ? <span className={styles.activeBadge}>Ativa no site</span> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFile}
      />
      <div className={styles.mediaInfo}>
        <span className={styles.mediaTitle}>{img.titulo}</span>
        <span className={styles.mediaBadge}>{img.categoria}</span>
      </div>
    </div>
  );
}

function VideoCard({
  vid,
  active,
  onDelete,
  onReplace,
  onEdit,
}: {
  vid: VideoItem;
  active: boolean;
  onDelete: (id: number) => void;
  onReplace: (id: number, file: File) => void;
  onEdit: (item: VideoItem) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  function handleLoadedMetadata() {
    if (videoRef.current) {
      videoRef.current.currentTime = 0.001;
    }
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onReplace(vid.id, file);
    event.target.value = "";
  }

  return (
    <div className={styles.mediaCard}>
      <div className={styles.mediaThumb}>
        {videoError ? (
          <div className={styles.videoFallback}>
            <Play size={28} color="var(--muted)" />
            <span className={styles.videoFallbackText}>Video enviado</span>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={vid.url}
              className={styles.mediaVideo}
              preload="metadata"
              muted
              playsInline
              crossOrigin="anonymous"
              onLoadedMetadata={handleLoadedMetadata}
              onError={() => setVideoError(true)}
            />
            <div className={styles.playOverlay}>
              <Play size={28} fill="#fff" color="#fff" />
            </div>
          </>
        )}
        <div className={styles.mediaOverlay}>
          <button
            type="button"
            className={styles.overlayBtn}
            onClick={() => onEdit(vid)}
            title="Editar legenda"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className={styles.overlayBtn}
            onClick={() => inputRef.current?.click()}
            title="Substituir"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            className={styles.overlayBtnDanger}
            onClick={() => onDelete(vid.id)}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {active ? <span className={styles.activeBadge}>Ativo no site</span> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className={styles.hiddenInput}
        onChange={handleFile}
      />
      <div className={styles.mediaInfo}>
        <span className={styles.mediaTitle}>{vid.titulo}</span>
        <span className={styles.mediaBadge}>{vid.categoria}</span>
      </div>
    </div>
  );
}

export default function MidiaPage() {
  const [tab, setTab] = useState<Tab>("imagens");
  const [imagens, setImagens] = useState<ImageItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [addImgOpen, setAddImgOpen] = useState(false);
  const [addVidOpen, setAddVidOpen] = useState(false);
  const [imgForm, setImgForm] = useState<AddImageForm>(BLANK_IMG);
  const [vidForm, setVidForm] = useState<AddVideoForm>(BLANK_VID);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditMediaForm>(BLANK_EDIT);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  const activeImages = MARKETING_IMAGE_SLOTS.map((slot) => ({
    slot,
    image: imagens.find((img) => img.categoria === slot.category) ?? null,
  }));
  const activeVideos = MARKETING_VIDEO_SLOTS.map((slot) => ({
    slot,
    video: videos.find((vid) => vid.categoria === slot.category) ?? null,
  }));

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/media", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const media = (await response.json()) as MediaApiItem[];
      setImagens(media.filter((item) => item.kind === "image").map(mapImage));
      setVideos(media.filter((item) => item.kind === "video").map(mapVideo));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar a biblioteca de midia.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  async function handleAddImagem(event: React.FormEvent) {
    event.preventDefault();

    if (!imgForm.file) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const publicUrl = await uploadFileToStorage(imgForm.file, "image");
      const item = mapImage(
        await createMediaRecord({
          title: imgForm.titulo.trim(),
          category: imgForm.categoria,
          kind: "image",
          url: publicUrl,
        }),
      );

      setImagens((prev) => [item, ...prev]);
      setAddImgOpen(false);
      setImgForm(BLANK_IMG);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar a imagem selecionada.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteImagem(id: number) {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setImagens((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir essa imagem agora.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReplaceImagem(id: number, file: File) {
    setLoading(true);
    setErrorMessage("");

    try {
      const publicUrl = await uploadFileToStorage(file, "image");
      const updatedItem = mapImage(
        await replaceMediaRecord(id, {
          kind: "image",
          url: publicUrl,
        }),
      );

      setImagens((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item)),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel substituir a imagem selecionada.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddVideo(event: React.FormEvent) {
    event.preventDefault();

    if (!vidForm.file) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const publicUrl = await uploadFileToStorage(vidForm.file, "video");
      const item = mapVideo(
        await createMediaRecord({
          title: vidForm.titulo.trim(),
          category: vidForm.categoria,
          kind: "video",
          url: publicUrl,
        }),
      );

      setVideos((prev) => [item, ...prev]);
      setAddVidOpen(false);
      setVidForm(BLANK_VID);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o video selecionado.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteVideo(id: number) {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setVideos((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel excluir esse video agora.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReplaceVideo(id: number, file: File) {
    setLoading(true);
    setErrorMessage("");

    try {
      const publicUrl = await uploadFileToStorage(file, "video");
      const updatedItem = mapVideo(
        await replaceMediaRecord(id, {
          kind: "video",
          url: publicUrl,
        }),
      );

      setVideos((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item)),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel substituir o video selecionado.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openEditImagem(item: ImageItem) {
    setEditForm({
      id: item.id,
      kind: "image",
      titulo: item.titulo,
      categoria: item.categoria,
    });
    setEditOpen(true);
  }

  function openEditVideo(item: VideoItem) {
    setEditForm({
      id: item.id,
      kind: "video",
      titulo: item.titulo,
      categoria: item.categoria,
    });
    setEditOpen(true);
  }

  async function handleSaveEdit(event: React.FormEvent) {
    event.preventDefault();

    if (!editForm.id) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const updated = await updateMediaInfoRecord({
        id: editForm.id,
        kind: editForm.kind,
        title: editForm.titulo.trim(),
        category: editForm.categoria,
      });

      if (updated.kind === "image") {
        const mapped = mapImage(updated);
        setImagens((prev) =>
          prev.map((item) => (item.id === mapped.id ? mapped : item)),
        );
      } else {
        const mapped = mapVideo(updated);
        setVideos((prev) =>
          prev.map((item) => (item.id === mapped.id ? mapped : item)),
        );
      }

      setEditOpen(false);
      setEditForm(BLANK_EDIT);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar os dados da midia.",
      );
    } finally {
      setLoading(false);
    }
  }

  const addBtn = (
    <button
      type="button"
      className={styles.newBtn}
      onClick={() => (tab === "imagens" ? setAddImgOpen(true) : setAddVidOpen(true))}
      disabled={loading}
    >
      <Plus size={15} />
      {loading
        ? "Processando..."
        : tab === "imagens"
          ? "Adicionar Imagem"
          : "Adicionar Video"}
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Midia"
        subtitle="Envie fotos e videos reais do seu computador e troque o que aparece no site."
        actions={addBtn}
      />

      <section className={styles.guideCard}>
        <div className={styles.guideHeader}>
          <div>
            <h2 className={styles.guideTitle}>Midias da pagina inicial</h2>
            <p className={styles.guideText}>
              As categorias abaixo controlam o que aparece na home. A midia mais
              recente de cada categoria e a que fica ativa no site.
            </p>
          </div>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => void loadMedia()}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Atualizar
          </button>
        </div>

        <div className={styles.guideSection}>
          <h3 className={styles.guideSectionTitle}>Fotos da home</h3>
          <div className={styles.guideGrid}>
            {activeImages.map(({ slot, image }) => (
              <article key={slot.category} className={styles.guideItem}>
                <div className={styles.guideItemHeader}>
                  <span className={styles.guideItemTitle}>{slot.label}</span>
                  <span
                    className={`${styles.guideStatus} ${
                      image ? styles.guideStatusReady : styles.guideStatusPending
                    }`}
                  >
                    {image ? "Configurada" : "Pendente"}
                  </span>
                </div>
                <span className={styles.guideItemCategory}>{slot.category}</span>
                <p className={styles.guideItemText}>{slot.description}</p>
                <p className={styles.guideItemCurrent}>
                  {image ? `Ativa agora: ${image.titulo}` : "Nenhuma foto real enviada ainda."}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.guideSection}>
          <h3 className={styles.guideSectionTitle}>
            Videos da secao &quot;Veja como posso te ajudar&quot;
          </h3>
          <div className={styles.guideGrid}>
            {activeVideos.map(({ slot, video }) => (
              <article key={`video-${slot.category}`} className={styles.guideItem}>
                <div className={styles.guideItemHeader}>
                  <span className={styles.guideItemTitle}>{slot.title}</span>
                  <span
                    className={`${styles.guideStatus} ${
                      video ? styles.guideStatusReady : styles.guideStatusPending
                    }`}
                  >
                    {video ? "Configurado" : "Pendente"}
                  </span>
                </div>
                <span className={styles.guideItemCategory}>{slot.category}</span>
                <p className={styles.guideItemText}>{slot.description}</p>
                <p className={styles.guideItemCurrent}>
                  {video ? `Ativo agora: ${video.titulo}` : "Nenhum video enviado ainda."}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {errorMessage ? <div className={styles.noticeCard}>{errorMessage}</div> : null}

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "imagens" ? styles.tabActive : ""}`}
          onClick={() => { setTab("imagens"); setErrorMessage(""); }}
        >
          <ImageIcon size={15} />
          Imagens
          <span className={styles.tabCount}>{imagens.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "videos" ? styles.tabActive : ""}`}
          onClick={() => { setTab("videos"); setErrorMessage(""); }}
        >
          <Video size={15} />
          Videos
          <span className={styles.tabCount}>{videos.length}</span>
        </button>
      </div>

      {tab === "imagens" && (
        <div className={styles.grid}>
          {imagens.length === 0 ? (
            <div className={styles.emptyState}>
              Nenhuma imagem cadastrada ainda. Use o botao Adicionar Imagem para subir
              suas fotos reais.
            </div>
          ) : (
            imagens.map((img) => (
              <ImageCard
                key={img.id}
                img={img}
                active={Boolean(
                  activeImages.find(
                    ({ slot, image }) => slot.category === img.categoria && image?.id === img.id,
                  ),
                )}
                onDelete={handleDeleteImagem}
                onReplace={handleReplaceImagem}
                onEdit={openEditImagem}
              />
            ))
          )}
        </div>
      )}

      {tab === "videos" && (
        <div className={styles.grid}>
          {videos.length === 0 ? (
            <div className={styles.emptyState}>Nenhum video cadastrado ainda.</div>
          ) : (
            videos.map((vid) => (
              <VideoCard
                key={vid.id}
                vid={vid}
                active={Boolean(
                  activeVideos.find(
                    ({ slot, video }) => slot.category === vid.categoria && video?.id === vid.id,
                  ),
                )}
                onDelete={handleDeleteVideo}
                onReplace={handleReplaceVideo}
                onEdit={openEditVideo}
              />
            ))
          )}
        </div>
      )}

      <Modal
        isOpen={addImgOpen}
        onClose={() => {
          setAddImgOpen(false);
          setImgForm(BLANK_IMG);
        }}
        title="Adicionar Imagem"
        size="sm"
      >
        <form onSubmit={handleAddImagem}>
          <div className={styles.formStack}>
            <label>
              Titulo
              <input
                type="text"
                value={imgForm.titulo}
                onChange={(event) =>
                  setImgForm((current) => ({ ...current, titulo: event.target.value }))
                }
                placeholder="Ex: Foto principal da home"
                required
              />
            </label>
            <label>
              Categoria
              <select
                value={imgForm.categoria}
                onChange={(event) =>
                  setImgForm((current) => ({ ...current, categoria: event.target.value }))
                }
                required
              >
                <option value="">Selecionar...</option>
                {MARKETING_IMAGE_SLOTS.map((slot) => (
                  <option key={slot.category} value={slot.category}>
                    {slot.category} - {slot.label}
                  </option>
                ))}
              </select>
              <span className={styles.fieldHint}>
                Hero = topo da pagina, Sobre = apresentacao, Empresas = area corporativa.
              </span>
            </label>
            <label>
              Arquivo
              <div className={styles.fileRow}>
                <button
                  type="button"
                  className={styles.fileBtn}
                  onClick={() => imgInputRef.current?.click()}
                >
                  <ImageIcon size={14} />
                  {imgForm.file ? imgForm.file.name : "Selecionar imagem"}
                </button>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={(event) =>
                    setImgForm((current) => ({
                      ...current,
                      file: event.target.files?.[0] ?? null,
                    }))
                  }
                />
              </div>
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setAddImgOpen(false);
                setImgForm(BLANK_IMG);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              Salvar imagem
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditForm(BLANK_EDIT);
        }}
        title="Editar legenda"
        size="sm"
      >
        <form onSubmit={handleSaveEdit}>
          <div className={styles.formStack}>
            <label>
              Titulo
              <input
                type="text"
                value={editForm.titulo}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, titulo: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Categoria
              <select
                value={editForm.categoria}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, categoria: event.target.value }))
                }
                required
              >
                <option value="">Selecionar...</option>
                {(editForm.kind === "image"
                  ? MARKETING_IMAGE_SLOTS.map((slot) => slot.category)
                  : MARKETING_VIDEO_SLOTS.map((slot) => slot.category)
                ).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setEditOpen(false);
                setEditForm(BLANK_EDIT);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              Salvar alteracoes
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={addVidOpen}
        onClose={() => {
          setAddVidOpen(false);
          setVidForm(BLANK_VID);
        }}
        title="Adicionar Video"
        size="sm"
      >
        <form onSubmit={handleAddVideo}>
          <div className={styles.formStack}>
            <label>
              Titulo
              <input
                type="text"
                value={vidForm.titulo}
                onChange={(event) =>
                  setVidForm((current) => ({ ...current, titulo: event.target.value }))
                }
                placeholder="Ex: Video de apresentacao"
                required
              />
            </label>
            <label>
              Categoria
              <select
                value={vidForm.categoria}
                onChange={(event) =>
                  setVidForm((current) => ({ ...current, categoria: event.target.value }))
                }
                required
              >
                <option value="">Selecionar...</option>
                {MARKETING_VIDEO_SLOTS.map((slot) => (
                  <option key={slot.category} value={slot.category}>
                    {slot.category} - {slot.label}
                  </option>
                ))}
              </select>
              <span className={styles.fieldHint}>
                Sobre = video principal da secao de apresentacao. Empresas = video
                da secao corporativa.
              </span>
            </label>
            <label>
              Arquivo de video
              <div className={styles.fileRow}>
                <button
                  type="button"
                  className={styles.fileBtn}
                  onClick={() => vidInputRef.current?.click()}
                >
                  <Video size={14} />
                  {vidForm.file ? vidForm.file.name : "Selecionar video"}
                </button>
                <input
                  ref={vidInputRef}
                  type="file"
                  accept="video/*"
                  className={styles.hiddenInput}
                  onChange={(event) =>
                    setVidForm((current) => ({
                      ...current,
                      file: event.target.files?.[0] ?? null,
                    }))
                  }
                />
              </div>
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setAddVidOpen(false);
                setVidForm(BLANK_VID);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              Salvar video
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
