"use client";

import React, { useEffect, useState } from "react";
import styles from "./portal.module.css";

type PortalLoginPatient = {
  id: string;
  name: string;
  plan: string;
  cpfMasked: string;
  whatsapp: string;
  email: string;
};

type PortalProfile = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  telefone: string;
  endereco: string;
  sexo: string;
  idade: string;
  dataNascimento: string;
  numeroSus: string;
  cpf: string;
  convenio: string;
  plano: string;
  observacoes: string;
};

type NextSession = {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  professional: string;
  location: string;
  notes: string;
};

type HistoryItem = {
  id: string;
  date: string;
  time: string;
  title: string;
  status: string;
  description: string;
};

type FinanceItem = {
  id: string;
  description: string;
  due_date: string;
  status: string;
  value: number;
  payment_method: string;
  notes: string;
};

type PortalDocument = {
  id: string;
  title: string;
  type: string;
  url: string;
};

type MuralItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

function maskCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

function persistSessionToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    sessionStorage.setItem("patient_portal_token", token);
  } else {
    sessionStorage.removeItem("patient_portal_token");
  }
}

function getSessionToken() {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("patient_portal_token");
  }

  return null;
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function fetchPortalResource<T>(path: string, token: string) {
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error ?? "Falha ao carregar os dados do portal.")
        : "Falha ao carregar os dados do portal.";

    throw new Error(message);
  }

  return (data ?? null) as T;
}

const TABS = [
  { key: "inicio", label: "Início" },
  { key: "proximos", label: "Próximos" },
  { key: "historico", label: "Histórico" },
  { key: "financeiro", label: "Financeiro" },
  { key: "documentos", label: "Documentos" },
  { key: "mural", label: "Mural" },
] as const;

export default function PatientPortalPage() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("inicio");
  const [sessionToken, setSessionTokenState] = useState<string | null>(() => getSessionToken());
  const [patientData, setPatientData] = useState<PortalLoginPatient | null>(null);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [upcoming, setUpcoming] = useState<NextSession[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [finances, setFinances] = useState<FinanceItem[]>([]);
  const [mural, setMural] = useState<MuralItem[]>([]);

  useEffect(() => {
    if (!sessionToken) {
      return;
    }

    void fetchAllData(sessionToken);
  }, [sessionToken]);

  async function fetchAllData(token: string) {
    try {
      setPageLoading(true);
      setError("");

      const [profileData, upcomingData, historyData, documentsData, financesData, muralData] =
        await Promise.all([
          fetchPortalResource<PortalProfile>("/api/portal/profile", token),
          fetchPortalResource<NextSession[]>("/api/portal/next-session", token),
          fetchPortalResource<HistoryItem[]>("/api/portal/history", token),
          fetchPortalResource<PortalDocument[]>("/api/portal/documents", token),
          fetchPortalResource<FinanceItem[]>("/api/portal/finances", token),
          fetchPortalResource<MuralItem[]>("/api/portal/mural", token),
        ]);

      setProfile(profileData);
      setUpcoming(upcomingData ?? []);
      setHistory(historyData ?? []);
      setDocuments(documentsData ?? []);
      setFinances(financesData ?? []);
      setMural(muralData ?? []);

      setPatientData((current) =>
        current ?? {
          id: profileData.id,
          name: profileData.name,
          plan: profileData.plano,
          cpfMasked: maskCPF(profileData.cpf),
          whatsapp: profileData.whatsapp,
          email: profileData.email,
        },
      );
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Não foi possível carregar o portal.");
    } finally {
      setPageLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ""),
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { session_token?: string; patient?: PortalLoginPatient; error?: string }
        | null;

      if (!response.ok || !data?.session_token) {
        setError(data?.error || "CPF ou senha inválidos.");
        return;
      }

      persistSessionToken(data.session_token);
      setSessionTokenState(data.session_token);
      setPatientData(data.patient ?? null);
      setTab("inicio");
    } catch {
      setError("Erro de conexão ao entrar no portal.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    persistSessionToken(null);
    setSessionTokenState(null);
    setPatientData(null);
    setProfile(null);
    setUpcoming([]);
    setHistory([]);
    setDocuments([]);
    setFinances([]);
    setMural([]);
    setCpf("");
    setPassword("");
  }

  const nextSession = upcoming[0] ?? null;
  const pendingFinances = finances.filter((item) => item.status !== "pago").length;

  if (!sessionToken) {
    return (
      <div className={styles.container}>
        <form className={styles.loginBox} onSubmit={handleLogin}>
          <div className={styles.badge}>Acesso seguro</div>
          <div className={styles.title}>Portal do Paciente</div>
          <p className={styles.subtitle}>
            Use seu CPF como login e a senha cadastrada pela Dra no seu perfil.
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              className={styles.input}
              type="text"
              inputMode="numeric"
              autoComplete="username"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              required
              maxLength={14}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? <div className={styles.error}>{error}</div> : null}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no portal"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <header className={styles.portalHeader}>
          <div>
            <div className={styles.badge}>Paciente autenticado</div>
            <h1 className={styles.portalTitle}>Olá, {patientData?.name || profile?.name || "Paciente"}</h1>
            <p className={styles.portalMeta}>
              {patientData?.cpfMasked || (profile?.cpf ? maskCPF(profile.cpf) : "CPF não informado")}
              {patientData?.plan || profile?.plano ? ` · ${patientData?.plan || profile?.plano}` : ""}
            </p>
          </div>

          <button className={styles.secondaryButton} onClick={handleLogout}>
            Sair
          </button>
        </header>

        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.summaryGrid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Próxima sessão</p>
            <strong className={styles.cardValue}>
              {nextSession ? `${formatDate(nextSession.date)} às ${nextSession.time}` : "Sem agendamento"}
            </strong>
            <span className={styles.cardText}>{nextSession?.type || "Nenhuma sessão futura registrada"}</span>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Financeiro</p>
            <strong className={styles.cardValue}>{pendingFinances}</strong>
            <span className={styles.cardText}>
              {pendingFinances === 1 ? "pendência em aberto" : "pendências em aberto"}
            </span>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Documentos</p>
            <strong className={styles.cardValue}>{documents.length}</strong>
            <span className={styles.cardText}>arquivo(s) disponíveis no portal</span>
          </div>
        </div>

        <div className={styles.tabs}>
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={tab === item.key ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {pageLoading ? <div className={styles.card}>Carregando informações do portal...</div> : null}

        {!pageLoading ? (
          <div className={styles.tabPanel}>
            {tab === "inicio" ? (
              <div className={styles.contentGrid}>
                <div className={styles.card}>
                  <h2 className={styles.sectionTitle}>Seus dados</h2>
                  <ul className={styles.list}>
                    <li>Email: {profile?.email || "Não informado"}</li>
                    <li>WhatsApp: {profile?.whatsapp || "Não informado"}</li>
                    <li>Convênio: {profile?.convenio || "Não informado"}</li>
                    <li>Número do SUS: {profile?.numeroSus || "Não informado"}</li>
                  </ul>
                </div>
                <div className={styles.card}>
                  <h2 className={styles.sectionTitle}>Próximo atendimento</h2>
                  {nextSession ? (
                    <div className={styles.stack}>
                      <strong>{formatDate(nextSession.date)} às {nextSession.time}</strong>
                      <span>{nextSession.type} com {nextSession.professional}</span>
                      <span>{nextSession.location}</span>
                      {nextSession.notes ? <span>{nextSession.notes}</span> : null}
                    </div>
                  ) : (
                    <p className={styles.emptyText}>Nenhum atendimento futuro encontrado.</p>
                  )}
                </div>
                <div className={styles.card}>
                  <h2 className={styles.sectionTitle}>Mural</h2>
                  {mural.length > 0 ? (
                    <div className={styles.stack}>
                      <strong>{mural[0].title}</strong>
                      <span>{mural[0].body}</span>
                    </div>
                  ) : (
                    <p className={styles.emptyText}>Sem avisos no momento.</p>
                  )}
                </div>
              </div>
            ) : null}

            {tab === "proximos" ? (
              <div className={styles.listGrid}>
                {upcoming.length === 0 ? (
                  <div className={styles.card}>Nenhuma sessão futura agendada.</div>
                ) : (
                  upcoming.map((item) => (
                    <div key={item.id} className={styles.card}>
                      <p className={styles.cardLabel}>{formatDate(item.date)} às {item.time}</p>
                      <strong className={styles.cardValueSmall}>{item.type}</strong>
                      <span className={styles.cardText}>{item.location}</span>
                      <span className={styles.status}>{item.status}</span>
                      {item.notes ? <p className={styles.note}>{item.notes}</p> : null}
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {tab === "historico" ? (
              <div className={styles.listGrid}>
                {history.length === 0 ? (
                  <div className={styles.card}>Ainda não há histórico registrado.</div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className={styles.card}>
                      <p className={styles.cardLabel}>{formatDate(item.date)} {item.time ? `· ${item.time}` : ""}</p>
                      <strong className={styles.cardValueSmall}>{item.title}</strong>
                      <span className={styles.status}>{item.status}</span>
                      <p className={styles.note}>{item.description}</p>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {tab === "financeiro" ? (
              <div className={styles.listGrid}>
                {finances.length === 0 ? (
                  <div className={styles.card}>Nenhum lançamento financeiro encontrado.</div>
                ) : (
                  finances.map((item) => (
                    <div key={item.id} className={styles.card}>
                      <p className={styles.cardLabel}>Vencimento: {formatDate(item.due_date)}</p>
                      <strong className={styles.cardValueSmall}>{item.description}</strong>
                      <span className={styles.cardText}>{formatMoney(item.value)}</span>
                      <span className={styles.status}>{item.status === "pendente" ? "Pendente" : item.status === "parcial" ? "Parcial" : "Pago"}</span>
                      {item.payment_method ? <p className={styles.note}>Forma de pagamento: {item.payment_method}</p> : null}
                      {item.notes ? <p className={styles.note}>{item.notes}</p> : null}
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {tab === "documentos" ? (
              <div className={styles.listGrid}>
                {documents.length === 0 ? (
                  <div className={styles.card}>Nenhum documento disponível no momento.</div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className={styles.card}>
                      <p className={styles.cardLabel}>{doc.type}</p>
                      <strong className={styles.cardValueSmall}>{doc.title}</strong>
                      <a className={styles.link} href={doc.url} target="_blank" rel="noreferrer">
                        Abrir arquivo
                      </a>
                    </div>
                  ))
                )}
              </div>
            ) : null}

            {tab === "mural" ? (
              <div className={styles.listGrid}>
                {mural.length === 0 ? (
                  <div className={styles.card}>Nenhum aviso publicado.</div>
                ) : (
                  mural.map((item) => (
                    <div key={item.id} className={styles.card}>
                      <p className={styles.cardLabel}>{formatDate(item.createdAt.slice(0, 10))}</p>
                      <strong className={styles.cardValueSmall}>{item.title}</strong>
                      <p className={styles.note}>{item.body}</p>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
