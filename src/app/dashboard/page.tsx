"use client";

import { useEffect, useState } from "react";
import { bootstrapProfile, type BootstrapProfileResult } from "../../lib/profile/bootstrap";
import { useUser } from "../_components/UserContext";

function SectionCard({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <article
      style={{
        padding: 22,
        borderRadius: 24,
        background: "#fff",
        border: "1px solid rgba(143, 108, 79, 0.12)",
        boxShadow: "0 16px 40px rgba(56, 33, 17, 0.05)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          padding: "6px 10px",
          borderRadius: 999,
          background: "#f6ede6",
          color: "#8f6c4f",
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {badge}
      </span>
      <h3 style={{ margin: "0 0 10px", color: "#2f241d" }}>{title}</h3>
      <p style={{ margin: 0, color: "#6d584a", lineHeight: 1.6 }}>{description}</p>
    </article>
  );
}

function RoleSections({
  role,
  patientId,
}: {
  role: BootstrapProfileResult["profile"]["role"];
  patientId: string | null;
}) {
  if (role === "admin") {
    return (
      <>
        <SectionCard
          badge="Admin"
          title="Painel institucional"
          description="Sua conta já está validada. O próximo passo natural é conectar relatórios, métricas e rotinas operacionais do consultório."
        />
        <SectionCard
          badge="Governança"
          title="Próxima entrega sugerida"
          description="Criar telas para gestão de usuários, planos, pagamentos e trilhas de auditoria para fechar a operação administrativa."
        />
      </>
    );
  }

  if (role === "psychologist") {
    return (
      <>
        <SectionCard
          badge="Psicóloga"
          title="Agenda profissional"
          description="Seu acesso está pronto. Agora vale ligar este painel às tabelas de disponibilidade, pacientes e laudos para operar a rotina clínica."
        />
        <SectionCard
          badge="Atendimento"
          title="Módulos priorizados"
          description="As próximas peças de maior valor são agenda, prontuário resumido, anotações de sessão e emissão de laudos bariátricos."
        />
      </>
    );
  }

  if (role === "assistant") {
    return (
      <>
        <SectionCard
          badge="Assistente"
          title="Base operacional pronta"
          description="A conta está apta para apoiar agenda, comunicação com pacientes e organização da rotina de atendimento."
        />
        <SectionCard
          badge="Coordenação"
          title="Próximo passo sugerido"
          description="Vale abrir telas de agenda, confirmações e notificações para transformar o painel em uma central de apoio real."
        />
      </>
    );
  }

  return (
    <>
      <SectionCard
        badge="Paciente"
        title="Cadastro concluído"
        description={
          patientId
            ? "Seu perfil de paciente foi preparado com sucesso. Agora o sistema já consegue vincular planos, sessões e laudos à sua conta."
            : "Seu acesso foi criado, mas ainda falta vincular o registro clínico. Vale revisar o bootstrap no banco antes de seguir para módulos assistenciais."
        }
      />
      <SectionCard
        badge="Próximos passos"
        title="O que este painel já suporta"
        description="Login, proteção de rota, bootstrap de perfil e base para evoluir agendamentos, planos e emissão de laudos sem retrabalho na autenticação."
      />
    </>
  );
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const [result, setResult] = useState<BootstrapProfileResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user) {
      return;
    }

    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const data = await bootstrapProfile();

        if (isMounted) {
          setResult(data);
        }
      } catch (caughtError) {
        if (isMounted) {
          const message =
            caughtError instanceof Error
              ? caughtError.message
              : "Não foi possível preparar os dados do seu painel.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [userLoading, user]);

  if (userLoading || loading) {
    return <main style={{ padding: "40px 24px" }}>Preparando seu painel...</main>;
  }

  if (error) {
    return (
      <main style={{ padding: "40px 24px" }}>
        <section
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: 24,
            borderRadius: 24,
            background: "#fff3f1",
            color: "#8c3f2f",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Não conseguimos abrir o dashboard</h1>
          <p style={{ lineHeight: 1.6 }}>{error}</p>
        </section>
      </main>
    );
  }

  if (!result || !user) {
    return null;
  }

  return (
    <main style={{ padding: "40px 24px 72px" }}>
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <article
          style={{
            padding: 32,
            borderRadius: 30,
            background: "linear-gradient(135deg, rgba(143, 108, 79, 0.14), rgba(214, 176, 138, 0.28))",
            border: "1px solid rgba(143, 108, 79, 0.14)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              padding: "6px 12px",
              borderRadius: 999,
              background: "#fff",
              color: "#8f6c4f",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            {result.profile.role}
          </span>
          <h1 style={{ margin: "0 0 10px", fontSize: 36, color: "#2f241d" }}>
            Olá, {result.profile.fullName}
          </h1>
          <p style={{ margin: "0 0 12px", color: "#5f4a3d", lineHeight: 1.7, maxWidth: 760 }}>
            Seu acesso foi validado com o e-mail <strong>{user.email}</strong>. O sistema já garante autenticação,
            sessão protegida e bootstrap automático do cadastro principal.
          </p>
          {result.wasCreated && (
            <p
              style={{
                margin: 0,
                color: "#2f7a43",
                fontWeight: 600,
              }}
            >
              Seu perfil foi criado automaticamente nesta primeira entrada.
            </p>
          )}
        </article>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          <SectionCard
            badge="Sessão"
            title="Acesso protegido"
            description="As rotas públicas e privadas agora estão separadas, então o dashboard só abre para usuários autenticados."
          />
          <SectionCard
            badge="Perfil"
            title="Bootstrap automático"
            description="Ao entrar, o sistema garante perfil principal e registro de paciente quando a conta pertence ao fluxo público."
          />
          <SectionCard
            badge="Base"
            title="Pronto para evoluir"
            description="A partir daqui dá para encaixar agendas, planos, pagamentos e laudos em cima de uma autenticação estável."
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          <RoleSections role={result.profile.role} patientId={result.patientId} />
        </section>
      </section>
    </main>
  );
}
