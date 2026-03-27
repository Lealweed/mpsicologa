import Link from "next/link";
import styles from "./page.module.css";
import {
  MARKETING_IMAGE_CATEGORIES,
  MARKETING_IMAGE_SLOTS,
  type MarketingImageCategory,
} from "@/lib/site-media";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type MarketingImages = Record<MarketingImageCategory, string | null>;

function createEmptyMarketingImages(): MarketingImages {
  return {
    Hero: null,
    Sobre: null,
    Empresas: null,
  };
}

async function getMarketingImages(): Promise<MarketingImages> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return createEmptyMarketingImages();
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("site_media")
      .select("id, category, url")
      .in("category", MARKETING_IMAGE_CATEGORIES)
      .order("id", { ascending: false });

    if (error || !data) {
      return createEmptyMarketingImages();
    }

    const images = createEmptyMarketingImages();

    for (const item of data) {
      const category = item.category as MarketingImageCategory;

      if (category in images && !images[category]) {
        images[category] = item.url;
      }
    }

    return images;
  } catch {
    return createEmptyMarketingImages();
  }
}

function MarketingImage({
  category,
  src,
  alt,
  className,
}: {
  category: MarketingImageCategory;
  src: string | null;
  alt: string;
  className: string;
}) {
  const slot = MARKETING_IMAGE_SLOTS.find((entry) => entry.category === category);

  if (src) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div className={`${className} ${styles.imagePlaceholder}`}>
      <span className={styles.imagePlaceholderEyebrow}>Foto real pendente</span>
      <strong className={styles.imagePlaceholderTitle}>{slot?.label ?? category}</strong>
      <span className={styles.imagePlaceholderText}>
        Envie sua imagem em Dashboard &gt; Midia usando a categoria {category}.
      </span>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
// TODO: Substitua pelo número real de WhatsApp (somente dígitos com DDI)
const WHATSAPP_NUMBER = "5500000000000";
const WHATSAPP_MSG = encodeURIComponent(
  "Olá Mayara, gostaria de saber mais sobre o atendimento psicológico online."
);
const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;
const INSTAGRAM_HREF = "https://www.instagram.com/psico_mayararocha/";

// ── Icons (inline SVG) ────────────────────────────────────────────────────────
function IconVideo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 7 16 12l7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({ heroImg }: { heroImg: string | null }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden />
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
            Psicóloga Clínica · TCC · Atendimento Online
          </span>
          <h1 className={styles.heroHeading}>
            Cuidar de você é<br />
            o passo mais{" "}
            <em className={styles.heroHeadingEm}>corajoso.</em>
          </h1>
          <p className={styles.heroSubtitle}>
            Sessões de psicoterapia 100% online com uma escuta acolhedora e personalizada,
            baseada na Terapia Cognitiva Comportamental. Para você e para empresas.
          </p>
          <div className={styles.ctaRow}>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
              aria-label="Falar pelo WhatsApp com Mayara Rocha"
            >
              <IconWhatsApp />
              Falar pelo WhatsApp
            </a>
            <Link href="/auth?mode=signup" className={styles.btnOutline}>
              Agendar uma sessão
            </Link>
          </div>
        </div>

        <div className={styles.heroImageWrap}>
          <MarketingImage
            category="Hero"
            src={heroImg}
            alt="Foto principal da psicologa em atendimento"
            className={styles.heroImage}
          />
          <div className={styles.heroCredCard}>
            <strong className={styles.heroCredName}>Mayara Rocha</strong>
            <span className={styles.heroCredRole}>Psicóloga Clínica</span>
            <span className={styles.heroCredTag}>CRP · TCC · Atendimento Online</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { number: "100%", label: "Online — atendimento de onde você estiver" },
    { number: "TCC", label: "Terapia Cognitiva Comportamental" },
    { number: "B2B", label: "Também atendemos equipes e empresas" },
    { number: "Stripe", label: "Pagamento seguro em múltiplas formas" },
  ];

  return (
    <div className={styles.stats}>
      <div className={styles.statsCard}>
        {stats.map((s) => (
          <div key={s.number} className={styles.statItem}>
            <span className={styles.statNumber}>{s.number}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function AboutSection({ aboutImg }: { aboutImg: string | null }) {
  return (
    <section id="sobre" className={styles.about}>
      <div className={styles.aboutInner}>
        <div className={styles.aboutContent}>
          <span className={styles.eyebrow}>Sobre mim</span>
          <h2 className={styles.sectionHeading}>
            Uma abordagem humana, científica e focada em você.
          </h2>
          <p className={styles.aboutBio}>
            Psicóloga Clínica, me dedico a promover o bem-estar e a qualidade de vida das
            pessoas que atendo. Trabalho com a abordagem da{" "}
            <strong>Terapia Cognitiva Comportamental</strong>, uma psicoterapia que busca
            ajudar o paciente a compreender que a forma como interpretamos eventos e situações
            diárias influencia diretamente o nosso emocional e comportamentos.
          </p>
          <blockquote className={styles.aboutBioHighlight}>
            &ldquo;Suas preocupações e objetivos imediatos são meu principal interesse. Vejo a
            terapia como um processo de autodescoberta, autocompreensão e alcance de um
            estilo de vida mais gratificante.&rdquo;
          </blockquote>
          <p className={styles.aboutBio}>
            Ofereço uma abordagem pessoal e atenciosa que pode ajudar você a colocar sua
            vida em perspectiva, dar-lhe força para lidar com os desafios e, finalmente,
            manter relacionamentos felizes e saudáveis com quem você ama.
          </p>
          <div className={styles.ctaRow} style={{ marginTop: 8 }}>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              <IconWhatsApp />
              Entre em contato
            </a>
            <a
              href={INSTAGRAM_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnSecondary}
            >
              <IconInstagram />
              Ver no Instagram
            </a>
          </div>
        </div>

        <div className={styles.aboutImageWrap}>
          <MarketingImage
            category="Sobre"
            src={aboutImg}
            alt="Foto da psicologa na secao Sobre"
            className={styles.aboutImage}
          />
          <div className={styles.aboutBadge}>
            <span className={styles.aboutBadgeLabel}>Abordagem</span>
            <span className={styles.aboutBadgeValue}>TCC</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Services ──────────────────────────────────────────────────────────────────
function ServicesSection() {
  const services = [
    {
      icon: <IconVideo />,
      title: "Atendimento Online",
      desc: "Sessões individuais de psicoterapia 100% online, no conforto da sua casa. Agenda flexível, plataforma segura e uma escuta genuína.",
      note: "Sessão avulsa ou plano",
      cta: "Agendar sessão",
      href: "/auth?mode=signup",
    },
    {
      icon: <IconCalendar />,
      title: "Planos de Sessões",
      desc: "Planos personalizados para diferentes ritmos e necessidades, com pagamento facilitado via Stripe e múltiplas formas de pagamento.",
      note: "Múltiplos planos disponíveis",
      cta: "Conhecer planos",
      href: "/auth?mode=signup",
    },
    {
      icon: <IconDocument />,
      title: "Laudo Bariátrico",
      desc: "Avaliação psicológica completa para cirurgia bariátrica — intake, análise clínica e emissão de laudo em um fluxo estruturado e humanizado.",
      note: "Processo completo",
      cta: "Saiba mais",
      href: WHATSAPP_HREF,
    },
  ];

  return (
    <section id="servicos" className={styles.services}>
      <div className={styles.servicesInner}>
        <header className={styles.servicesHeader}>
          <span className={styles.eyebrow}>Serviços</span>
          <h2 className={styles.sectionHeading}>
            O apoio que você precisa, no momento certo.
          </h2>
          <p className={styles.sectionText}>
            Cada pessoa tem um ritmo único. Ofereço diferentes formas de atendimento para
            que o cuidado com a sua saúde mental caiba na sua rotina.
          </p>
        </header>

        <div className={styles.servicesGrid}>
          {services.map((s) => (
            <article key={s.title} className={styles.serviceCard}>
              <div className={styles.serviceIconWrap} aria-hidden>
                {s.icon}
              </div>
              <h3 className={styles.serviceTitle}>{s.title}</h3>
              <p className={styles.serviceDesc}>{s.desc}</p>
              <span className={styles.serviceNote}>{s.note}</span>
              <div style={{ marginTop: 4 }}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={styles.btnPrimary}
                  style={{ fontSize: 14, padding: "11px 20px" }}
                >
                  {s.cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Videos ────────────────────────────────────────────────────────────────────
function VideosSection() {
  const videos = [
    {
      label: "Sobre mim",
      title: "Como funciona a terapia online com a Mayara",
      // TODO: Substitua pelo link real do YouTube
      youtubeId: null as string | null,
    },
    {
      label: "Empresas",
      title: "Psicologia corporativa — como atendo empresas",
      // TODO: Substitua pelo link real do YouTube
      youtubeId: null as string | null,
    },
  ];

  return (
    <section className={styles.videos}>
      <div className={styles.videosGlow} aria-hidden />
      <div className={styles.videosInner}>
        <header className={styles.videosHeader}>
          <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Conheça meu trabalho</span>
          <h2 className={`${styles.sectionHeading} ${styles.sectionHeadingLight}`}>
            Veja como posso te ajudar.
          </h2>
          <p className={`${styles.sectionText} ${styles.sectionTextLight}`}>
            Nos vídeos abaixo eu explico como funciona o atendimento, minha abordagem e
            como a psicologia pode transformar sua vida — inclusive dentro das empresas.
          </p>
        </header>

        <div className={styles.videosGrid}>
          {videos.map((v) => (
            <div key={v.title} className={styles.videoCard}>
              {v.youtubeId ? (
                <iframe
                  style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                  src={`https://www.youtube.com/embed/${v.youtubeId}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className={styles.videoPlaceholder}>
                  <div className={styles.videoPlayBtn} aria-hidden>
                    <IconPlay />
                  </div>
                  <span className={styles.videoPlaceholderText}>Vídeo em breve</span>
                </div>
              )}
              <div className={styles.videoMeta}>
                <span className={styles.videoLabel}>{v.label}</span>
                <p className={styles.videoTitle}>{v.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Corporate ─────────────────────────────────────────────────────────────────
function CorporateSection({
  corporateImg,
}: {
  corporateImg: string | null;
}) {
  const items = [
    "Sessões individuais para colaboradores",
    "Grupos terapêuticos e workshops",
    "Programas de saúde mental no trabalho",
    "Suporte psicológico em mudanças organizacionais",
    "Atendimento confidencial e humanizado",
  ];

  return (
    <section id="empresas" className={styles.corporate}>
      <div className={styles.corporateInner}>
        <div className={styles.corporateContent}>
          <span className={styles.eyebrow}>Para empresas</span>
          <h2 className={styles.sectionHeading}>
            Saúde mental também é estratégia de negócio.
          </h2>
          <p className={styles.sectionText}>
            Equipes saudáveis são mais produtivas, engajadas e resilientes. Ofereço programas
            de suporte psicológico corporativo sob medida, com total sigilo e profissionalismo.
          </p>
          <ul className={styles.corporateList}>
            {items.map((item) => (
              <li key={item} className={styles.corporateListItem}>
                <span className={styles.corporateListDot} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.ctaRow} style={{ marginTop: 12 }}>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPrimary}
            >
              <IconWhatsApp />
              Falar sobre minha empresa
            </a>
          </div>
        </div>

        <div className={styles.corporateImageWrap}>
          <MarketingImage
            category="Empresas"
            src={corporateImg}
            alt="Foto da secao de atendimento corporativo"
            className={styles.corporateImage}
          />
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      text: "A terapia com a Mayara transformou a forma como eu enxergo minha vida. Me sinto muito mais forte e preparada para os desafios do dia a dia. Gratidão imensurável.",
      author: "A.M.",
      role: "34 anos, São Paulo",
      avatar: "https://i.pravatar.cc/44?u=am-sp-patient",
    },
    {
      text: "Nunca pensei que terapia online pudesse ser tão acolhedora. A Mayara tem uma escuta especial que me fez sentir segura desde o primeiro momento.",
      author: "C.S.",
      role: "28 anos, Rio de Janeiro",
      avatar: "https://i.pravatar.cc/44?u=cs-rj-patient",
    },
    {
      text: "O acompanhamento da Mayara foi fundamental para conseguir a aprovação para minha cirurgia. Processo leve, humano e muito profissional.",
      author: "F.R.",
      role: "42 anos, Belo Horizonte",
      avatar: "https://i.pravatar.cc/44?u=fr-bh-patient",
    },
  ];

  return (
    <section className={styles.testimonials}>
      <div className={styles.testimonialsInner}>
        <header className={styles.testimonialsHeader}>
          <span className={styles.eyebrow}>Depoimentos</span>
          <h2 className={styles.sectionHeading}>O que dizem meus pacientes.</h2>
          <p className={styles.sectionText}>
            Depoimentos voluntários e identificados somente com iniciais para preservar a
            privacidade de cada pessoa.
          </p>
        </header>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t) => (
            <article key={t.author} className={styles.testimonialCard}>
              <span className={styles.testimonialQuoteMark} aria-hidden>&ldquo;</span>
              <p className={styles.testimonialText}>{t.text}</p>
              <div className={styles.testimonialAuthorRow}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={`Avatar de ${t.author}`}
                  className={styles.testimonialAvatar}
                />
                <div>
                  <div className={styles.testimonialAuthor}>{t.author}</div>
                  <div className={styles.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact CTA ───────────────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section id="contato" className={styles.ctaSection}>
      <div className={styles.ctaSectionGlow} aria-hidden />
      <div className={styles.ctaSectionInner}>
        <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Vamos conversar?</span>
        <h2 className={styles.ctaSectionHeading}>
          Você não precisa passar por isso sozinha.
        </h2>
        <p className={styles.ctaSectionText}>
          Entre em contato agora mesmo. A primeira conversa é o passo mais importante —
          e eu estou aqui para te receber com acolhimento e sem julgamentos.
        </p>
        <div className={styles.ctaSectionButtons}>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
            aria-label="Falar com Mayara pelo WhatsApp"
          >
            <IconWhatsApp />
            Falar pelo WhatsApp
          </a>
          <Link href="/auth?mode=signup" className={styles.btnOutline}>
            Criar minha conta
          </Link>
        </div>
        <a
          href={INSTAGRAM_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaInstagramLink}
          aria-label="Ver Instagram de Mayara Rocha"
        >
          <IconInstagram />
          @psico_mayararocha no Instagram
        </a>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <span className={styles.footerName}>Mayara Dillyane Pereira Rocha</span>
          <span className={styles.footerCrp}>Psicóloga Clínica · CRP XX/XXXXX</span>
        </div>

        <nav className={styles.footerNav} aria-label="Links do rodapé">
          <Link href="/#sobre" className={styles.footerNavLink}>Sobre</Link>
          <Link href="/#servicos" className={styles.footerNavLink}>Serviços</Link>
          <Link href="/#empresas" className={styles.footerNavLink}>Empresas</Link>
          <Link href="/#contato" className={styles.footerNavLink}>Contato</Link>
          <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer" className={styles.footerNavLink}>Instagram</a>
          <Link href="/auth" className={styles.footerNavLink}>Área do paciente</Link>
        </nav>

        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} Mayara Rocha · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function MarketingHome() {
  const images = await getMarketingImages();
  return (
    <main>
      <HeroSection heroImg={images.Hero} />
      <StatsSection />
      <AboutSection aboutImg={images.Sobre} />
      <ServicesSection />
      <VideosSection />
      <CorporateSection corporateImg={images.Empresas} />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
