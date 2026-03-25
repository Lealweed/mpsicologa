"use client";

import React, { useState } from 'react';
import styles from './portal.module.css';

// Máscara de CPF simples
function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

// Utilitário para salvar token na sessionStorage
function setSessionToken(token: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('patient_portal_token', token);
  }
}

// Utilitário para obter token
function getSessionToken() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('patient_portal_token');
  }
  return null;
}

// Tabs
const TABS = [
  { key: 'inicio', label: 'Início' },
  { key: 'documentos', label: 'Documentos & Laudos' },
  { key: 'financeiro', label: 'Financeiro' },
];

export default function PatientPortalPage() {
  const [cpf, setCpf] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('inicio');
  const [sessionToken, setSessionTokenState] = useState<string | null>(getSessionToken());
  const [patientData, setPatientData] = useState<any>(null);

  // Dados das abas
  const [nextSession, setNextSession] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [finances, setFinances] = useState<any[]>([]);

  // Login handler
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.session_token) {
        setError(data.error || 'CPF ou PIN inválidos.');
        setLoading(false);
        return;
      }
      setSessionToken(data.session_token);
      setSessionTokenState(data.session_token);
      setPatientData(data.patient);
      setLoading(false);
      // Carregar dados iniciais
      fetchAllData(data.session_token);
    } catch (err) {
      setError('Erro de conexão.');
      setLoading(false);
    }
  }

  // Fetch dos dados das abas
  async function fetchAllData(token: string) {
    // Próxima sessão
    fetch('/api/portal/next-session', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setNextSession);
    // Documentos
    fetch('/api/portal/documents', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setDocuments);
    // Financeiro
    fetch('/api/portal/finances', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setFinances);
  }

  // Logout
  function handleLogout() {
    setSessionToken('');
    setSessionTokenState(null);
    setPatientData(null);
    setCpf('');
    setPin('');
  }

  // Render login
  if (!sessionToken) {
    return (
      <div className={styles.container}>
        <form className={styles.loginBox} onSubmit={handleLogin}>
          <div className={styles.title}>Portal do Paciente</div>
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
              onChange={e => setCpf(maskCPF(e.target.value))}
              required
              maxLength={14}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="pin">Senha (PIN)</label>
            <input
              id="pin"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              placeholder="PIN de acesso"
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
              maxLength={8}
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className={styles.container}>
      <div className={styles.loginBox} style={{ maxWidth: 500, width: '100%' }}>
        <div className={styles.title} style={{ fontSize: '1.5rem', marginBottom: 0 }}>
          Olá, {patientData?.name || 'Paciente'}
        </div>
        <button className={styles.button} style={{ margin: '1rem 0 0.5rem 0', background: '#fff8f5', color: '#b48a78', border: '1px solid #e6cfc7' }} onClick={handleLogout}>
          Sair
        </button>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={tab === t.key ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.tabPanel}>
          {tab === 'inicio' && (
            <div className={styles.card}>
              <h2 style={{ fontFamily: 'Playfair Display', color: '#b48a78', fontSize: '1.2rem', margin: 0 }}>Próxima Sessão</h2>
              {nextSession ? (
                <>
                  <div style={{ margin: '0.7rem 0 0.2rem 0', fontWeight: 500 }}>{nextSession.date} às {nextSession.time}</div>
                  <div style={{ color: '#a06c5a', fontSize: '1rem' }}>{nextSession.type} com {nextSession.professional}</div>
                  <div style={{ color: '#b48a78', fontSize: '0.95rem', marginTop: 6 }}>{nextSession.location}</div>
                </>
              ) : (
                <div style={{ color: '#b48a78', marginTop: 10 }}>Nenhuma sessão agendada.</div>
              )}
            </div>
          )}
          {tab === 'documentos' && (
            <div>
              {documents.length === 0 ? (
                <div className={styles.card}>Nenhum documento disponível.</div>
              ) : (
                documents.map(doc => (
                  <div className={styles.card} key={doc.id}>
                    <div style={{ fontWeight: 600 }}>{doc.title}</div>
                    <div style={{ color: '#b48a78', fontSize: '0.95rem', margin: '0.3rem 0' }}>{doc.type}</div>
                    <a href={doc.url} download style={{ color: '#a06c5a', textDecoration: 'underline', fontWeight: 500 }}>Baixar</a>
                  </div>
                ))
              )}
            </div>
          )}
          {tab === 'financeiro' && (
            <div>
              {finances.length === 0 ? (
                <div className={styles.card}>Nenhuma fatura encontrada.</div>
              ) : (
                finances.map(fin => (
                  <div className={styles.card} key={fin.id}>
                    <div style={{ fontWeight: 600 }}>{fin.description}</div>
                    <div style={{ color: '#b48a78', fontSize: '0.95rem', margin: '0.3rem 0' }}>Vencimento: {fin.due_date}</div>
                    <div style={{ color: fin.status === 'pendente' ? '#b04848' : '#a06c5a', fontWeight: 500 }}>
                      {fin.status === 'pendente' ? 'Pendente' : 'Pago'}
                    </div>
                    {fin.status === 'pendente' && (
                      <button className={styles.button} style={{ marginTop: 10, background: '#b48a78', color: '#fff' }}>
                        Pagar Fatura
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
