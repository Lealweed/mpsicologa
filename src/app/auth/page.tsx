"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bootstrapProfile } from "../../lib/profile/bootstrap";
import { supabase } from "../../lib/supabase/client";
import { useUser } from "../_components/UserContext";

type AuthMode = "signin" | "signup";

const shellStyle = {
  maxWidth: 480,
  margin: "56px auto",
  padding: 32,
  background: "rgba(255, 255, 255, 0.94)",
  borderRadius: 28,
  boxShadow: "0 20px 60px rgba(56, 33, 17, 0.08)",
  border: "1px solid rgba(143, 108, 79, 0.12)",
};

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMode(searchParams.get("mode") === "signup" ? "signup" : "signin");
  }, [searchParams]);

  useEffect(() => {
    if (!userLoading && user) {
      router.replace("/dashboard");
    }
  }, [userLoading, user, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const trimmedName = fullName.trim();

        if (!trimmedName) {
          throw new Error("Informe seu nome completo para criar a conta.");
        }

        if (password.length < 6) {
          throw new Error("Use uma senha com pelo menos 6 caracteres.");
        }

        if (password !== confirmPassword) {
          throw new Error("A confirmação de senha não confere.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: trimmedName,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          await bootstrapProfile({ fullName: trimmedName });
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        setSuccess("Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre no painel.");
        setPassword("");
        setConfirmPassword("");
        setMode("signin");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      await bootstrapProfile();
      router.replace("/dashboard");
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Não foi possível concluir a autenticação.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "32px 20px 72px" }}>
      <section style={shellStyle}>
        <span
          style={{
            display: "inline-flex",
            padding: "6px 12px",
            borderRadius: 999,
            background: "#f7ede5",
            color: "#8f6c4f",
            fontWeight: 700,
            marginBottom: 18,
          }}
        >
          Portal da paciente
        </span>
        <h1 style={{ margin: "0 0 10px", fontSize: 34, color: "#2f241d" }}>
          {mode === "signin" ? "Entrar no sistema" : "Criar sua conta"}
        </h1>
        <p style={{ margin: "0 0 24px", color: "#6d584a", lineHeight: 1.6 }}>
          {mode === "signin"
            ? "Acesse seu painel para acompanhar sessões, laudos e próximos passos."
            : "O cadastro público cria uma conta de paciente pronta para você acompanhar seu atendimento."}
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setMode("signin")}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 14,
              border: mode === "signin" ? "none" : "1px solid rgba(143, 108, 79, 0.18)",
              background: mode === "signin" ? "#8f6c4f" : "#fff",
              color: mode === "signin" ? "#fff" : "#6d584a",
              fontWeight: 700,
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 14,
              border: mode === "signup" ? "none" : "1px solid rgba(143, 108, 79, 0.18)",
              background: mode === "signup" ? "#8f6c4f" : "#fff",
              color: mode === "signup" ? "#fff" : "#6d584a",
              fontWeight: 700,
            }}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "signup" && (
            <label>
              Nome completo
              <input
                type="text"
                placeholder="Como você gostaria de aparecer no sistema"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required={mode === "signup"}
              />
            </label>
          )}

          <label>
            E-mail
            <input
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {mode === "signup" && (
            <label>
              Confirmar senha
              <input
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required={mode === "signup"}
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              border: "none",
              borderRadius: 16,
              padding: "14px 18px",
              background: "linear-gradient(135deg, #8f6c4f, #c68e61)",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {loading
              ? "Processando..."
              : mode === "signin"
                ? "Entrar no painel"
                : "Criar conta de paciente"}
          </button>
        </form>

        {error && (
          <p
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 14,
              background: "#fff3f1",
              color: "#b54531",
            }}
          >
            {error}
          </p>
        )}

        {success && (
          <p
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 14,
              background: "#eef8f0",
              color: "#2f7a43",
            }}
          >
            {success}
          </p>
        )}
      </section>
    </main>
  );
}
