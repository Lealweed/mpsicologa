"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp, AlertCircle, BadgeCheck, Plus } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import RevenueChart from "../_components/RevenueChart";
import {
  fetchDashboardApi,
  type DashboardFinanceEntry,
} from "@/lib/dashboard-api";
import styles from "./financeiro.module.css";

type PaymentStatus = "Pago" | "Pendente" | "Parcial";

type Cobranca = DashboardFinanceEntry;

type LancamentoForm = {
  paciente: string;
  plano: string;
  valor: string;
  data: string;
  status: PaymentStatus;
  formaPagamento: string;
  referencia: string;
  observacoes: string;
};

const INITIAL: Cobranca[] = [];

const BLANK: LancamentoForm = {
  paciente: "",
  plano: "",
  valor: "",
  data: new Date().toISOString().split("T")[0],
  status: "Pendente",
  formaPagamento: "Pix",
  referencia: "",
  observacoes: "",
};

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function formatDisplayDate(value: string) {
  if (!value) return "—";
  if (value.includes("/")) return value;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR");
}

export default function FinanceiroPage() {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>(INITIAL);
  const [lancamentoOpen, setLancamentoOpen] = useState(false);
  const [form, setForm] = useState<LancamentoForm>(BLANK);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCobrancas = useCallback(async () => {
    try {
      setErrorMessage("");
      const data = await fetchDashboardApi<DashboardFinanceEntry[]>("/api/dashboard/finance");
      setCobrancas(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar os lançamentos.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCobrancas();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCobrancas]);

  const totalPago = cobrancas
    .filter((c) => c.status === "Pago")
    .reduce((a, c) => a + c.valor, 0);
  const totalPendente = cobrancas
    .filter((c) => c.status !== "Pago")
    .reduce((a, c) => a + c.valor, 0);
  const totalGeral = cobrancas.reduce((a, c) => a + c.valor, 0);

  const revenueData = useMemo(() => {
    const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const points = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        mes: monthLabels[date.getMonth()],
        receita: 0,
        meta: 0,
      };
    });

    cobrancas.forEach((item) => {
      const date = new Date(`${item.data}T00:00:00`);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const point = points.find(
        (entry) => entry.month === date.getMonth() && entry.year === date.getFullYear(),
      );

      if (point) {
        point.receita += item.valor;
      }
    });

    return points.map(({ mes, receita, meta }) => ({ mes, receita, meta }));
  }, [cobrancas]);

  function update<K extends keyof LancamentoForm>(k: K, v: LancamentoForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setErrorMessage("");
      const created = await fetchDashboardApi<DashboardFinanceEntry>("/api/dashboard/finance", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          valor: Number(form.valor),
        }),
      });

      setCobrancas((prev) => [created, ...prev]);
      setLancamentoOpen(false);
      setForm(BLANK);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o lançamento.",
      );
    }
  }

  const newBtn = (
    <button className={styles.newBtn} onClick={() => setLancamentoOpen(true)}>
      <Plus size={15} />
      Novo Lançamento
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Controle de pagamentos, recebimentos e conciliação"
        actions={newBtn}
      />

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

      {errorMessage ? <p className={styles.tdMuted}>{errorMessage}</p> : null}

      <RevenueChart data={revenueData} />

      <div className={styles.tableWrapper}>
        <table className={styles.financeiroTable}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Serviço</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Método</th>
              <th>Referência</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {cobrancas.length === 0 ? (
              <tr>
                <td className={styles.tdMuted} colSpan={7}>
                  Nenhum lançamento financeiro cadastrado ainda.
                </td>
              </tr>
            ) : (
              cobrancas.map((c) => (
                <tr key={c.id}>
                  <td className={styles.tdBold}>{c.paciente}</td>
                  <td className={styles.tdMuted}>{c.plano}</td>
                  <td className={styles.tdMuted}>{formatDisplayDate(c.data)}</td>
                  <td className={styles.tdBold}>R$ {fmt(c.valor)}</td>
                  <td className={styles.tdMuted}>{c.formaPagamento}</td>
                  <td className={styles.tdMuted}>{c.referencia || "—"}</td>
                  <td>
                    <span className={c.status === "Pago" ? styles.statusPago : styles.statusPendente}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={lancamentoOpen}
        onClose={() => {
          setLancamentoOpen(false);
          setForm(BLANK);
        }}
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
                <option>TCC Individual</option>
                <option>Terapia de Casal</option>
                <option>Laudo Bariátrico</option>
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
              Forma de pagamento
              <select value={form.formaPagamento} onChange={(e) => update("formaPagamento", e.target.value)}>
                <option>Pix</option>
                <option>Cartão</option>
                <option>Boleto</option>
                <option>Transferência</option>
                <option>Dinheiro</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as PaymentStatus)}
              >
                <option value="Pendente">Pendente</option>
                <option value="Parcial">Parcial</option>
                <option value="Pago">Pago</option>
              </select>
            </label>
            <label className={styles.formSpan2}>
              Referência / comprovante
              <input
                type="text"
                value={form.referencia}
                onChange={(e) => update("referencia", e.target.value)}
                placeholder="Ex: PIX 0104 / Recibo 0001"
              />
            </label>
            <label className={styles.formSpan2}>
              Observações
              <textarea
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                placeholder="Parcelamento, observações de cobrança ou repasse"
                rows={3}
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setLancamentoOpen(false);
                setForm(BLANK);
              }}
            >
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
