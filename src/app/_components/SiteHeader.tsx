"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { useUser } from "./UserContext";

const headerStyles = {
  shell: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(18px)",
    background: "rgba(250, 246, 240, 0.92)",
    borderBottom: "1px solid rgba(78, 55, 36, 0.12)",
  } as const,
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "18px 24px",
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
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #8f6c4f, #d6b08a)",
    color: "#fff",
    fontWeight: 700,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap" as const,
    color: "#5c4739",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  secondaryAction: {
    border: "1px solid rgba(78, 55, 36, 0.16)",
    background: "#fff",
    color: "#5c4739",
    borderRadius: 999,
    padding: "10px 16px",
    fontWeight: 600,
    textDecoration: "none",
  },
  primaryAction: {
    border: "none",
    background: "linear-gradient(135deg, #8f6c4f, #c68e61)",
    color: "#fff",
    borderRadius: 999,
    padding: "10px 18px",
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
  },
  subtle: {
    fontSize: 14,
    color: "#7a6557",
  },
};

export default function SiteHeader() {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const marketingHref = pathname === "/" ? "#planos" : "/#planos";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  return (
    <header style={headerStyles.shell}>
      <div style={headerStyles.container}>
        <Link href="/" style={headerStyles.brand}>
          <span style={headerStyles.mark}>DP</span>
          <span>
            <strong style={{ display: "block", fontSize: 17 }}>Dra. Psicóloga</strong>
            <span style={headerStyles.subtle}>Atendimento online, laudos e gestão de pacientes</span>
          </span>
        </Link>

        <nav style={headerStyles.nav}>
          <Link href="/" style={{ textDecoration: "none" }}>
            Início
          </Link>
          <Link href={marketingHref} style={{ textDecoration: "none" }}>
            Planos
          </Link>
          <Link href="/#laudos" style={{ textDecoration: "none" }}>
            Laudos
          </Link>
          <Link href="/#contato" style={{ textDecoration: "none" }}>
            Contato
          </Link>
        </nav>

        <div style={headerStyles.actions}>
          {!loading && user ? (
            <>
              {!isDashboard && (
                <Link href="/dashboard" style={headerStyles.secondaryAction}>
                  Dashboard
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
              <Link href="/auth?mode=signup" style={headerStyles.primaryAction}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
