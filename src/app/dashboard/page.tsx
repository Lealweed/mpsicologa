"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  fetchDashboardApi,
  type DashboardAppointment,
  type DashboardFinanceEntry,
  type DashboardPatient,
} from "@/lib/dashboard-api";
import styles from "./page.module.css";

/* ── types ─────────────────────────────────────────────── */
type PacienteForm = {
  nome: string;
  email: string;
  whatsapp: string;
  telefone: string;
  endereco: string;
  sexo: string;
  idade: string;
  dataNascimento: string;
  cpf: string;
  numeroSus: string;
  convenio: string;
  plano: string;
  observacoes: string;
  portalEnabled: boolean;
  portalPassword: string;
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
type Session = {
  id: string;
  nome: string;
  tipo: string;
  data: string;
  hora: string;
  status: string;
  initials: string;
  canal: string;
};

const BLANK_P: PacienteForm = {
  nome: "",
  email: "",
  whatsapp: "",
  telefone: "",
  endereco: "",
  sexo: "",
  idade: "",
  dataNascimento: "",
  cpf: "",
  numeroSus: "",
  convenio: "",
  plano: "",
  observacoes: "",
  portalEnabled: false,
  portalPassword: "",
};

function buildInitials(nome: string) {
  return nome
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function mapAppointmentToSession(item: DashboardAppointment): Session {
  return {
    id: item.id,
    nome: item.paciente,
    tipo: item.tipo,
    data: item.data,
    hora: item.hora,
    status: item.status,
    initials: buildInitials(item.paciente),
    canal: item.canal,
  };
}
const BLANK_A: AgendaForm = {
  paciente: "",
  data: "",
  hora: "",
  tipo: "TCC Individual",
  canal: "video",
  status: "Pendente",
  observacoes: "",
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
  const [patientCount, setPatientCount] = useState(0);
  const [financeSummary, setFinanceSummary] = useState({
    total: 0,
    pending: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [pForm, setPForm] = useState<PacienteForm>(BLANK_P);
  const [aForm, setAForm] = useState<AgendaForm>(BLANK_A);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);

  const loadOverview = useCallback(async () => {
    try {
      setErrorMessage("");
      const [patients, appointments, finance] = await Promise.all([
        fetchDashboardApi<DashboardPatient[]>("/api/dashboard/patients"),
        fetchDashboardApi<DashboardAppointment[]>("/api/dashboard/appointments"),
        fetchDashboardApi<DashboardFinanceEntry[]>("/api/dashboard/finance"),
      ]);

      setPatientCount(patients.length);

      const mappedSessions = appointments.map(mapAppointmentToSession);
      mappedSessions.sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`));
      setSessions(mappedSessions);

      const total = finance.reduce((sum, item) => sum + item.valor, 0);
      const pending = finance
        .filter((item) => item.status !== "Pago")
        .reduce((sum, item) => sum + item.valor, 0);

      setFinanceSummary({ total, pending });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar o painel.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOverview();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadOverview]);

  const sessionChartData = useMemo(() => {
    const base = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((dia) => ({
      dia,
      sessoes: 0,
    }));

    sessions.forEach((session) => {
      const date = new Date(`${session.data}T00:00:00`);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const dayMap = [null, "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"] as const;
      const label = dayMap[date.getDay()];

      if (!label) {
        return;
      }

      const point = base.find((entry) => entry.dia === label);

      if (point) {
        point.sessoes += 1;
      }
    });

    return base;
  }, [sessions]);
  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();

    try {
      setErrorMessage("");
      await fetchDashboardApi<DashboardPatient>("/api/dashboard/patients", {
        method: "POST",
        body: JSON.stringify(pForm),
      });

      setPatientCount((prev) => prev + 1);
      setCadastrarOpen(false);
      setPForm(BLANK_P);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o paciente.",
      );
    }
  }

  async function handleNovoAgendamento(e: React.FormEvent) {
    e.preventDefault();

    try {
      setErrorMessage("");
      const created = await fetchDashboardApi<DashboardAppointment>("/api/dashboard/appointments", {
        method: "POST",
        body: JSON.stringify(aForm),
      });

      setSessions((prev) => {
        const next = [...prev, mapAppointmentToSession(created)];
        next.sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`));
        return next;
      });
      setAgendaOpen(false);
      setAForm(BLANK_A);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o agendamento.",
      );
    }
  }

  function updateP<K extends keyof PacienteForm>(k: K, v: PacienteForm[K]) {
    setPForm((p) => ({ ...p, [k]: v }));
  }
  function updateA<K extends keyof AgendaForm>(k: K, v: AgendaForm[K]) {
    setAForm((a) => ({ ...a, [k]: v }));
  }

  return (
    <div className={styles.page}>
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

      {errorMessage ? <p className={styles.date}>{errorMessage}</p> : null}

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
          <div className={styles.statValue}>{patientCount}</div>
          <p className={styles.statDesc}>
            {patientCount === 0 ? "Sem pacientes cadastrados ainda" : `${patientCount} cadastrado(s) nesta sessão`}
          </p>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Receita do Mês</span>
            <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
              <Wallet size={17} />
            </div>
          </div>
          <div className={styles.statValue}>R$&nbsp;{formatMoney(financeSummary.total)}</div>
          <p className={styles.statDesc}>
            {financeSummary.pending > 0
              ? `R$ ${formatMoney(financeSummary.pending)} a receber`
              : "Sem lançamentos financeiros"}
          </p>
        </div>
      </div>

      <div className={styles.bentoGrid}>
        <SessionsChart data={sessionChartData} />

        <section className={styles.sessionsPanel}>
          <div className={styles.sessionsPanelHeader}>
            <h2 className={styles.sessionsPanelTitle}>Próximas Sessões</h2>
            <span className={styles.sessionsBadge}>Hoje</span>
          </div>

          <div className={styles.sessionsList}>
            {sessions.length === 0 ? (
              <div className={styles.sessionsEmpty}>
                Nenhuma sessão cadastrada ainda.
              </div>
            ) : (
              sessions.map((ag, i) => (
                <div key={i} className={styles.sessionItem}>
                  <div className={styles.sessionAvatar}>{ag.initials}</div>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionName}>{ag.nome}</div>
                    <div className={styles.sessionType}>
                      {(ag.canal === "video"
                        ? "Vídeo"
                        : ag.canal === "presencial"
                          ? "Presencial"
                          : ag.canal === "telefone"
                            ? "Telefone"
                            : "WhatsApp") + ` · ${ag.tipo}`}
                    </div>
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

      <Modal
        isOpen={cadastrarOpen}
        onClose={() => {
          setCadastrarOpen(false);
          setPForm(BLANK_P);
        }}
        title="Cadastrar Paciente"
      >
        <form onSubmit={handleCadastrar}>
          <div className={styles.formGrid}>
            <label className={styles.formSpan2}>
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
              WhatsApp
              <input
                type="tel"
                value={pForm.whatsapp}
                onChange={(e) => updateP("whatsapp", e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </label>
            <label>
              Telefone adicional
              <input
                type="tel"
                value={pForm.telefone}
                onChange={(e) => updateP("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              Sexo
              <select value={pForm.sexo} onChange={(e) => updateP("sexo", e.target.value)}>
                <option value="">Selecionar...</option>
                <option>Feminino</option>
                <option>Masculino</option>
                <option>Não binário</option>
                <option>Prefere não informar</option>
              </select>
            </label>
            <label>
              Idade
              <input
                type="number"
                min="0"
                value={pForm.idade}
                onChange={(e) => updateP("idade", e.target.value)}
                placeholder="Ex: 34"
              />
            </label>
            <label>
              Data de nascimento
              <input
                type="date"
                value={pForm.dataNascimento}
                onChange={(e) => updateP("dataNascimento", e.target.value)}
              />
            </label>
            <label>
              CPF
              <input
                type="text"
                value={pForm.cpf}
                onChange={(e) => updateP("cpf", e.target.value)}
                placeholder="000.000.000-00"
              />
            </label>
            <label>
              Número do SUS
              <input
                type="text"
                value={pForm.numeroSus}
                onChange={(e) => updateP("numeroSus", e.target.value)}
                placeholder="000 0000 0000 0000"
              />
            </label>
            <label>
              Convênio
              <input
                type="text"
                value={pForm.convenio}
                onChange={(e) => updateP("convenio", e.target.value)}
                placeholder="Nome do convênio"
              />
            </label>
            <label>
              Serviço / Plano
              <select value={pForm.plano} onChange={(e) => updateP("plano", e.target.value)}>
                <option value="">Selecionar...</option>
                <option>TCC Individual</option>
                <option>Terapia de Casal</option>
                <option>Laudo Bariátrico</option>
                <option>Acompanhamento</option>
                <option>Convênio</option>
              </select>
            </label>
            <label className={styles.formSpan2} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <input
                type="checkbox"
                checked={pForm.portalEnabled}
                onChange={(e) => updateP("portalEnabled", e.target.checked)}
              />
              <span>Liberar acesso ao portal do paciente</span>
            </label>
            {pForm.portalEnabled ? (
              <>
                <label>
                  Senha do portal
                  <input
                    type="text"
                    value={pForm.portalPassword}
                    onChange={(e) => updateP("portalPassword", e.target.value)}
                    placeholder="Defina a senha do paciente"
                  />
                </label>
                <p className={styles.date} style={{ margin: 0, alignSelf: "end" }}>
                  O login será o CPF informado acima.
                </p>
              </>
            ) : null}
            <label className={styles.formSpan2}>
              Endereço
              <textarea
                value={pForm.endereco}
                onChange={(e) => updateP("endereco", e.target.value)}
                placeholder="Rua, número, bairro, cidade e CEP"
                rows={3}
              />
            </label>
            <label className={styles.formSpan2}>
              Observações
              <textarea
                value={pForm.observacoes}
                onChange={(e) => updateP("observacoes", e.target.value)}
                placeholder="Anotações iniciais, observações clínicas ou administrativas"
                rows={4}
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setCadastrarOpen(false);
                setPForm(BLANK_P);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Salvar paciente
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={agendaOpen}
        onClose={() => {
          setAgendaOpen(false);
          setAForm(BLANK_A);
        }}
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
              <select value={aForm.tipo} onChange={(e) => updateA("tipo", e.target.value)}>
                <option>TCC Individual</option>
                <option>Terapia de Casal</option>
                <option>Laudo Bariátrico</option>
                <option>Consultoria B2B</option>
                <option>Acompanhamento</option>
              </select>
            </label>
            <label>
              Canal
              <select value={aForm.canal} onChange={(e) => updateA("canal", e.target.value)}>
                <option value="video">Vídeo</option>
                <option value="presencial">Presencial</option>
                <option value="telefone">Telefone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <label>
              Status
              <select value={aForm.status} onChange={(e) => updateA("status", e.target.value)}>
                <option>Pendente</option>
                <option>Confirmado</option>
                <option>Remarcado</option>
              </select>
            </label>
            <label className={styles.formSpan2}>
              Observações
              <textarea
                value={aForm.observacoes}
                onChange={(e) => updateA("observacoes", e.target.value)}
                placeholder="Informações adicionais sobre a sessão"
                rows={3}
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setAgendaOpen(false);
                setAForm(BLANK_A);
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
