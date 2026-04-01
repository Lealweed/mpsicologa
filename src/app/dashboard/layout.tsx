"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, Wallet, LogOut, Images, GraduationCap } from "lucide-react";
import { useUser } from "../_components/UserContext";
import { supabase } from "../../lib/supabase/client";
import styles from "./layout.module.css";

const navLinks = [
  { name: "Visão Geral", path: "/dashboard", icon: LayoutDashboard },
  { name: "Pacientes", path: "/dashboard/pacientes", icon: Users },
  { name: "Agenda", path: "/dashboard/agenda", icon: CalendarDays },
  { name: "Financeiro", path: "/dashboard/financeiro", icon: Wallet },
  { name: "Mídia", path: "/dashboard/midia", icon: Images },
  { name: "Inscrições", path: "/dashboard/inscricoes", icon: GraduationCap },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ??
    user?.email?.slice(0, 2).toUpperCase() ??
    "MR";

  return (
    <div className={styles.dashboardRoot}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <div className={styles.brandMark}>MR</div>
          <div>
            <div className={styles.brandName}>Mayara Rocha</div>
            <div className={styles.brandSub}>Painel Clínico</div>
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.sidebarNav}>
          {navLinks.map((link) => {
            const active = pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>Dra. Mayara</div>
              <div className={styles.userRole}>Psicóloga Clínica</div>
            </div>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.dashboardContent}>{children}</main>
    </div>
  );
}
