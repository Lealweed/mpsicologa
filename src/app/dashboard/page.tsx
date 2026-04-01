"use client";

import React, { useState } from "react";
import { useUser } from "../_components/UserContext";
import {
  CalendarDays,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  UserPlus,
  Plus,
} from "lucide-react";
import Modal from "./_components/Modal";
import SessionsChart from "./_components/SessionsChart";
import styles from "./page.module.css";

/* ── types ─────────────────────────────────────────────── */
type PacienteForm = {
  nome: string;
  email: string;
  telefone: string;
  plano: string;
};
type AgendaForm = {
  paciente: string;
  data: string;
  hora: string;
  tipo: string;
  canal: string;
};
type Session = {
  nome: string;
  tipo: string;
  hora: string;
  status: string;
  initials: string;
};

const BLANK_P: PacienteForm = { nome: "", email: "", telefone: "", plano: "" };
const BLANK_A: AgendaForm = {
  paciente: "",
  data: "",
  hora: "",
  tipo: "TCC Online",
  canal: "video",
};

const INITIAL_SESSIONS: Session[] = [];

const todayLabel = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/* ── component ──────────────────────────────────────────── */
export default function DashboardOverview() {
  const { user } = useUser();
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ?? "Dra. Mayara";

  const [cadastrarOpen, setCadastrarOpen] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [pForm, setPForm] = useState<PacienteForm>(BLANK_P);
  const [aForm, setAForm] = useState<AgendaForm>(BLANK_A);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);

  function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    setCadastrarOpen(false);
    setPForm(BLANK_P);
  }

  function handleNovoAgendamento(e: React.FormEvent) {
    e.preventDefault();
    const initials = aForm.paciente
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    setSessions((prev) => [
      ...prev,
      { nome: aForm.paciente, tipo: aForm.tipo, hora: aForm.hora, status: "Pendente", initials },
    ]);
    setAgendaOpen(false);
    setAForm(BLANK_A);
  }

  function updateP<K extends keyof PacienteForm>(k: K, v: PacienteForm[K]) {
    setPForm((p) => ({ ...p, [k]: v }));
  }
  function updateA<K extends keyof AgendaForm>(k: K, v: AgendaForm[K]) {
    setAForm((a) => ({ ...a, [k]: v }));
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Olá, {firstName} 👋</h1>
          <p className={styles.date} style={{ textTransform: "capitalize" }}>
            {todayLabel}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            onClick={() => setCadastrarOpen(true)}
          >
            <UserPlus size={15} />
            Cadastrar Paciente
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => setAgendaOpen(true)}
          >
            <Plus size={15} />
            Novo Agendamento
          </button>
        </div>
      </header>

      {/* ── Stat cards ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Consultas Hoje</span>
            <div className={`${styles.statIcon} ${styles.statIconPrimary}`}>
              <CalendarDays size={17} />
            </div>
          </div>
          <div className={styles.statValue}>{sessions.length}</div>
          <p className={styles.statDesc}>
            {sessions.length === 0 ? "Sem consultas cadastradas" : `${sessions.length} agendadas`}
          </p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Pacientes Ativos</span>
            <div className={`${styles.statIcon} ${styles.statIconAccent}`}>
              <Users size={17} />
            </div>
          </div>
          <div className={styles.statValue}>0</div>
          <p className={styles.statDesc}>Sem pacientes cadastrados ainda</p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Receita do Mês</span>
            <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
              <Wallet size={17} />
            </div>
          </div>
          <div className={styles.statValue}>R$&nbsp;0,00</div>
          <p className={styles.statDesc}>Sem lancamentos financeiros</p>
        </div>
      </div>

      {/* ── Bento: chart + sessions ── */}
      <div className={styles.bentoGrid}>
        <SessionsChart />

        <section className={styles.sessionsPanel}>
          <div className={styles.sessionsPanelHeader}>
            <h2 className={styles.sessionsPanelTitle}>Próximas Sessões</h2>
            <span className={styles.sessionsBadge}>Hoje</span>
          </div>

          <div className={styles.sessionsList}>
            {sessions.length === 0 ? (
              <div className={styles.sessionsEmpty}>
                Nenhuma sessao cadastrada ainda.
              </div>
            ) : (
              sessions.map((ag, i) => (
                <div key={i} className={styles.sessionItem}>
                  <div className={styles.sessionAvatar}>{ag.initials}</div>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionName}>{ag.nome}</div>
                    <div className={styles.sessionType}>{ag.tipo}</div>
                  </div>
                  <div className={styles.sessionMeta}>
                    <div className={styles.sessionTime}>{ag.hora || "—"}</div>
                    <span
                      className={`${styles.sessionStatus} ${
                        ag.status === "Confirmado"
                          ? styles.statusConfirmado
                          : styles.statusPendente
                      }`}
                    >
                      {ag.status === "Confirmado" ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                      {ag.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Modal: Cadastrar Paciente ── */}
      <Modal
        isOpen={cadastrarOpen}
        onClose={() => { setCadastrarOpen(false); setPForm(BLANK_P); }}
        title="Cadastrar Paciente"
      >
        <form onSubmit={handleCadastrar}>
          <div className={styles.formGrid}>
            <label>
              Nome completo
              <input
                type="text"
                value={pForm.nome}
                onChange={(e) => updateP("nome", e.target.value)}
                placeholder="Nome e sobrenome"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={pForm.email}
                onChange={(e) => updateP("email", e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </label>
            <label>
              Telefone
              <input
                type="tel"
                value={pForm.telefone}
                onChange={(e) => updateP("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              Plano
              <select
                value={pForm.plano}
                onChange={(e) => updateP("plano", e.target.value)}
              >
                <option value="">Selecionar...</option>
                <option>TCC Mensal</option>
                <option>Bariátrico</option>
                <option>Acompanhamento</option>
              </select>
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => { setCadastrarOpen(false); setPForm(BLANK_P); }}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Novo Agendamento ── */}
      <Modal
        isOpen={agendaOpen}
        onClose={() => { setAgendaOpen(false); setAForm(BLANK_A); }}
        title="Novo Agendamento"
      >
        <form onSubmit={handleNovoAgendamento}>
          <div className={styles.formGrid}>
            <label className={styles.formSpan2}>
              Paciente
              <input
                type="text"
                value={aForm.paciente}
                onChange={(e) => updateA("paciente", e.target.value)}
                placeholder="Nome do paciente"
                required
              />
            </label>
            <label>
              Data
              <input
                type="date"
                value={aForm.data}
                onChange={(e) => updateA("data", e.target.value)}
                required
              />
            </label>
            <label>
              Hora
              <input
                type="time"
                value={aForm.hora}
                onChange={(e) => updateA("hora", e.target.value)}
                required
              />
            </label>
            <label>
              Tipo de sessão
              <select
                value={aForm.tipo}
                onChange={(e) => updateA("tipo", e.target.value)}
              >
                <option>TCC Online</option>
                <option>Laudo Bariátrico</option>
                <option>Consultoria B2B</option>
                <option>Acompanhamento</option>
              </select>
            </label>
            <label>
              Canal
              <select
                value={aForm.canal}
                onChange={(e) => updateA("canal", e.target.value)}
              >
                <option value="video">Vídeo</option>
                <option value="presencial">Presencial</option>
              </select>
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => { setAgendaOpen(false); setAForm(BLANK_A); }}
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
