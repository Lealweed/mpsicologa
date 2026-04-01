"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search, GraduationCap } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import styles from "./inscricoes.module.css";

type Registration = {
  id: number;
  full_name: string;
  birth_date: string;
  phone: string;
  email: string;
  profession: string | null;
  city: string | null;
  fear_level: string;
  symptoms: string[];
  avoids_exposure: string | null;
  previous_course: string | null;
  expectations: string;
  communication_area: string;
  wants_lunch: string;
  referral_source: string;
  created_at: string;
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function InscricoesPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/course", { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Falha ao carregar inscricoes.");
      }
      setRegistrations((await res.json()) as Registration[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = registrations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      (r.city ?? "").toLowerCase().includes(q)
    );
  });

  const wantsLunchCount = registrations.filter((r) => r.wants_lunch === "Sim").length;

  return (
    <div>
      <PageHeader
        title="Inscrições do Curso"
        subtitle="Pré-inscrições recebidas pelo formulário do Curso de Oratória."
      />

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total de inscrições</span>
          <span className={styles.statValue}>{registrations.length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Querem almoçar</span>
          <span className={styles.statValue}>{wantsLunchCount}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Não almoçam</span>
          <span className={styles.statValue}>{registrations.length - wantsLunchCount}</span>
        </div>
      </div>

      {error && (
        <div style={{ color: "var(--error)", marginBottom: "1rem", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <Search size={16} color="var(--muted)" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por nome, e-mail, telefone ou cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {loading
              ? "Carregando..."
              : registrations.length === 0
                ? "Nenhuma inscrição recebida ainda."
                : "Nenhum resultado para a busca."}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Cidade</th>
                <th>Nível de medo</th>
                <th>Almoço</th>
                <th>Origem</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className={styles.clickableRow}
                  onClick={() => setSelected(r)}
                >
                  <td className={styles.nameCell}>{r.full_name}</td>
                  <td>{r.phone}</td>
                  <td>{r.city || "—"}</td>
                  <td><span className={styles.badge}>{r.fear_level}</span></td>
                  <td>{r.wants_lunch}</td>
                  <td>{r.referral_source}</td>
                  <td className={styles.dateCell}>{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.full_name ?? "Detalhes"}
        size="md"
      >
        {selected && (
          <div className={styles.detailGrid}>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Nome completo</span>
              <span className={styles.detailValue}>{selected.full_name}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Data de nascimento</span>
              <span className={styles.detailValue}>{selected.birth_date}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Telefone</span>
              <span className={styles.detailValue}>{selected.phone}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>E-mail</span>
              <span className={styles.detailValue}>{selected.email}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Profissão</span>
              <span className={styles.detailValue}>{selected.profession || "—"}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Cidade</span>
              <span className={styles.detailValue}>{selected.city || "—"}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Medo de falar em público</span>
              <span className={styles.detailValue}>{selected.fear_level}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Evita exposição</span>
              <span className={styles.detailValue}>{selected.avoids_exposure || "—"}</span>
            </div>
            <div className={styles.detailFieldFull}>
              <span className={styles.detailLabel}>Sintomas ao falar em público</span>
              <div className={styles.symptomList}>
                {selected.symptoms.length > 0
                  ? selected.symptoms.map((s) => (
                      <span key={s} className={styles.symptomTag}>{s}</span>
                    ))
                  : <span className={styles.detailValue}>—</span>}
              </div>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Curso anterior</span>
              <span className={styles.detailValue}>{selected.previous_course || "—"}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Área de comunicação</span>
              <span className={styles.detailValue}>{selected.communication_area}</span>
            </div>
            <div className={styles.detailFieldFull}>
              <span className={styles.detailLabel}>O que espera do curso</span>
              <span className={styles.detailValue}>{selected.expectations}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Deseja almoçar</span>
              <span className={styles.detailValue}>{selected.wants_lunch}</span>
            </div>
            <div className={styles.detailField}>
              <span className={styles.detailLabel}>Como soube do curso</span>
              <span className={styles.detailValue}>{selected.referral_source}</span>
            </div>
            <div className={styles.detailFieldFull}>
              <span className={styles.detailLabel}>Data da inscrição</span>
              <span className={styles.detailValue}>{formatDate(selected.created_at)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
