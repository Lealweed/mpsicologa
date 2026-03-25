"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { useUser } from "./UserContext";

// TODO: Substitua pelo número real de WhatsApp (somente dígitos com DDI)
const WHATSAPP_NUMBER = "5500000000000";
const WHATSAPP_MSG = encodeURIComponent(
  "Olá Mayara, gostaria de saber mais sobre o atendimento psicológico online."
);
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

const headerStyles = {
  shell: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(18px)",
    background: "rgba(250, 248, 245, 0.94)",
    borderBottom: "1px solid rgba(157, 114, 128, 0.12)",
  } as const,
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap" as const,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#2f241d",
    textDecoration: "none",
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #9D7280, #C8A89B)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: "0em",
  },
  brandName: {
    display: "block" as const,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Playfair Display', Georgia, serif",
    lineHeight: 1.1,
  },
  brandSub: {
    display: "block" as const,
    fontSize: 12,
    color: "#7a6557",
    fontWeight: 500,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap" as const,
  },
  navLink: {
    textDecoration: "none",
    color: "#5E4E52",
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.04em",
    padding: "6px 12px",
    borderRadius: 999,
    transition: "background 0.15s, color 0.15s",
  } as const,
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  secondaryAction: {
    border: "1px solid rgba(157, 114, 128, 0.2)",
    background: "#fff",
    color: "#5E4E52",
    borderRadius: 999,
    padding: "9px 16px",
    fontWeight: 500,
    fontSize: 13,
    letterSpacing: "0.03em",
    textDecoration: "none",
  },
  primaryAction: {
    border: "none",
    background: "linear-gradient(135deg, #9D7280, #C8A89B)",
    color: "#fff",
    borderRadius: 999,
    padding: "9px 18px",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: "0.03em",
    textDecoration: "none",
    cursor: "pointer",
  },
};

export default function SiteHeader() {

  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isHome = pathname === "/" || pathname === "/marketing";

  // Buscar o papel do usuário autenticado (psicóloga, paciente, etc)
  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        return;
      }
      try {
        const res = await fetch("/api/profile/bootstrap");
        if (!res.ok) return;
        const data = await res.json();
        setRole(data?.profile?.role ?? null);
      } catch {
        setRole(null);
      }
    }
    fetchRole();
  }, [user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  return (
    <header style={headerStyles.shell}>
      <div style={headerStyles.container}>
        <Link href="/" style={headerStyles.brand}>
          <span style={headerStyles.mark}>MR</span>
          <span>
            <strong style={headerStyles.brandName}>Mayara Rocha</strong>
            <span style={headerStyles.brandSub}>Psicóloga Clínica · TCC · Online</span>
          </span>
        </Link>

        <nav style={headerStyles.nav}>
          <Link href="/" style={headerStyles.navLink}>Início</Link>
          <Link href="/#sobre" style={headerStyles.navLink}>Sobre</Link>
          <Link href="/#servicos" style={headerStyles.navLink}>Serviços</Link>
          <Link href="/#empresas" style={headerStyles.navLink}>Empresas</Link>
          <Link href="/#contato" style={headerStyles.navLink}>Contato</Link>
        </nav>

        <div style={headerStyles.actions}>
          {!loading && user ? (
            <>
              {!isDashboard && (
                <Link href="/dashboard" style={headerStyles.secondaryAction}>
                  {role === "psychologist" ? "Painel da Doutora" : "Minha conta"}
                </Link>
              )}
              <button type="button" onClick={handleSignOut} style={headerStyles.primaryAction}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" style={headerStyles.secondaryAction}>
                Entrar
              </Link>
              <a
                href={isHome ? "#contato" : WHATSAPP_HREF}
                target={isHome ? "_self" : "_blank"}
                rel="noopener noreferrer"
                style={headerStyles.primaryAction}
              >
                Agendar
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
