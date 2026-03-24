import styles from "./financeiro.module.css";

// Mock de cobranças
const cobrancas = [
  { id: 1, paciente: "Ana Souza", valor: 200, status: "Pago" },
  { id: 2, paciente: "Bruno Lima", valor: 200, status: "Pendente" },
];

export default function FinanceiroPage() {
  return (
    <table className={styles.financeiroTable}>
      <thead>
        <tr>
          <th>Paciente</th>
          <th>Valor</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {cobrancas.map((c) => (
          <tr key={c.id}>
            <td>{c.paciente}</td>
            <td>R$ {c.valor.toLocaleString("pt-BR")}</td>
            <td className={c.status === "Pago" ? styles.financeiroStatusPago : styles.financeiroStatusPendente}>{c.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
