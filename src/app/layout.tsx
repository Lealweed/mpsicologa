import "./globals.css";
import type { ReactNode } from "react";
import ProtectedRoute from "./_components/ProtectedRoute";
import SiteHeader from "./_components/SiteHeader";
import { UserProvider } from "./_components/UserContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <UserProvider>
          <SiteHeader />
          <ProtectedRoute>{children}</ProtectedRoute>
        </UserProvider>
      </body>
    </html>
  );
}
