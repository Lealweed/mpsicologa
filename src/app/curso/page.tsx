"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, Coffee, CheckCircle, Send } from "lucide-react";
import styles from "./curso.module.css";

/* ── Types ── */
type FormData = {
  full_name: string;
  birth_date: string;
  phone: string;
  email: string;
  profession: string;
  city: string;
  fear_level: string;
  symptoms: string[];
  avoids_exposure: string;
  previous_course: string;
  expectations: string;
  communication_area: string;
  wants_lunch: string;
  referral_source: string;
};

const BLANK: FormData = {
  full_name: "",
  birth_date: "",
  phone: "",
  email: "",
  profession: "",
  city: "",
  fear_level: "",
  symptoms: [],
  avoids_exposure: "",
  previous_course: "",
  expectations: "",
  communication_area: "",
  wants_lunch: "",
  referral_source: "",
};

const SYMPTOM_OPTIONS = [
  "Tremores",
  "Sudorese",
  "Respiração acelerada",
  "Coração acelerado",
  "Branco na mente",
  "Voz trêmula",
  "Já tive crise de pânico em situação de exposição",
  "Nenhum desses",
];

const FEAR_LEVELS = ["Não", "Leve", "Moderado", "Intenso"];
const EXPOSURE_OPTIONS = ["Sim", "Não", "Às vezes"];
const LUNCH_OPTIONS = ["Sim", "Não"];
const AREA_OPTIONS = [
  "Internet / Redes sociais",
  "Palestras e apresentações presenciais",
  "Reuniões e ambiente corporativo",
  "Todas as opções",
];
const SOURCE_OPTIONS = [
  "Indicação de amigo(a)",
  "Instagram",
  "WhatsApp",
  "Outro",
];

/* ── Icons ── */
function IconBrain() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.58.7 3 1.8 4L12 21l6.2-9.5A5.49 5.49 0 0 0 20 7.5 5.5 5.5 0 0 0 14.5 2h-5z" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

/* ── Hero ── */
function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden />
      <div className={styles.heroInner}>
        <span className={styles.eyebrow}>Pré-inscrição</span>
        <h1 className={styles.heroHeading}>
          Curso de Oratória —<br />
          <em className={styles.heroHeadingEm}>Comunicação que Transforma.</em>
        </h1>
        <p className={styles.heroSubtitle}>
          Desenvolva sua comunicação com apoio de profissionais especializados.
          Supere o medo de falar em público e transforme sua presença pessoal e profissional.
        </p>
        <div className={styles.heroDetails}>
          <span className={styles.heroDetail}>
            <span className={styles.heroDetailIcon}><CalendarDays size={16} /></span>
            Maio (sábado)
          </span>
          <span className={styles.heroDetail}>
            <span className={styles.heroDetailIcon}><Clock size={16} /></span>
            Manhã e Tarde
          </span>
          <span className={styles.heroDetail}>
            <span className={styles.heroDetailIcon}><Coffee size={16} /></span>
            Café da manhã incluso
          </span>
        </div>
        <a href="#inscricao" className={styles.heroCta}>
          Fazer pré-inscrição
        </a>
      </div>
    </section>
  );
}

/* ── Professionals ── */
function ProfessionalsSection() {
  const professionals = [
    {
      icon: <IconBrain />,
      title: "Psicóloga",
      desc: "Comunicação para sucesso pessoal e profissional, controle da ansiedade e do medo de falar em público.",
    },
    {
      icon: <IconImage />,
      title: "Consultora de Imagem",
      desc: "Imagem, autoestima, autoconfiança e credibilidade na comunicação.",
    },
    {
      icon: <IconMic />,
      title: "Produtor Audiovisual",
      desc: "Comunicação estratégica e posicionamento para redes sociais.",
    },
  ];

  return (
    <section className={styles.professionals}>
      <div className={styles.profInner}>
        <header className={styles.profHeader}>
          <span className={styles.eyebrowDark}>Profissionais participantes</span>
          <h2 className={styles.sectionHeading}>
            Uma equipe multidisciplinar ao seu lado.
          </h2>
          <p className={styles.sectionText}>
            Três profissionais com expertise complementar para uma formação completa em comunicação.
          </p>
        </header>
        <div className={styles.profGrid}>
          {professionals.map((p) => (
            <article key={p.title} className={styles.profCard}>
              <div className={styles.profIconWrap} aria-hidden>{p.icon}</div>
              <h3 className={styles.profTitle}>{p.title}</h3>
              <p className={styles.profDesc}>{p.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Investment ── */
function InvestmentSection() {
  return (
    <section className={styles.investment}>
      <div className={styles.investInner}>
        <span className={styles.eyebrowDark}>Investimento</span>
        <p className={styles.investValue}>R$ 500,00</p>
        <p className={styles.investNote}>
          Pré-inscrição com pagamento de <span className={styles.investHighlight}>50% (R$ 250,00)</span> para
          garantir sua vaga. O valor restante deverá ser quitado até 20 dias antes da data do curso.
          Vagas limitadas.
        </p>
        <div className={styles.pixBox}>
          <span className={styles.pixLabel}>Pix (CNPJ):</span>
          <span className={styles.pixValue}>59505938000106</span>
        </div>
        <p className={styles.investNote} style={{ marginTop: 12 }}>
          Após o pagamento, envie o comprovante para o WhatsApp: <span className={styles.investHighlight}>(94) 99233-6191</span>.
          A vaga será confirmada somente após o envio do comprovante.
        </p>
      </div>
    </section>
  );
}

/* ── Form ── */
function FormSection() {
  const [form, setForm] = useState<FormData>(BLANK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSymptom(symptom: string) {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || "Falha ao enviar inscrição.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar inscrição.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className={styles.successSection}>
        <div className={styles.successIcon}>
          <CheckCircle size={36} />
        </div>
        <h2 className={styles.successHeading}>Pré-inscrição enviada!</h2>
        <p className={styles.successText}>
          Obrigada pelo seu interesse! Lembre-se de enviar o comprovante do Pix para o
          WhatsApp (94) 99233-6191 para confirmar sua vaga.
        </p>
        <Link href="/" className={styles.backLink}>
          Voltar ao site
        </Link>
      </section>
    );
  }

  return (
    <section id="inscricao" className={styles.formSection}>
      <div className={styles.formInner}>
        <header className={styles.formHeader}>
          <span className={styles.eyebrowDark}>Formulário</span>
          <h2 className={styles.sectionHeading}>Preencha sua pré-inscrição</h2>
          <p className={styles.sectionText}>
            Todos os campos marcados com * são obrigatórios.
          </p>
        </header>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Dados pessoais */}
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>
                Nome completo <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={form.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Data de nascimento <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                className={styles.input}
                value={form.birth_date}
                onChange={(e) => updateField("birth_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>
                Telefone (WhatsApp) <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                className={styles.input}
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                E-mail <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                className={styles.input}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>Profissão</label>
              <input
                type="text"
                className={styles.input}
                value={form.profession}
                onChange={(e) => updateField("profession", e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Cidade</label>
              <input
                type="text"
                className={styles.input}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
          </div>

          {/* Medo de falar em público */}
          <div className={styles.field}>
            <label className={styles.label}>
              Você sente medo ou desconforto ao falar em público? <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              {FEAR_LEVELS.map((level) => (
                <label key={level} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="fear_level"
                    value={level}
                    checked={form.fear_level === level}
                    onChange={() => updateField("fear_level", level)}
                    required
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          {/* Sintomas */}
          <div className={styles.field}>
            <label className={styles.label}>
              Ao falar em público, você já apresentou algum dos sintomas abaixo? <span className={styles.required}>*</span>
            </label>
            <div className={styles.checkGroup}>
              {SYMPTOM_OPTIONS.map((symptom) => (
                <label key={symptom} className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={form.symptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                  />
                  {symptom}
                </label>
              ))}
            </div>
          </div>

          {/* Evita exposição */}
          <div className={styles.field}>
            <label className={styles.label}>
              Você evita situações que envolvam apresentações ou exposição?
            </label>
            <div className={styles.radioGroup}>
              {EXPOSURE_OPTIONS.map((opt) => (
                <label key={opt} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="avoids_exposure"
                    value={opt}
                    checked={form.avoids_exposure === opt}
                    onChange={() => updateField("avoids_exposure", opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Curso anterior */}
          <div className={styles.field}>
            <label className={styles.label}>
              Já realizou algum curso de oratória ou comunicação?
            </label>
            <div className={styles.radioGroup}>
              {["Sim", "Não"].map((opt) => (
                <label key={opt} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="previous_course"
                    value={opt}
                    checked={form.previous_course === opt}
                    onChange={() => updateField("previous_course", opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Expectativas */}
          <div className={styles.field}>
            <label className={styles.label}>
              O que você espera desenvolver ou superar com este curso? <span className={styles.required}>*</span>
            </label>
            <textarea
              className={styles.textarea}
              value={form.expectations}
              onChange={(e) => updateField("expectations", e.target.value)}
              required
            />
          </div>

          {/* Área de comunicação */}
          <div className={styles.field}>
            <label className={styles.label}>
              Em qual área deseja se aperfeiçoar por meio da comunicação? <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              {AREA_OPTIONS.map((opt) => (
                <label key={opt} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="communication_area"
                    value={opt}
                    checked={form.communication_area === opt}
                    onChange={() => updateField("communication_area", opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Almoço */}
          <div className={styles.field}>
            <label className={styles.label}>
              Deseja almoçar no local? <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              {LUNCH_OPTIONS.map((opt) => (
                <label key={opt} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="wants_lunch"
                    value={opt}
                    checked={form.wants_lunch === opt}
                    onChange={() => updateField("wants_lunch", opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Como soube */}
          <div className={styles.field}>
            <label className={styles.label}>
              Como ficou sabendo do curso? <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              {SOURCE_OPTIONS.map((opt) => (
                <label key={opt} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="referral_source"
                    value={opt}
                    checked={form.referral_source === opt}
                    onChange={() => updateField("referral_source", opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className={styles.submitRow}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              <Send size={16} />
              {loading ? "Enviando..." : "Enviar pré-inscrição"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ── Page ── */
export default function CursoPage() {
  return (
    <main>
      <HeroSection />
      <ProfessionalsSection />
      <InvestmentSection />
      <FormSection />
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Mayara Rocha · Psicóloga Clínica ·{" "}
          <Link href="/" className={styles.footerLink}>Voltar ao site</Link>
        </p>
      </footer>
    </main>
  );
}
