"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Megaphone, Pencil, Plus, Trash2, Upload } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import {
  fetchDashboardApi,
  type DashboardPatient,
  type DashboardPortalAnnouncement,
  type DashboardPortalDocument,
  uploadDashboardFileToStorage,
} from "@/lib/dashboard-api";
import styles from "./portal.module.css";

type DocumentForm = {
  paciente: string;
  patientId: string;
  patientCpf: string;
  title: string;
  type: string;
  url: string;
  active: boolean;
  file: File | null;
};

type MuralForm = {
  title: string;
  body: string;
  active: boolean;
};

const BLANK_DOCUMENT: DocumentForm = {
  paciente: "",
  patientId: "",
  patientCpf: "",
  title: "",
  type: "Laudo",
  url: "",
  active: true,
  file: null,
};

const BLANK_MURAL: MuralForm = {
  title: "",
  body: "",
  active: true,
};

function sortDocuments(items: DashboardPortalDocument[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function sortAnnouncements(items: DashboardPortalAnnouncement[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default function DashboardPortalPage() {
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [documents, setDocuments] = useState<DashboardPortalDocument[]>([]);
  const [announcements, setAnnouncements] = useState<DashboardPortalAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [muralModalOpen, setMuralModalOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [documentForm, setDocumentForm] = useState<DocumentForm>(BLANK_DOCUMENT);
  const [muralForm, setMuralForm] = useState<MuralForm>(BLANK_MURAL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDocuments = useMemo(
    () => documents.filter((item) => item.active !== false).length,
    [documents],
  );
  const activeAnnouncements = useMemo(
    () => announcements.filter((item) => item.active !== false).length,
    [announcements],
  );

  const loadContent = useCallback(async () => {
    try {
      setErrorMessage("");
      setLoading(true);

      const [patientsData, documentsData, announcementsData] = await Promise.all([
        fetchDashboardApi<DashboardPatient[]>("/api/dashboard/patients"),
        fetchDashboardApi<DashboardPortalDocument[]>("/api/dashboard/portal-documents"),
        fetchDashboardApi<DashboardPortalAnnouncement[]>("/api/dashboard/portal-mural"),
      ]);

      setPatients(patientsData);
      setDocuments(sortDocuments(documentsData));
      setAnnouncements(sortAnnouncements(announcementsData));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar o conteúdo do portal.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadContent();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadContent]);

  function updateDocumentForm<K extends keyof DocumentForm>(key: K, value: DocumentForm[K]) {
    setDocumentForm((current) => ({ ...current, [key]: value }));
  }

  function updateMuralForm<K extends keyof MuralForm>(key: K, value: MuralForm[K]) {
    setMuralForm((current) => ({ ...current, [key]: value }));
  }

  function resetDocumentModal() {
    setEditingDocumentId(null);
    setDocumentForm(BLANK_DOCUMENT);
    setDocumentModalOpen(false);
  }

  function resetMuralModal() {
    setEditingAnnouncementId(null);
    setMuralForm(BLANK_MURAL);
    setMuralModalOpen(false);
  }

  function openCreateDocumentModal() {
    setEditingDocumentId(null);
    setDocumentForm(BLANK_DOCUMENT);
    setDocumentModalOpen(true);
  }

  function openCreateMuralModal() {
    setEditingAnnouncementId(null);
    setMuralForm(BLANK_MURAL);
    setMuralModalOpen(true);
  }

  function openEditDocumentModal(item: DashboardPortalDocument) {
    setEditingDocumentId(item.id);
    setDocumentForm({
      paciente: item.paciente,
      patientId: item.patientId || "",
      patientCpf: item.patientCpf || "",
      title: item.title,
      type: item.type,
      url: item.url,
      active: item.active !== false,
      file: null,
    });
    setDocumentModalOpen(true);
  }

  function openEditMuralModal(item: DashboardPortalAnnouncement) {
    setEditingAnnouncementId(item.id);
    setMuralForm({
      title: item.title,
      body: item.body,
      active: item.active !== false,
    });
    setMuralModalOpen(true);
  }

  function handlePatientChange(patientId: string) {
    const selectedPatient = patients.find((item) => item.id === patientId);

    setDocumentForm((current) => ({
      ...current,
      patientId,
      patientCpf: selectedPatient?.cpf || "",
      paciente: selectedPatient?.nome || "",
    }));
  }

  async function handleSaveDocument(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      let documentUrl = documentForm.url.trim();

      if (documentForm.file) {
        documentUrl = await uploadDashboardFileToStorage(documentForm.file, "document");
      }

      const payload = {
        paciente: documentForm.paciente,
        patientId: documentForm.patientId,
        patientCpf: documentForm.patientCpf,
        title: documentForm.title.trim(),
        type: documentForm.type,
        url: documentUrl,
        active: documentForm.active,
      };

      if (editingDocumentId) {
        const updated = await fetchDashboardApi<DashboardPortalDocument>(
          "/api/dashboard/portal-documents",
          {
            method: "PUT",
            body: JSON.stringify({ id: editingDocumentId, ...payload }),
          },
        );

        setDocuments((current) =>
          sortDocuments(current.map((item) => (item.id === updated.id ? updated : item))),
        );
      } else {
        const created = await fetchDashboardApi<DashboardPortalDocument>(
          "/api/dashboard/portal-documents",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

        setDocuments((current) => sortDocuments([created, ...current]));
      }

      resetDocumentModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o documento do portal.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMural(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      const payload = {
        title: muralForm.title.trim(),
        body: muralForm.body.trim(),
        active: muralForm.active,
        audience: "portal" as const,
      };

      if (editingAnnouncementId) {
        const updated = await fetchDashboardApi<DashboardPortalAnnouncement>(
          "/api/dashboard/portal-mural",
          {
            method: "PUT",
            body: JSON.stringify({ id: editingAnnouncementId, ...payload }),
          },
        );

        setAnnouncements((current) =>
          sortAnnouncements(current.map((item) => (item.id === updated.id ? updated : item))),
        );
      } else {
        const created = await fetchDashboardApi<DashboardPortalAnnouncement>(
          "/api/dashboard/portal-mural",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

        setAnnouncements((current) => sortAnnouncements([created, ...current]));
      }

      resetMuralModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível publicar o aviso no mural.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDocument(id: string) {
    if (!window.confirm("Deseja realmente excluir este documento do portal?")) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await fetchDashboardApi(`/api/dashboard/portal-documents?id=${id}`, {
        method: "DELETE",
      });
      setDocuments((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível excluir o documento do portal.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!window.confirm("Deseja realmente excluir este aviso do mural?")) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await fetchDashboardApi(`/api/dashboard/portal-mural?id=${id}`, {
        method: "DELETE",
      });
      setAnnouncements((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível excluir o aviso do mural.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Portal do Paciente"
        subtitle={`${activeAnnouncements} aviso(s) no mural · ${activeDocuments} documento(s) ativo(s) no portal`}
        actions={
          <div className={styles.actionsRow}>
            <button type="button" className={styles.secondaryBtn} onClick={openCreateMuralModal}>
              <Megaphone size={15} />
              Novo aviso
            </button>
            <button type="button" className={styles.newBtn} onClick={openCreateDocumentModal}>
              <Plus size={15} />
              Novo documento
            </button>
          </div>
        }
      />

      {errorMessage ? <div className={styles.noticeCard}>{errorMessage}</div> : null}

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Pacientes com acesso</span>
          <strong className={styles.summaryValue}>
            {patients.filter((item) => item.portalEnabled).length}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Documentos no portal</span>
          <strong className={styles.summaryValue}>{activeDocuments}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Avisos publicados</span>
          <strong className={styles.summaryValue}>{activeAnnouncements}</strong>
        </article>
      </div>

      <div className={styles.columns}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Mural do paciente</h2>
              <p>Publique recados, orientações e lembretes exibidos no portal.</p>
            </div>
          </div>

          <div className={styles.grid}>
            {announcements.length === 0 ? (
              <div className={styles.emptyState}>
                Nenhum aviso publicado ainda. Use <strong>Novo aviso</strong> para alimentar o mural.
              </div>
            ) : (
              announcements.map((item) => (
                <article key={item.id} className={styles.card}>
                  <div className={styles.badges}>
                    <span className={item.active ? styles.badgeActive : styles.badgeInactive}>
                      {item.active ? "Publicado" : "Oculto"}
                    </span>
                    <span className={styles.badgeMuted}>Portal</span>
                  </div>

                  <div className={styles.cardTitle}>{item.title}</div>
                  <p className={styles.cardText}>{item.body}</p>

                  <div className={styles.actions}>
                    <button type="button" className={styles.actionBtn} onClick={() => openEditMuralModal(item)}>
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtnDanger}
                      onClick={() => void handleDeleteAnnouncement(item.id)}
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Documentos e laudos</h2>
              <p>Anexe PDFs, recibos, encaminhamentos e laudos direto para o paciente.</p>
            </div>
          </div>

          <div className={styles.grid}>
            {documents.length === 0 ? (
              <div className={styles.emptyState}>
                Nenhum documento publicado ainda. Adicione arquivos para os pacientes acessarem no portal.
              </div>
            ) : (
              documents.map((item) => (
                <article key={item.id} className={styles.card}>
                  <div className={styles.badges}>
                    <span className={styles.badge}>{item.type}</span>
                    <span className={item.active ? styles.badgeActive : styles.badgeInactive}>
                      {item.active ? "Disponível" : "Oculto"}
                    </span>
                  </div>

                  <div className={styles.cardTitle}>{item.title}</div>
                  <div className={styles.patientName}>{item.paciente}</div>
                  <a className={styles.link} href={item.url} target="_blank" rel="noreferrer">
                    Abrir arquivo
                  </a>

                  <div className={styles.actions}>
                    <button type="button" className={styles.actionBtn} onClick={() => openEditDocumentModal(item)}>
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtnDanger}
                      onClick={() => void handleDeleteDocument(item.id)}
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={muralModalOpen}
        onClose={resetMuralModal}
        title={editingAnnouncementId ? "Editar aviso" : "Novo aviso do mural"}
        size="sm"
      >
        <form onSubmit={handleSaveMural}>
          <div className={styles.formGrid}>
            <label className={styles.formSpan2}>
              Título do aviso
              <input
                type="text"
                value={muralForm.title}
                onChange={(event) => updateMuralForm("title", event.target.value)}
                placeholder="Ex: Lembrete sobre reagendamento"
                required
              />
            </label>

            <label className={styles.formSpan2}>
              Mensagem
              <textarea
                rows={5}
                value={muralForm.body}
                onChange={(event) => updateMuralForm("body", event.target.value)}
                placeholder="Digite a orientação que aparecerá para os pacientes no portal"
                required
              />
            </label>

            <label className={styles.formSpan2}>
              <span className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={muralForm.active}
                  onChange={(event) => updateMuralForm("active", event.target.checked)}
                />
                Publicar este aviso no mural
              </span>
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={resetMuralModal}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {editingAnnouncementId ? "Salvar aviso" : "Publicar aviso"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={documentModalOpen}
        onClose={resetDocumentModal}
        title={editingDocumentId ? "Editar documento" : "Novo documento do paciente"}
        size="sm"
      >
        <form onSubmit={handleSaveDocument}>
          <div className={styles.formGrid}>
            <label className={styles.formSpan2}>
              Paciente
              <select
                value={documentForm.patientId}
                onChange={(event) => handlePatientChange(event.target.value)}
                required
              >
                <option value="">Selecione o paciente...</option>
                {patients
                  .filter((item) => item.portalEnabled)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Tipo do documento
              <select
                value={documentForm.type}
                onChange={(event) => updateDocumentForm("type", event.target.value)}
              >
                <option>Laudo</option>
                <option>Recibo</option>
                <option>Encaminhamento</option>
                <option>Orientação</option>
                <option>Documento</option>
              </select>
            </label>

            <label>
              Título
              <input
                type="text"
                value={documentForm.title}
                onChange={(event) => updateDocumentForm("title", event.target.value)}
                placeholder="Ex: Laudo psicológico - abril"
                required
              />
            </label>

            <label className={styles.formSpan2}>
              <span className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={documentForm.active}
                  onChange={(event) => updateDocumentForm("active", event.target.checked)}
                />
                Disponibilizar este documento no portal
              </span>
            </label>

            <label className={styles.formSpan2}>
              URL do arquivo (opcional)
              <input
                type="text"
                value={documentForm.url}
                onChange={(event) => updateDocumentForm("url", event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className={styles.formSpan2}>
              Arquivo PDF ou imagem
              <div className={styles.uploadRow}>
                <button
                  type="button"
                  className={styles.fileBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={15} />
                  {documentForm.file ? "Trocar arquivo" : "Selecionar arquivo"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*,application/pdf"
                  className={styles.hiddenInput}
                  onChange={(event) => updateDocumentForm("file", event.target.files?.[0] ?? null)}
                />

                {documentForm.file ? <span className={styles.fileName}>{documentForm.file.name}</span> : null}
              </div>
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={resetDocumentModal}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {editingDocumentId ? "Salvar documento" : "Publicar documento"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
