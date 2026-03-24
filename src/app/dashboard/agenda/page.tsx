import styles from "./agenda.module.css";

// Mock de sessões
const agenda = [
  { id: 1, data: "24/03/2026 09:00", paciente: "Ana Souza" },
  { id: 2, data: "24/03/2026 10:00", paciente: "Bruno Lima" },
];

export default function AgendaPage() {
  return (
    <div className={styles.agendaList}>
      {agenda.map((item) => (
        <div key={item.id} className={styles.agendaItem}>
          <span className={styles.agendaDate}>{item.data}</span>
          <span className={styles.agendaPaciente}>{item.paciente}</span>
          <span className={styles.agendaProntuarioLink}>Ver prontuário</span>
        </div>
      ))}
    </div>
  );
}
