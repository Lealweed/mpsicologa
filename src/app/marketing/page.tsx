import Link from "next/link";

const heroHighlights = [
  "Psicoterapia online com fluxo simples para paciente",
  "Laudos bariátricos com trilha clara de acompanhamento",
  "Base preparada para evoluir agenda, pagamentos e prontuário",
];

const planCards = [
  {
    name: "Sessão avulsa",
    detail: "Entrada rápida para quem quer começar o atendimento sem compromisso recorrente.",
    note: "Valores liberados após login",
  },
  {
    name: "Acompanhamento mensal",
    detail: "Fluxo pensado para pacientes em acompanhamento contínuo com controle de sessões.",
    note: "Ideal para recorrência",
  },
  {
    name: "Laudo bariátrico",
    detail: "Cadastro, intake, avaliação psicológica e emissão de laudo em um fluxo único.",
    note: "Estrutura pronta para digitalizar a jornada",
  },
];

const contactCards = [
  {
    title: "Para pacientes",
    text: "Crie sua conta para acompanhar seu acesso, futuras sessões e documentos.",
  },
  {
    title: "Para a operação clínica",
    text: "O sistema já separa área pública, autenticação e dashboard privado para a próxima fase do produto.",
  },
  {
    title: "Para expansão",
    text: "A base de dados já contempla planos, agenda, financeiro, notificações e bariátrica.",
  },
];

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header style={{ maxWidth: 720 }}>
      <span
        style={{
          display: "inline-flex",
          padding: "6px 12px",
          borderRadius: 999,
          background: "#f7ede5",
          color: "#8f6c4f",
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        {eyebrow}
      </span>
      <h2 style={{ margin: "0 0 12px", fontSize: 36, color: "#2f241d" }}>{title}</h2>
      <p style={{ margin: 0, color: "#6d584a", lineHeight: 1.7 }}>{description}</p>
    </header>
  );
}

export default function MarketingHome() {
  return (
    <main>
      <section
        style={{
          padding: "72px 24px 48px",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 28,
            alignItems: "stretch",
          }}
        >
          <article
            style={{
              padding: 36,
              borderRadius: 36,
              background: "linear-gradient(135deg, rgba(143, 108, 79, 0.16), rgba(214, 176, 138, 0.32))",
              border: "1px solid rgba(143, 108, 79, 0.12)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                padding: "7px 14px",
                borderRadius: 999,
                background: "#fff",
                color: "#8f6c4f",
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              Plataforma clínica
            </span>
            <h1 style={{ margin: "0 0 16px", fontSize: 48, lineHeight: 1.05, color: "#2f241d" }}>
              Atendimento psicológico com uma base digital pronta para crescer.
            </h1>
            <p style={{ margin: "0 0 24px", color: "#5f4a3d", lineHeight: 1.75, fontSize: 18 }}>
              Este sistema já entrega área pública, cadastro de pacientes, autenticação com Supabase, bootstrap
              automático de perfil e um dashboard protegido para servir de base à operação clínica.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/auth?mode=signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 22px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontWeight: 700,
                  background: "#8f6c4f",
                  color: "#fff",
                }}
              >
                Criar conta de paciente
              </Link>
              <Link
                href="/auth"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 22px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontWeight: 700,
                  background: "#fff",
                  color: "#5c4739",
                  border: "1px solid rgba(143, 108, 79, 0.14)",
                }}
              >
                Entrar no dashboard
              </Link>
            </div>
          </article>

          <article
            style={{
              padding: 32,
              borderRadius: 36,
              background: "#2f241d",
              color: "#f9f3ed",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "auto -40px -60px auto",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 68%)",
              }}
            />
            <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 28 }}>O que já está funcional hoje</h2>
            <div style={{ display: "grid", gap: 14 }}>
              {heroHighlights.map((highlight) => (
                <div
                  key={highlight}
                  style={{
                    padding: "16px 18px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    lineHeight: 1.6,
                  }}
                >
                  {highlight}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section
        id="planos"
        style={{
          padding: "32px 24px 72px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 28 }}>
          <SectionTitle
            eyebrow="Planos"
            title="Modelos de atendimento prontos para virar produto"
            description="Os módulos de plano, preço, assinatura e controle de sessões já existem na modelagem do banco. A área pública agora apresenta essa oferta de forma coerente com o estágio do sistema."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {planCards.map((plan) => (
              <article
                key={plan.name}
                style={{
                  padding: 24,
                  borderRadius: 26,
                  background: "#fff",
                  border: "1px solid rgba(143, 108, 79, 0.12)",
                  boxShadow: "0 18px 40px rgba(56, 33, 17, 0.05)",
                }}
              >
                <h3 style={{ margin: "0 0 10px", color: "#2f241d" }}>{plan.name}</h3>
                <p style={{ margin: "0 0 14px", color: "#6d584a", lineHeight: 1.7 }}>{plan.detail}</p>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#f7ede5",
                    color: "#8f6c4f",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {plan.note}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="laudos"
        style={{
          padding: "0 24px 72px",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: 32,
            borderRadius: 36,
            background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(247, 237, 229, 0.96))",
            border: "1px solid rgba(143, 108, 79, 0.12)",
          }}
        >
          <SectionTitle
            eyebrow="Laudos"
            title="Jornada bariátrica estruturada desde o banco até o produto"
            description="A modelagem já contempla intake, avaliação, emissão de relatório e anexos. Nesta fase, o sistema já prepara o acesso do paciente e deixa o caminho pronto para encaixar as telas clínicas."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
              marginTop: 28,
            }}
          >
            {[
              ["1", "Cadastro", "Paciente cria a conta e entra no ecossistema seguro do consultório."],
              ["2", "Avaliação", "A próxima entrega natural é conectar o formulário e o fluxo de análise psicológica."],
              ["3", "Laudo", "A estrutura de dados já permite evoluir para emissão e histórico de versões."],
            ].map(([step, title, text]) => (
              <article
                key={step}
                style={{
                  padding: 24,
                  borderRadius: 24,
                  background: "#fff",
                  border: "1px solid rgba(143, 108, 79, 0.12)",
                }}
              >
                <span
                  style={{
                    display: "inline-grid",
                    placeItems: "center",
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: "#8f6c4f",
                    color: "#fff",
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  {step}
                </span>
                <h3 style={{ margin: "0 0 10px", color: "#2f241d" }}>{title}</h3>
                <p style={{ margin: 0, color: "#6d584a", lineHeight: 1.7 }}>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contato"
        style={{
          padding: "0 24px 84px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 28 }}>
          <SectionTitle
            eyebrow="Contato"
            title="Uma base mais sólida para continuar o produto"
            description="Em vez de depender de links externos e assets ausentes, esta versão deixa a área pública conectada diretamente ao fluxo real de cadastro e acesso do sistema."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {contactCards.map((card) => (
              <article
                key={card.title}
                style={{
                  padding: 24,
                  borderRadius: 24,
                  background: "#fff",
                  border: "1px solid rgba(143, 108, 79, 0.12)",
                }}
              >
                <h3 style={{ margin: "0 0 10px", color: "#2f241d" }}>{card.title}</h3>
                <p style={{ margin: 0, color: "#6d584a", lineHeight: 1.7 }}>{card.text}</p>
              </article>
            ))}
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link
              href="/auth?mode=signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 22px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 700,
                background: "#8f6c4f",
                color: "#fff",
              }}
            >
              Começar agora
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 22px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 700,
                background: "#fff",
                color: "#5c4739",
                border: "1px solid rgba(143, 108, 79, 0.14)",
              }}
            >
              Abrir dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
