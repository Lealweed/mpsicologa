"use client";

import React from "react";
import { useUser } from "../_components/UserContext";

export default function DashboardOverview() {
  const { user } = useUser();

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h1 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: "2.5rem", 
          color: "#2C3E35", 
          margin: "0 0 0.5rem 0",
          fontWeight: 400
        }}>
          Olá, Dra. Mayara
        </h1>
        <p style={{ color: "#7A7A7A", margin: 0, fontSize: "1.1rem" }}>
          Aqui está o resumo da sua clínica hoje.
        </p>
      </header>

      {/* Cards de Resumo */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardTitleStyle}>Consultas Hoje</span>
            <span style={{ fontSize: "1.5rem" }}>📅</span>
          </div>
          <div style={cardValueStyle}>4</div>
          <p style={cardDescStyle}>2 presenciais, 2 online</p>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardTitleStyle}>Pacientes Ativos</span>
            <span style={{ fontSize: "1.5rem" }}>👥</span>
          </div>
          <div style={cardValueStyle}>32</div>
          <p style={cardDescStyle}>+3 novos esta semana</p>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={cardTitleStyle}>Receita do Mês</span>
            <span style={{ fontSize: "1.5rem" }}>💳</span>
          </div>
          <div style={cardValueStyle}>R$ 8.450</div>
          <p style={cardDescStyle}>R$ 1.200 a receber</p>
        </div>
      </div>

      {/* Próximos Atendimentos */}
      <section style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#2C3E35", margin: "0 0 1.5rem 0", fontWeight: 400 }}>
          Próximas Sessões
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { nome: "Mariana Silva", tipo: "TCC Online", hora: "14:00", status: "Confirmado" },
            { nome: "Carlos Eduardo", tipo: "Laudo Bariátrico", hora: "15:30", status: "Pendente" },
            { nome: "RH - Tech Corp", tipo: "Consultoria B2B", hora: "17:00", status: "Confirmado" },
          ].map((ag, i) => (
            <div key={i} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "1.2rem",
              backgroundColor: "#FAF8F5",
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.03)"
            }}>
              <div>
                <div style={{ fontWeight: 600, color: "#1A1A1A", marginBottom: "0.2rem" }}>{ag.nome}</div>
                <div style={{ fontSize: "0.85rem", color: "#7A7A7A" }}>{ag.tipo}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ fontWeight: 500, color: "#9D7280" }}>{ag.hora}</div>
                <span style={{ 
                  fontSize: "0.75rem", 
                  padding: "0.3rem 0.8rem", 
                  borderRadius: "50px",
                  backgroundColor: ag.status === "Confirmado" ? "#E6F4EA" : "#FFF4E5",
                  color: ag.status === "Confirmado" ? "#1E4620" : "#663C00",
                  fontWeight: 600
                }}>
                  {ag.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "2rem",
  borderRadius: "24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
  display: "flex",
  flexDirection: "column",
  gap: "1rem"
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#7A7A7A",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const cardValueStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: "3rem",
  color: "#9D7280",
  lineHeight: 1
};

const cardDescStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.85rem",
  color: "#A0A0A0"
};
