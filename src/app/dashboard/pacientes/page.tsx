"use client";
import React from "react";
import styles from "./pacientes.module.css";

// Mock de pacientes
const pacientes = [
  { id: 1, nome: "Ana Souza", email: "ana@email.com", telefone: "(11) 99999-0001" },
  { id: 2, nome: "Bruno Lima", email: "bruno@email.com", telefone: "(21) 98888-0002" },
];

export default function PacientesPage() {
  // Estado para modal de prontuário
  const [selected, setSelected] = React.useState<number | null>(null);

  return (
    <div>
      <table className={styles.pacientesTable}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr
              key={p.id}
              className={styles.pacienteRow}
              onClick={() => setSelected(p.id)}
            >
              <td>{p.nome}</td>
              <td>{p.email}</td>
              <td>{p.telefone}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className={styles.prontuarioModal}>
          <div className={styles.prontuarioContent}>
            <button className={styles.prontuarioClose} onClick={() => setSelected(null)}>&times;</button>
            <div className={styles.prontuarioHeader}>Prontuário de {pacientes.find(p => p.id === selected)?.nome}</div>
            <div>
              {/* Aqui entraria o histórico de consultas e o prontuário real do paciente */}
              <p><strong>Histórico de Consultas:</strong></p>
              <ul>
                <li>10/03/2026 - Sessão de acompanhamento</li>
                <li>03/03/2026 - Sessão inicial</li>
              </ul>
              <p><strong>Prontuário:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
