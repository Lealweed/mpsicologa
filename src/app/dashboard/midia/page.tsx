"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, RefreshCw, Play, ImageIcon, Video } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import styles from "./midia.module.css";

/* ── Types ── */
type Imagem = {
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
  duracao: string;
};

type Tab = "imagens" | "videos";

type AddImageForm = { titulo: string; categoria: string; file: File | null };
type AddVideoForm = { titulo: string; categoria: string; file: File | null };

/* ── Mock data ── */
const INITIAL_IMAGENS: Imagem[] = [];

const INITIAL_VIDEOS: VideoItem[] = [];

const BLANK_IMG: AddImageForm  = { titulo: "", categoria: "", file: null };
const BLANK_VID: AddVideoForm  = { titulo: "", categoria: "", file: null };

/* ── Image card ── */
function ImageCard({ img, onDelete, onReplace }: {
  img: Imagem;
  onDelete: (id: number) => void;
  onReplace: (id: number, url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onReplace(img.id, url);
  }

  return (
    <div className={styles.mediaCard}>
      <div className={styles.mediaThumb}>
        <img src={img.url} alt={img.titulo} className={styles.mediaImg} />
        <div className={styles.mediaOverlay}>
          <button className={styles.overlayBtn} onClick={() => inputRef.current?.click()} title="Substituir">
            <RefreshCw size={16} />
          </button>
          <button className={styles.overlayBtnDanger} onClick={() => onDelete(img.id)} title="Excluir">
            <Trash2 size={16} />
          </button>
        </div>
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

/* ── Video card ── */
function VideoCard({ vid, onDelete, onReplace }: {
  vid: VideoItem;
  onDelete: (id: number) => void;
  onReplace: (id: number, url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onReplace(vid.id, url);
  }

  return (
    <div className={styles.mediaCard}>
      <div className={styles.mediaThumb}>
        <img src={vid.thumb} alt={vid.titulo} className={styles.mediaImg} />
        <div className={styles.playOverlay}>
          <Play size={28} fill="#fff" color="#fff" />
        </div>
        <span className={styles.duracao}>{vid.duracao}</span>
        <div className={styles.mediaOverlay}>
          <button className={styles.overlayBtn} onClick={() => inputRef.current?.click()} title="Substituir">
            <RefreshCw size={16} />
          </button>
          <button className={styles.overlayBtnDanger} onClick={() => onDelete(vid.id)} title="Excluir">
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

/* ── Page ── */
export default function MidiaPage() {
  const [tab, setTab] = useState<Tab>("imagens");
  const [imagens, setImagens] = useState<Imagem[]>(INITIAL_IMAGENS);
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [addImgOpen, setAddImgOpen] = useState(false);
  const [addVidOpen, setAddVidOpen] = useState(false);
  const [imgForm, setImgForm] = useState<AddImageForm>(BLANK_IMG);
  const [vidForm, setVidForm] = useState<AddVideoForm>(BLANK_VID);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  /* Image actions */
  function handleAddImagem(e: React.FormEvent) {
    e.preventDefault();
    const url = imgForm.file
      ? URL.createObjectURL(imgForm.file)
      : `https://picsum.photos/600/450?random=${Date.now()}`;
    setImagens((prev) => [
      ...prev,
      { id: prev.length + 1, titulo: imgForm.titulo, categoria: imgForm.categoria, url },
    ]);
    setAddImgOpen(false);
    setImgForm(BLANK_IMG);
  }

  function handleDeleteImagem(id: number) {
    setImagens((prev) => prev.filter((i) => i.id !== id));
  }

  function handleReplaceImagem(id: number, url: string) {
    setImagens((prev) => prev.map((i) => (i.id === id ? { ...i, url } : i)));
  }

  /* Video actions */
  function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    const thumb = vidForm.file
      ? URL.createObjectURL(vidForm.file)
      : `https://picsum.photos/640/360?random=${Date.now()}`;
    setVideos((prev) => [
      ...prev,
      { id: prev.length + 1, titulo: vidForm.titulo, categoria: vidForm.categoria, thumb, duracao: "0:00" },
    ]);
    setAddVidOpen(false);
    setVidForm(BLANK_VID);
  }

  function handleDeleteVideo(id: number) {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  }

  function handleReplaceVideo(id: number, url: string) {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, thumb: url } : v)));
  }

  const addBtn = (
    <button
      className={styles.newBtn}
      onClick={() => (tab === "imagens" ? setAddImgOpen(true) : setAddVidOpen(true))}
    >
      <Plus size={15} />
      {tab === "imagens" ? "Adicionar Imagem" : "Adicionar Vídeo"}
    </button>
  );

  return (
    <div>
      <PageHeader title="Mídia" subtitle="Gerencie as imagens e vídeos do sistema" actions={addBtn} />

      {/* Tab switcher */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "imagens" ? styles.tabActive : ""}`}
          onClick={() => setTab("imagens")}
        >
          <ImageIcon size={15} />
          Imagens
          <span className={styles.tabCount}>{imagens.length}</span>
        </button>
        <button
          className={`${styles.tab} ${tab === "videos" ? styles.tabActive : ""}`}
          onClick={() => setTab("videos")}
        >
          <Video size={15} />
          Vídeos
          <span className={styles.tabCount}>{videos.length}</span>
        </button>
      </div>

      {/* Content */}
      {tab === "imagens" && (
        <div className={styles.grid}>
          {imagens.map((img) => (
            <ImageCard
              key={img.id}
              img={img}
              onDelete={handleDeleteImagem}
              onReplace={handleReplaceImagem}
            />
          ))}
        </div>
      )}

      {tab === "videos" && (
        <div className={styles.grid}>
          {videos.map((vid) => (
            <VideoCard
              key={vid.id}
              vid={vid}
              onDelete={handleDeleteVideo}
              onReplace={handleReplaceVideo}
            />
          ))}
        </div>
      )}

      {/* Modal: Adicionar Imagem */}
      <Modal
        isOpen={addImgOpen}
        onClose={() => { setAddImgOpen(false); setImgForm(BLANK_IMG); }}
        title="Adicionar Imagem"
        size="sm"
      >
        <form onSubmit={handleAddImagem}>
          <div className={styles.formStack}>
            <label>
              Título
              <input
                type="text"
                value={imgForm.titulo}
                onChange={(e) => setImgForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Banner principal"
                required
              />
            </label>
            <label>
              Categoria
              <select
                value={imgForm.categoria}
                onChange={(e) => setImgForm((f) => ({ ...f, categoria: e.target.value }))}
                required
              >
                <option value="">Selecionar...</option>
                <option>Perfil</option>
                <option>Marketing</option>
                <option>Serviços</option>
                <option>Sobre</option>
                <option>Depoimentos</option>
              </select>
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
                  onChange={(e) => setImgForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
                />
              </div>
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary}
              onClick={() => { setAddImgOpen(false); setImgForm(BLANK_IMG); }}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Adicionar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Adicionar Vídeo */}
      <Modal
        isOpen={addVidOpen}
        onClose={() => { setAddVidOpen(false); setVidForm(BLANK_VID); }}
        title="Adicionar Vídeo"
        size="sm"
      >
        <form onSubmit={handleAddVideo}>
          <div className={styles.formStack}>
            <label>
              Título
              <input
                type="text"
                value={vidForm.titulo}
                onChange={(e) => setVidForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Apresentação da clínica"
                required
              />
            </label>
            <label>
              Categoria
              <select
                value={vidForm.categoria}
                onChange={(e) => setVidForm((f) => ({ ...f, categoria: e.target.value }))}
                required
              >
                <option value="">Selecionar...</option>
                <option>Marketing</option>
                <option>Educativo</option>
                <option>Depoimentos</option>
              </select>
            </label>
            <label>
              Arquivo de vídeo
              <div className={styles.fileRow}>
                <button
                  type="button"
                  className={styles.fileBtn}
                  onClick={() => vidInputRef.current?.click()}
                >
                  <Video size={14} />
                  {vidForm.file ? vidForm.file.name : "Selecionar vídeo"}
                </button>
                <input
                  ref={vidInputRef}
                  type="file"
                  accept="video/*"
                  className={styles.hiddenInput}
                  onChange={(e) => setVidForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
                />
              </div>
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary}
              onClick={() => { setAddVidOpen(false); setVidForm(BLANK_VID); }}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Adicionar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
