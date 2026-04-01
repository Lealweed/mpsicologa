"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Video, Plus } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import {
  fetchDashboardApi,
  type DashboardAppointment,
} from "@/lib/dashboard-api";
import styles from "./agenda.module.css";

type Sessao = DashboardAppointment & {
  initials: string;
};

type AgendaForm = {
  paciente: string;
  data: string;
  hora: string;
  tipo: string;
  canal: string;
  status: string;
  observacoes: string;
};

const INITIAL: Sessao[] = [];

const BLANK: AgendaForm = {
  paciente: "",
  data: "",
  hora: "",
  tipo: "TCC Individual",
  canal: "video",
  status: "Pendente",
  observacoes: "",
};

function buildInitials(nome: string) {
  return nome
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function mapSessao(item: DashboardAppointment): Sessao {
  return {
    ...item,
    initials: buildInitials(item.paciente),
  };
}

const todayLabel = new Date().toLocaleDateString("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function AgendaPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>(INITIAL);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AgendaForm>(BLANK);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSessoes = useCallback(async () => {
    try {
      setErrorMessage("");
      const data = await fetchDashboardApi<DashboardAppointment[]>("/api/dashboard/appointments");
      setSessoes(data.map(mapSessao));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar a agenda.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSessoes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSessoes]);

  function update<K extends keyof AgendaForm>(k: K, v: AgendaForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setErrorMessage("");
      const created = await fetchDashboardApi<DashboardAppointment>("/api/dashboard/appointments", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setSessoes((prev) => {
        const next = [...prev, mapSessao(created)];
        next.sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`));
        return next;
      });
      setModalOpen(false);
      setForm(BLANK);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o agendamento.",
      );
    }
  }

  const newBtn = (
    <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
      <Plus size={15} />
      Novo Agendamento
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle={`Sessões organizadas para ${todayLabel}`}
        actions={newBtn}
      />

      {errorMessage ? <p className={styles.agendaTipo}>{errorMessage}</p> : null}

      <div className={styles.agendaCard}>
        {sessoes.length === 0 ? (
          <div className={styles.agendaItem}>
            <div className={styles.agendaInfo}>
              <div className={styles.agendaPaciente}>Nenhum agendamento cadastrado.</div>
              <div className={styles.agendaTipo}>Use o botão Novo Agendamento para começar.</div>
            </div>
          </div>
        ) : (
          sessoes.map((item) => (
            <div key={item.id} className={styles.agendaItem}>
              <div className={styles.agendaTime}>{item.hora}</div>
              <div className={styles.agendaAvatar}>{item.initials}</div>
              <div className={styles.agendaInfo}>
                <div className={styles.agendaPaciente}>{item.paciente}</div>
                <div className={styles.agendaTipo}>
                  <Video size={11} strokeWidth={2} />
                  {(item.canal === "video"
                    ? "Vídeo"
                    : item.canal === "presencial"
                      ? "Presencial"
                      : item.canal === "telefone"
                        ? "Telefone"
                        : "WhatsApp") + ` · ${item.tipo}`}
                </div>
              </div>
              <span
                className={`${styles.agendaStatus} ${
                  item.status === "Confirmado"
                    ? styles.statusConfirmado
                    : styles.statusPendente
                }`}
              >
                {item.status === "Confirmado" ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <Clock size={11} />
                )}
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm(BLANK);
        }}
        title="Novo Agendamento"
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <label className={styles.formSpan2}>
              Paciente
              <input
                type="text"
                value={form.paciente}
                onChange={(e) => update("paciente", e.target.value)}
                placeholder="Nome do paciente"
                required
              />
            </label>
            <label>
              Data
              <input
                type="date"
                value={form.data}
                onChange={(e) => update("data", e.target.value)}
                required
              />
            </label>
            <label>
              Hora
              <input
                type="time"
                value={form.hora}
                onChange={(e) => update("hora", e.target.value)}
                required
              />
            </label>
            <label>
              Tipo de sessão
              <select value={form.tipo} onChange={(e) => update("tipo", e.target.value)}>
                <option>TCC Individual</option>
                <option>Terapia de Casal</option>
                <option>Laudo Bariátrico</option>
                <option>Consultoria B2B</option>
                <option>Acompanhamento</option>
              </select>
            </label>
            <label>
              Canal
              <select value={form.canal} onChange={(e) => update("canal", e.target.value)}>
                <option value="video">Vídeo</option>
                <option value="presencial">Presencial</option>
                <option value="telefone">Telefone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option>Pendente</option>
                <option>Confirmado</option>
                <option>Remarcado</option>
              </select>
            </label>
            <label className={styles.formSpan2}>
              Observações
              <textarea
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                placeholder="Informações importantes sobre a sessão"
                rows={3}
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setModalOpen(false);
                setForm(BLANK);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Agendar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
