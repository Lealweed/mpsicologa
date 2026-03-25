"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { name: "Visão Geral", path: "/dashboard", icon: "📊" },
    { name: "Pacientes", path: "/dashboard/pacientes", icon: "👥" },
    { name: "Agenda", path: "/dashboard/agenda", icon: "📅" },
    { name: "Financeiro", path: "/dashboard/financeiro", icon: "💳" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAF8F5", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: "260px",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        padding: "2rem 1.5rem"
      }}>
        <div style={{ marginBottom: "3rem", paddingLeft: "0.5rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#9D7280", margin: 0, fontSize: "1.2rem" }}>
            Mayara Rocha
          </h2>
          <p style={{ color: "#A0A0A0", fontSize: "0.8rem", margin: "0.2rem 0 0 0" }}>Painel Clínico</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          {links.map(link => {
            const active = pathname === link.path;
            return (
              <Link key={link.path} href={link.path} style={{
                textDecoration: "none",
                color: active ? "#9D7280" : "#5A5A5A",
                backgroundColor: active ? "#F3EAE6" : "transparent",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: active ? 600 : 400,
                transition: "all 0.2s"
              }}>
                <span>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <Link href="/" style={{
          textDecoration: "none",
          color: "#9D7280",
          padding: "0.8rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          paddingTop: "1.5rem"
        }}>
          <span>⬅️</span> Sair
        </Link>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "3rem 4rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
