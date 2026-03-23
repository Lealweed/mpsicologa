"use client";
import { useUser } from "./UserContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthRoute = pathname === "/auth";

  useEffect(() => {
    if (!loading && !user && isDashboardRoute) {
      router.replace("/auth");
    }
    if (!loading && user && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [user, loading, isDashboardRoute, isAuthRoute, router]);

  if (isDashboardRoute) {
    if (loading) return <p style={{ padding: 32 }}>Carregando seu acesso...</p>;
    if (!user) return null;
  }

  if (isAuthRoute) {
    if (loading) return <p style={{ padding: 32 }}>Validando sua sessão...</p>;
    if (user) return null;
  }

  return <>{children}</>;
}
