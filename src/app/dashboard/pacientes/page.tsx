"use client";

import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import styles from "./pacientes.module.css";

type Paciente = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  plano: string;
  initials: string;
};

type PacienteForm = {
  nome: string;
  email: string;
  telefone: string;
  plano: string;
};

const INITIAL: Paciente[] = [];

const BLANK: PacienteForm = { nome: "", email: "", telefone: "", plano: "" };

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>(INITIAL);
  const [selected, setSelected] = useState<number | null>(null);
  const [cadastrarOpen, setCadastrarOpen] = useState(false);
  const [form, setForm] = useState<PacienteForm>(BLANK);

  const selectedPaciente = pacientes.find((p) => p.id === selected);

  function update<K extends keyof PacienteForm>(k: K, v: PacienteForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    const initials = form.nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    setPacientes((prev) => [
      ...prev,
      { id: prev.length + 1, ...form, initials },
    ]);
    setCadastrarOpen(false);
    setForm(BLANK);
  }

  const newBtn = (
    <button
      className={styles.newBtn}
      onClick={() => setCadastrarOpen(true)}
    >
      <UserPlus size={15} />
      Cadastrar Paciente
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Pacientes"
        subtitle={`${pacientes.length} pacientes ativos`}
        actions={newBtn}
      />

      <div className={styles.tableWrapper}>
        <table className={styles.pacientesTable}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Plano</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length === 0 ? (
              <tr>
                <td className={styles.tdMuted} colSpan={4}>
                  Nenhum paciente cadastrado ainda.
                </td>
              </tr>
            ) : (
              pacientes.map((p) => (
                <tr
                  key={p.id}
                  className={styles.pacienteRow}
                  onClick={() => setSelected(p.id)}
                >
                  <td>
                    <div className={styles.pacienteCell}>
                      <div className={styles.pacienteAvatar}>{p.initials}</div>
                      <span className={styles.pacienteNome}>{p.nome}</span>
                    </div>
                  </td>
                  <td className={styles.tdMuted}>{p.email}</td>
                  <td className={styles.tdMuted}>{p.telefone}</td>
                  <td><span className={styles.planoBadge}>{p.plano}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Prontuário inline modal (existing) */}
      {selected && selectedPaciente && (
        <div className={styles.prontuarioOverlay} onClick={() => setSelected(null)}>
          <div className={styles.prontuarioModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.prontuarioClose} onClick={() => setSelected(null)} aria-label="Fechar">
              <X size={18} />
            </button>
            <div className={styles.prontuarioAvatarLarge}>{selectedPaciente.initials}</div>
            <div className={styles.prontuarioName}>{selectedPaciente.nome}</div>
            <div className={styles.prontuarioPlan}>{selectedPaciente.plano}</div>
            <div className={styles.prontuarioDivider} />
            <p className={styles.prontuarioSectionLabel}>Histórico de Consultas</p>
            <ul className={styles.prontuarioList}>
              <li>10/03/2026 — Sessão de acompanhamento</li>
              <li>03/03/2026 — Sessão inicial</li>
            </ul>
            <p className={styles.prontuarioSectionLabel}>Anotações Clínicas</p>
            <p className={styles.prontuarioNotes}>
              Paciente demonstra evolução consistente. Trabalho em reestruturação cognitiva em andamento.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Paciente */}
      <Modal
        isOpen={cadastrarOpen}
        onClose={() => { setCadastrarOpen(false); setForm(BLANK); }}
        title="Cadastrar Paciente"
      >
        <form onSubmit={handleCadastrar}>
          <div className={styles.formGrid}>
            <label className={styles.formSpan2}>
              Nome completo
              <input
                type="text"
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                placeholder="Nome e sobrenome"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </label>
            <label>
              Telefone
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => update("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label className={styles.formSpan2}>
              Plano
              <select value={form.plano} onChange={(e) => update("plano", e.target.value)}>
                <option value="">Selecionar...</option>
                <option>TCC Mensal</option>
                <option>Bariátrico</option>
                <option>Acompanhamento</option>
              </select>
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary}
              onClick={() => { setCadastrarOpen(false); setForm(BLANK); }}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
