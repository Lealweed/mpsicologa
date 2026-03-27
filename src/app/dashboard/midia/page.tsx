"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, RefreshCw, Play, ImageIcon, Video } from "lucide-react";
import { supabase } from "../../../lib/supabase/client";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import styles from "./midia.module.css";
import {
  MARKETING_IMAGE_SLOTS,
  VIDEO_CATEGORIES,
  isSupabaseConfigured,
} from "@/lib/site-media";

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
  thumb: string;
};

type SiteMediaRecord = {
  id: number;
  titulo: string;
  categoria: string;
  url: string;
  type: "image" | "video";
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

const BLANK_IMG: AddImageForm = { titulo: "", categoria: "", file: null };
const BLANK_VID: AddVideoForm = { titulo: "", categoria: "", file: null };
const supabaseReady = isSupabaseConfigured(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function mapImage(record: SiteMediaRecord): ImageItem {
  return {
    id: record.id,
    titulo: record.titulo,
    categoria: record.categoria,
    url: record.url,
  };
}

function mapVideo(record: SiteMediaRecord): VideoItem {
  return {
    id: record.id,
    titulo: record.titulo,
    categoria: record.categoria,
    thumb: record.url,
  };
}

function extractStoragePath(publicUrl: string) {
  const marker = "/public_media/";
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return publicUrl.slice(markerIndex + marker.length);
}

async function uploadPublicMedia(file: File) {
  const sanitizedName = file.name.replace(/\s+/g, "_");
  const fileName = `${Date.now()}_${sanitizedName}`;
  const { error } = await supabase.storage
    .from("public_media")
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  return supabase.storage.from("public_media").getPublicUrl(fileName).data.publicUrl;
}

function ImageCard({
  img,
  active,
  onDelete,
  onReplace,
}: {
  img: ImageItem;
  active: boolean;
  onDelete: (id: number) => void;
  onReplace: (id: number, file: File) => void;
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
  onDelete,
  onReplace,
}: {
  vid: VideoItem;
  onDelete: (id: number) => void;
  onReplace: (id: number, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

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
        <img src={vid.thumb} alt={vid.titulo} className={styles.mediaImg} />
        <div className={styles.playOverlay}>
          <Play size={28} fill="#fff" color="#fff" />
        </div>
        <div className={styles.mediaOverlay}>
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
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  const activeImages = MARKETING_IMAGE_SLOTS.map((slot) => ({
    slot,
    image: imagens.find((img) => img.categoria === slot.category) ?? null,
  }));

  async function loadMedia() {
    if (!supabaseReady) {
      setErrorMessage(
        "Configure o Supabase para enviar imagens reais do seu computador pelo painel.",
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("site_media")
      .select("id, titulo, categoria, url, type")
      .order("id", { ascending: false });

    if (error) {
      setErrorMessage("Nao foi possivel carregar a biblioteca de midia.");
      setLoading(false);
      return;
    }

    const media = (data ?? []) as SiteMediaRecord[];
    setImagens(media.filter((item) => item.type === "image").map(mapImage));
    setVideos(media.filter((item) => item.type === "video").map(mapVideo));
    setLoading(false);
  }

  useEffect(() => {
    void loadMedia();
  }, []);

  async function handleAddImagem(event: React.FormEvent) {
    event.preventDefault();

    if (!imgForm.file || !supabaseReady) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const url = await uploadPublicMedia(imgForm.file);
      const { data, error } = await supabase
        .from("site_media")
        .insert([
          {
            titulo: imgForm.titulo.trim(),
            categoria: imgForm.categoria,
            url,
            type: "image",
          },
        ])
        .select("id, titulo, categoria, url")
        .single();

      if (error || !data) {
        throw error ?? new Error("Falha ao salvar a imagem.");
      }

      setImagens((prev) => [mapImage({ ...data, type: "image" }), ...prev]);
      setAddImgOpen(false);
      setImgForm(BLANK_IMG);
    } catch {
      setErrorMessage("Nao foi possivel enviar a imagem selecionada.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteImagem(id: number) {
    const image = imagens.find((item) => item.id === id);

    if (!image || !supabaseReady) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.from("site_media").delete().eq("id", id);

      if (error) {
        throw error;
      }

      const storagePath = extractStoragePath(image.url);

      if (storagePath) {
        await supabase.storage.from("public_media").remove([storagePath]);
      }

      setImagens((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setErrorMessage("Nao foi possivel excluir essa imagem agora.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReplaceImagem(id: number, file: File) {
    const currentImage = imagens.find((item) => item.id === id);

    if (!currentImage || !supabaseReady) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const url = await uploadPublicMedia(file);
      const { error } = await supabase.from("site_media").update({ url }).eq("id", id);

      if (error) {
        throw error;
      }

      const previousPath = extractStoragePath(currentImage.url);

      if (previousPath) {
        await supabase.storage.from("public_media").remove([previousPath]);
      }

      setImagens((prev) =>
        prev.map((item) => (item.id === id ? { ...item, url } : item)),
      );
    } catch {
      setErrorMessage("Nao foi possivel substituir a imagem selecionada.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddVideo(event: React.FormEvent) {
    event.preventDefault();

    if (!vidForm.file || !supabaseReady) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const url = await uploadPublicMedia(vidForm.file);
      const { data, error } = await supabase
        .from("site_media")
        .insert([
          {
            titulo: vidForm.titulo.trim(),
            categoria: vidForm.categoria,
            url,
            type: "video",
          },
        ])
        .select("id, titulo, categoria, url")
        .single();

      if (error || !data) {
        throw error ?? new Error("Falha ao salvar o video.");
      }

      setVideos((prev) => [mapVideo({ ...data, type: "video" }), ...prev]);
      setAddVidOpen(false);
      setVidForm(BLANK_VID);
    } catch {
      setErrorMessage("Nao foi possivel enviar o video selecionado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteVideo(id: number) {
    const currentVideo = videos.find((item) => item.id === id);

    if (!currentVideo || !supabaseReady) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.from("site_media").delete().eq("id", id);

      if (error) {
        throw error;
      }

      const storagePath = extractStoragePath(currentVideo.thumb);

      if (storagePath) {
        await supabase.storage.from("public_media").remove([storagePath]);
      }

      setVideos((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setErrorMessage("Nao foi possivel excluir esse video agora.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReplaceVideo(id: number, file: File) {
    const currentVideo = videos.find((item) => item.id === id);

    if (!currentVideo || !supabaseReady) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const url = await uploadPublicMedia(file);
      const { error } = await supabase.from("site_media").update({ url }).eq("id", id);

      if (error) {
        throw error;
      }

      const previousPath = extractStoragePath(currentVideo.thumb);

      if (previousPath) {
        await supabase.storage.from("public_media").remove([previousPath]);
      }

      setVideos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, thumb: url } : item)),
      );
    } catch {
      setErrorMessage("Nao foi possivel substituir o video selecionado.");
    } finally {
      setLoading(false);
    }
  }

  const addBtn = (
    <button
      type="button"
      className={styles.newBtn}
      onClick={() => (tab === "imagens" ? setAddImgOpen(true) : setAddVidOpen(true))}
      disabled={!supabaseReady || loading}
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
        subtitle="Envie imagens reais do seu computador e troque o que aparece no site."
        actions={addBtn}
      />

      <section className={styles.guideCard}>
        <div className={styles.guideHeader}>
          <div>
            <h2 className={styles.guideTitle}>Fotos reais da pagina inicial</h2>
            <p className={styles.guideText}>
              Para remover os mockups, envie suas fotos usando as categorias abaixo.
              A imagem mais recente de cada categoria e a que aparece na home.
            </p>
          </div>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => void loadMedia()}
            disabled={!supabaseReady || loading}
          >
            <RefreshCw size={15} />
            Atualizar
          </button>
        </div>

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
      </section>

      {errorMessage ? <div className={styles.noticeCard}>{errorMessage}</div> : null}

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "imagens" ? styles.tabActive : ""}`}
          onClick={() => setTab("imagens")}
        >
          <ImageIcon size={15} />
          Imagens
          <span className={styles.tabCount}>{imagens.length}</span>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "videos" ? styles.tabActive : ""}`}
          onClick={() => setTab("videos")}
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
              />
            ))
          )}
        </div>
      )}

      {tab === "videos" && (
        <div className={styles.grid}>
          {videos.length === 0 ? (
            <div className={styles.emptyState}>
              Nenhum video cadastrado ainda.
            </div>
          ) : (
            videos.map((vid) => (
              <VideoCard
                key={vid.id}
                vid={vid}
                onDelete={handleDeleteVideo}
                onReplace={handleReplaceVideo}
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
                {VIDEO_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
