"use client";

import React, { useState } from "react";
import { TrendingUp, AlertCircle, BadgeCheck, Plus } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import RevenueChart from "../_components/RevenueChart";
import styles from "./financeiro.module.css";

type Cobranca = {
  id: number;
  paciente: string;
  plano: string;
  data: string;
  valor: number;
  status: "Pago" | "Pendente";
};

type LancamentoForm = {
  paciente: string;
  plano: string;
  valor: string;
  data: string;
  status: "Pago" | "Pendente";
};

const INITIAL: Cobranca[] = [
  { id: 1, paciente: "Ana Souza",   plano: "TCC Mensal",    data: "01/03/2026", valor: 400, status: "Pago" },
  { id: 2, paciente: "Bruno Lima",  plano: "Bariátrico",    data: "05/03/2026", valor: 600, status: "Pendente" },
  { id: 3, paciente: "Carla Mendes",plano: "Acompanhamento",data: "10/03/2026", valor: 300, status: "Pago" },
];

const BLANK: LancamentoForm = {
  paciente: "",
  plano: "",
  valor: "",
  data: new Date().toISOString().split("T")[0],
  status: "Pendente",
};

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function FinanceiroPage() {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>(INITIAL);
  const [lancamentoOpen, setLancamentoOpen] = useState(false);
  const [form, setForm] = useState<LancamentoForm>(BLANK);

  const totalPago = cobrancas
    .filter((c) => c.status === "Pago")
    .reduce((a, c) => a + c.valor, 0);
  const totalPendente = cobrancas
    .filter((c) => c.status === "Pendente")
    .reduce((a, c) => a + c.valor, 0);
  const totalGeral = cobrancas.reduce((a, c) => a + c.valor, 0);

  function update<K extends keyof LancamentoForm>(k: K, v: LancamentoForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const [y, m, d] = form.data.split("-");
    setCobrancas((prev) => [
      {
        id: prev.length + 1,
        paciente: form.paciente,
        plano: form.plano,
        data: `${d}/${m}/${y}`,
        valor: Number(form.valor),
        status: form.status,
      },
      ...prev,
    ]);
    setLancamentoOpen(false);
    setForm(BLANK);
  }

  const newBtn = (
    <button
      className={styles.newBtn}
      onClick={() => setLancamentoOpen(true)}
    >
      <Plus size={15} />
      Novo Lançamento
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Controle de pagamentos e recebimentos"
        actions={newBtn}
      />

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.summaryCardSuccess}`}>
          <div className={styles.summaryIcon}><TrendingUp size={18} /></div>
          <div className={styles.summaryValue}>R$ {fmt(totalPago)}</div>
          <div className={styles.summaryLabel}>Receita Recebida</div>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryCardWarning}`}>
          <div className={styles.summaryIcon}><AlertCircle size={18} /></div>
          <div className={styles.summaryValue}>R$ {fmt(totalPendente)}</div>
          <div className={styles.summaryLabel}>A Receber</div>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryCardPrimary}`}>
          <div className={styles.summaryIcon}><BadgeCheck size={18} /></div>
          <div className={styles.summaryValue}>R$ {fmt(totalGeral)}</div>
          <div className={styles.summaryLabel}>Total do Mês</div>
        </div>
      </div>

      {/* Revenue chart */}
      <RevenueChart />

      {/* Transactions table */}
      <div className={styles.tableWrapper}>
        <table className={styles.financeiroTable}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Plano</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {cobrancas.map((c) => (
              <tr key={c.id}>
                <td className={styles.tdBold}>{c.paciente}</td>
                <td className={styles.tdMuted}>{c.plano}</td>
                <td className={styles.tdMuted}>{c.data}</td>
                <td className={styles.tdBold}>R$ {fmt(c.valor)}</td>
                <td>
                  <span className={c.status === "Pago" ? styles.statusPago : styles.statusPendente}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Novo Lançamento */}
      <Modal
        isOpen={lancamentoOpen}
        onClose={() => { setLancamentoOpen(false); setForm(BLANK); }}
        title="Novo Lançamento"
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
              Serviço / Plano
              <select value={form.plano} onChange={(e) => update("plano", e.target.value)}>
                <option value="">Selecionar...</option>
                <option>TCC Mensal</option>
                <option>Bariátrico</option>
                <option>Acompanhamento</option>
                <option>Consultoria B2B</option>
              </select>
            </label>
            <label>
              Valor (R$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valor}
                onChange={(e) => update("valor", e.target.value)}
                placeholder="0,00"
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
              Status
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as "Pago" | "Pendente")}
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary}
              onClick={() => { setLancamentoOpen(false); setForm(BLANK); }}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Salvar Lançamento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
