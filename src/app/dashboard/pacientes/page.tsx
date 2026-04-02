"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, UserPlus, PencilLine } from "lucide-react";
import PageHeader from "../_components/PageHeader";
import Modal from "../_components/Modal";
import { fetchDashboardApi, type DashboardPatient } from "@/lib/dashboard-api";
import styles from "./pacientes.module.css";

type Paciente = DashboardPatient & {
  initials: string;
};

type PacienteForm = {
  nome: string;
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
  portalEnabled: boolean;
  portalPassword: string;
};

const INITIAL: Paciente[] = [];

const BLANK: PacienteForm = {
  nome: "",
  email: "",
  whatsapp: "",
  telefone: "",
  endereco: "",
  sexo: "",
  idade: "",
  dataNascimento: "",
  numeroSus: "",
  cpf: "",
  convenio: "",
  plano: "",
  observacoes: "",
  portalEnabled: false,
  portalPassword: "",
};

function buildInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function mapPaciente(patient: DashboardPatient): Paciente {
  return {
    ...patient,
    initials: buildInitials(patient.nome),
  };
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>(INITIAL);
  const [selected, setSelected] = useState<string | null>(null);
  const [cadastrarOpen, setCadastrarOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PacienteForm>(BLANK);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedPaciente = pacientes.find((p) => p.id === selected);

  const loadPacientes = useCallback(async () => {
    try {
      setErrorMessage("");
      const data = await fetchDashboardApi<DashboardPatient[]>("/api/dashboard/patients");
      setPacientes(data.map(mapPaciente));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar os pacientes.",
      );
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPacientes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPacientes]);

  function update<K extends keyof PacienteForm>(k: K, v: PacienteForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(BLANK);
    setCadastrarOpen(true);
  }

  function openEditModal(patient: Paciente) {
    setEditingId(patient.id);
    setForm({
      nome: patient.nome,
      email: patient.email,
      whatsapp: patient.whatsapp,
      telefone: patient.telefone,
      endereco: patient.endereco,
      sexo: patient.sexo,
      idade: patient.idade,
      dataNascimento: patient.dataNascimento,
      numeroSus: patient.numeroSus,
      cpf: patient.cpf,
      convenio: patient.convenio,
      plano: patient.plano,
      observacoes: patient.observacoes,
      portalEnabled: patient.portalEnabled,
      portalPassword: "",
    });
    setSelected(null);
    setCadastrarOpen(true);
  }

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();

    try {
      setErrorMessage("");
      const saved = await fetchDashboardApi<DashboardPatient>("/api/dashboard/patients", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          id: editingId ?? undefined,
        }),
      });

      setPacientes((prev) => {
        if (editingId) {
          return prev.map((item) => (item.id === saved.id ? mapPaciente(saved) : item));
        }

        return [mapPaciente(saved), ...prev];
      });

      setCadastrarOpen(false);
      setEditingId(null);
      setForm(BLANK);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível salvar o paciente.",
      );
    }
  }

  const newBtn = (
    <button className={styles.newBtn} onClick={openCreateModal}>
      <UserPlus size={15} />
      Cadastrar Paciente
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Pacientes"
        subtitle={`${pacientes.length} paciente${pacientes.length === 1 ? "" : "s"} cadastrado${pacientes.length === 1 ? "" : "s"}`}
        actions={newBtn}
      />

      {errorMessage ? <p className={styles.tdMuted}>{errorMessage}</p> : null}

      <div className={styles.tableWrapper}>
        <table className={styles.pacientesTable}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>WhatsApp</th>
              <th>Email</th>
              <th>Sexo / Idade</th>
              <th>Plano</th>
              <th>Portal</th>
              <th>SUS / Convênio</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length === 0 ? (
              <tr>
                <td className={styles.tdMuted} colSpan={7}>
                  Nenhum paciente cadastrado ainda.
                </td>
              </tr>
            ) : (
              pacientes.map((p) => (
                <tr key={p.id} className={styles.pacienteRow} onClick={() => setSelected(p.id)}>
                  <td>
                    <div className={styles.pacienteCell}>
                      <div className={styles.pacienteAvatar}>{p.initials}</div>
                      <span className={styles.pacienteNome}>{p.nome}</span>
                    </div>
                  </td>
                  <td className={styles.tdMuted}>{p.whatsapp || "—"}</td>
                  <td className={styles.tdMuted}>{p.email || "—"}</td>
                  <td className={styles.tdMuted}>
                    {p.sexo || "—"}
                    {p.idade ? ` · ${p.idade} anos` : ""}
                  </td>
                  <td>
                    <span className={styles.planoBadge}>{p.plano || "Sem plano"}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.planoBadge} ${
                        p.portalEnabled ? styles.statusActive : styles.statusInactive
                      }`}
                    >
                      {p.portalEnabled ? "Ativo" : "Fechado"}
                    </span>
                  </td>
                  <td className={styles.tdMuted}>{p.numeroSus || p.convenio || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && selectedPaciente && (
        <div className={styles.prontuarioOverlay} onClick={() => setSelected(null)}>
          <div className={styles.prontuarioModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.prontuarioClose} onClick={() => setSelected(null)} aria-label="Fechar">
              <X size={18} />
            </button>
            <div className={styles.prontuarioAvatarLarge}>{selectedPaciente.initials}</div>
            <div className={styles.prontuarioName}>{selectedPaciente.nome}</div>
            <div className={styles.prontuarioPlan}>{selectedPaciente.plano || "Sem plano definido"}</div>
            <div className={styles.prontuarioDivider} />

            <div className={styles.prontuarioActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => openEditModal(selectedPaciente)}
              >
                <PencilLine size={15} />
                Editar cadastro
              </button>
            </div>

            <p className={styles.prontuarioSectionLabel}>Contato</p>
            <ul className={styles.prontuarioList}>
              <li>Email: {selectedPaciente.email || "Não informado"}</li>
              <li>WhatsApp: {selectedPaciente.whatsapp || "Não informado"}</li>
              <li>Telefone adicional: {selectedPaciente.telefone || "Não informado"}</li>
              <li>Endereço: {selectedPaciente.endereco || "Não informado"}</li>
            </ul>

            <p className={styles.prontuarioSectionLabel}>Dados cadastrais</p>
            <ul className={styles.prontuarioList}>
              <li>Sexo: {selectedPaciente.sexo || "Não informado"}</li>
              <li>Idade: {selectedPaciente.idade ? `${selectedPaciente.idade} anos` : "Não informada"}</li>
              <li>Data de nascimento: {selectedPaciente.dataNascimento || "Não informada"}</li>
              <li>CPF: {selectedPaciente.cpf || "Não informado"}</li>
              <li>Número do SUS: {selectedPaciente.numeroSus || "Não informado"}</li>
              <li>Convênio: {selectedPaciente.convenio || "Não informado"}</li>
            </ul>

            <p className={styles.prontuarioSectionLabel}>Acesso ao portal</p>
            <ul className={styles.prontuarioList}>
              <li>Status: {selectedPaciente.portalEnabled ? "Liberado para o paciente" : "Ainda não liberado"}</li>
              <li>Login do paciente: {selectedPaciente.cpf || "Informe o CPF para criar o acesso"}</li>
              <li>Senha: definida pela Dra no cadastro ou na edição do perfil</li>
            </ul>

            <p className={styles.prontuarioSectionLabel}>Observações</p>
            <p className={styles.prontuarioNotes}>
              {selectedPaciente.observacoes || "Nenhuma observação clínica ou administrativa registrada ainda."}
            </p>
          </div>
        </div>
      )}

      <Modal
        isOpen={cadastrarOpen}
        onClose={() => {
          setCadastrarOpen(false);
          setEditingId(null);
          setForm(BLANK);
        }}
        title={editingId ? "Editar Paciente" : "Cadastrar Paciente"}
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
              WhatsApp
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </label>
            <label>
              Telefone adicional
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => update("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </label>
            <label>
              Sexo
              <select value={form.sexo} onChange={(e) => update("sexo", e.target.value)}>
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
                value={form.idade}
                onChange={(e) => update("idade", e.target.value)}
                placeholder="Ex: 34"
              />
            </label>
            <label>
              Data de nascimento
              <input
                type="date"
                value={form.dataNascimento}
                onChange={(e) => update("dataNascimento", e.target.value)}
              />
            </label>
            <label>
              CPF
              <input
                type="text"
                value={form.cpf}
                onChange={(e) => update("cpf", e.target.value)}
                placeholder="000.000.000-00"
              />
            </label>
            <label>
              Número do SUS
              <input
                type="text"
                value={form.numeroSus}
                onChange={(e) => update("numeroSus", e.target.value)}
                placeholder="000 0000 0000 0000"
              />
            </label>
            <label>
              Convênio
              <input
                type="text"
                value={form.convenio}
                onChange={(e) => update("convenio", e.target.value)}
                placeholder="Nome do convênio, se houver"
              />
            </label>
            <label className={styles.formSpan2}>
              Serviço / Plano
              <select value={form.plano} onChange={(e) => update("plano", e.target.value)}>
                <option value="">Selecionar...</option>
                <option>TCC Individual</option>
                <option>Terapia de Casal</option>
                <option>Laudo Bariátrico</option>
                <option>Acompanhamento</option>
                <option>Convênio</option>
              </select>
            </label>
            <label className={`${styles.formSpan2} ${styles.portalToggle}`}>
              <input
                type="checkbox"
                checked={form.portalEnabled}
                onChange={(e) => update("portalEnabled", e.target.checked)}
              />
              <span>Liberar acesso ao portal do paciente</span>
            </label>
            {form.portalEnabled ? (
              <>
                <label>
                  Senha do portal
                  <input
                    type="text"
                    value={form.portalPassword}
                    onChange={(e) => update("portalPassword", e.target.value)}
                    placeholder={editingId ? "Digite nova senha para trocar" : "Defina a senha do paciente"}
                  />
                </label>
                <p className={`${styles.tdMuted} ${styles.portalHint}`}>
                  O login do paciente será sempre o CPF informado acima.
                </p>
              </>
            ) : null}
            <label className={styles.formSpan2}>
              Endereço
              <textarea
                value={form.endereco}
                onChange={(e) => update("endereco", e.target.value)}
                placeholder="Rua, número, bairro, cidade e CEP"
                rows={3}
              />
            </label>
            <label className={styles.formSpan2}>
              Observações
              <textarea
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
                placeholder="Informações clínicas, administrativas ou observações importantes"
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
                setEditingId(null);
                setForm(BLANK);
              }}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {editingId ? "Salvar alterações" : "Salvar paciente"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
