"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Star, Trash2 } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import {
  fetchDashboardApi,
  type DashboardTestimonial,
  uploadDashboardFileToStorage,
} from "@/lib/dashboard-api";
import styles from "./depoimentos.module.css";

type TestimonialForm = {
  author: string;
  role: string;
  location: string;
  text: string;
  imageUrl: string;
  imageFile: File | null;
  rating: string;
  initials: string;
  active: boolean;
  order: string;
};

const BLANK_FORM: TestimonialForm = {
  author: "",
  role: "",
  location: "",
  text: "",
  imageUrl: "",
  imageFile: null,
  rating: "5",
  initials: "",
  active: true,
  order: "0",
};

function buildInitials(author: string) {
  return author
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function sortTestimonials(items: DashboardTestimonial[]) {
  return [...items].sort((a, b) => {
    const orderDiff = Number(a.order ?? 0) - Number(b.order ?? 0);
    return orderDiff !== 0 ? orderDiff : b.createdAt.localeCompare(a.createdAt);
  });
}

export default function DepoimentosPage() {
  const [testimonials, setTestimonials] = useState<DashboardTestimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(BLANK_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCount = useMemo(
    () => testimonials.filter((item) => item.active !== false).length,
    [testimonials],
  );

  const loadTestimonials = useCallback(async () => {
    try {
      setErrorMessage("");
      setLoading(true);
      const data = await fetchDashboardApi<DashboardTestimonial[]>("/api/dashboard/testimonials");
      setTestimonials(sortTestimonials(data));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar os depoimentos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTestimonials();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTestimonials]);

  function update<K extends keyof TestimonialForm>(key: K, value: TestimonialForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetModal() {
    setEditingId(null);
    setForm(BLANK_FORM);
    setModalOpen(false);
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...BLANK_FORM, order: String(testimonials.length) });
    setModalOpen(true);
  }

  function openEditModal(item: DashboardTestimonial) {
    setEditingId(item.id);
    setForm({
      author: item.author,
      role: item.role,
      location: item.location,
      text: item.text,
      imageUrl: item.imageUrl,
      imageFile: null,
      rating: String(item.rating ?? 5),
      initials: item.initials,
      active: item.active !== false,
      order: String(item.order ?? 0),
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      let imageUrl = form.imageUrl.trim();

      if (form.imageFile) {
        imageUrl = await uploadDashboardFileToStorage(form.imageFile, "image");
      }

      const payload = {
        author: form.author.trim(),
        role: form.role.trim(),
        location: form.location.trim(),
        text: form.text.trim(),
        imageUrl,
        rating: Number(form.rating || 5),
        initials: form.initials.trim() || buildInitials(form.author),
        active: form.active,
        order: Number(form.order || 0),
      };

      if (editingId) {
        const updated = await fetchDashboardApi<DashboardTestimonial>("/api/dashboard/testimonials", {
          method: "PUT",
          body: JSON.stringify({ id: editingId, ...payload }),
        });

        setTestimonials((prev) =>
          sortTestimonials(prev.map((item) => (item.id === updated.id ? updated : item))),
        );
      } else {
        const created = await fetchDashboardApi<DashboardTestimonial>("/api/dashboard/testimonials", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setTestimonials((prev) => sortTestimonials([created, ...prev]));
      }

      resetModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o depoimento.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deseja realmente excluir este depoimento?")) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await fetchDashboardApi(`/api/dashboard/testimonials?id=${id}`, {
        method: "DELETE",
      });
      setTestimonials((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível excluir o depoimento.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Depoimentos"
        subtitle={`${activeCount} publicado(s) na home · edite texto, imagem, ordem e visibilidade`}
        actions={
          <button
            type="button"
            className={styles.newBtn}
            onClick={openCreateModal}
            disabled={loading}
          >
            <Plus size={15} />
            Novo depoimento
          </button>
        }
      />

      {errorMessage ? <div className={styles.noticeCard}>{errorMessage}</div> : null}

      <div className={styles.grid}>
        {testimonials.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhum depoimento cadastrado ainda. Use o botão <strong>Novo depoimento</strong>{" "}
            para adicionar relatos reais e autorizados.
          </div>
        ) : (
          testimonials.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.authorRow}>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={`Foto de ${item.author}`}
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>{item.initials}</div>
                  )}
                  <div>
                    <div className={styles.authorName}>{item.author}</div>
                    <div className={styles.authorMeta}>
                      {[item.role, item.location].filter(Boolean).join(" • ") || "Sem subtítulo"}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.badges}>
                <span className={styles.badge}>Ordem {item.order}</span>
                <span className={styles.badgeMuted}>{item.rating} estrela(s)</span>
                <span className={item.active ? styles.badgeActive : styles.badgeInactive}>
                  {item.active ? "Publicado" : "Oculto"}
                </span>
              </div>

              <div className={styles.badges}>
                {Array.from({ length: item.rating || 5 }, (_, index) => (
                  <Star key={`${item.id}-star-${index}`} size={14} className={styles.starIcon} fill="currentColor" />
                ))}
              </div>

              <p className={styles.text}>{item.text}</p>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => openEditModal(item)}
                >
                  <Pencil size={14} />
                  Editar
                </button>
                <button
                  type="button"
                  className={styles.actionBtnDanger}
                  onClick={() => void handleDelete(item.id)}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={resetModal}
        title={editingId ? "Editar depoimento" : "Novo depoimento"}
        size="sm"
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label className={styles.formSpan2}>
              Nome / identificação
              <input
                type="text"
                value={form.author}
                onChange={(event) => update("author", event.target.value)}
                placeholder="Ex: A.M."
                required
              />
            </label>

            <label>
              Cargo / contexto
              <input
                type="text"
                value={form.role}
                onChange={(event) => update("role", event.target.value)}
                placeholder="Ex: Paciente em terapia"
              />
            </label>

            <label>
              Local / detalhe
              <input
                type="text"
                value={form.location}
                onChange={(event) => update("location", event.target.value)}
                placeholder="Ex: 34 anos, São Paulo"
              />
            </label>

            <label>
              Iniciais
              <input
                type="text"
                value={form.initials}
                onChange={(event) => update("initials", event.target.value.toUpperCase())}
                placeholder="Ex: AM"
                maxLength={4}
              />
            </label>

            <label>
              Ordem de exibição
              <input
                type="number"
                min="0"
                value={form.order}
                onChange={(event) => update("order", event.target.value)}
              />
            </label>

            <label>
              Nota
              <select
                value={form.rating}
                onChange={(event) => update("rating", event.target.value)}
              >
                <option value="5">5 estrelas</option>
                <option value="4">4 estrelas</option>
                <option value="3">3 estrelas</option>
                <option value="2">2 estrelas</option>
                <option value="1">1 estrela</option>
              </select>
            </label>

            <label className={styles.formSpan2}>
              <span className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => update("active", event.target.checked)}
                />
                Publicar este depoimento na home
              </span>
            </label>

            <label className={styles.formSpan2}>
              Depoimento
              <textarea
                value={form.text}
                onChange={(event) => update("text", event.target.value)}
                placeholder="Escreva o comentário completo aqui"
                rows={5}
                required
              />
            </label>

            <label className={styles.formSpan2}>
              URL da imagem (opcional)
              <input
                type="text"
                value={form.imageUrl}
                onChange={(event) => update("imageUrl", event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className={styles.formSpan2}>
              Foto do depoimento
              <div className={styles.uploadRow}>
                <button
                  type="button"
                  className={styles.fileBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={15} />
                  {form.imageFile ? "Trocar imagem" : "Selecionar imagem"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={(event) => update("imageFile", event.target.files?.[0] ?? null)}
                />

                {form.imageFile ? <span className={styles.fileName}>{form.imageFile.name}</span> : null}

                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Prévia do depoimento" className={styles.preview} />
                ) : null}
              </div>
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={resetModal}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Salvando..." : editingId ? "Salvar alterações" : "Criar depoimento"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}