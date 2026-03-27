export const MARKETING_IMAGE_SLOTS = [
  {
    category: "Hero",
    label: "Imagem principal",
    description: "Foto que aparece no topo da pagina inicial.",
    alt: "Foto real da psicologa em atendimento",
  },
  {
    category: "Sobre",
    label: "Foto da secao Sobre",
    description: "Foto ao lado do texto de apresentacao profissional.",
    alt: "Foto real da psicologa na secao Sobre",
  },
  {
    category: "Empresas",
    label: "Foto da secao Empresas",
    description: "Foto usada na area de atendimento corporativo.",
    alt: "Foto real para a secao de atendimento corporativo",
  },
] as const;

export type MarketingImageCategory =
  (typeof MARKETING_IMAGE_SLOTS)[number]["category"];

export const MARKETING_IMAGE_CATEGORIES = MARKETING_IMAGE_SLOTS.map(
  (slot) => slot.category,
);

export const MARKETING_VIDEO_SLOTS = [
  {
    category: "Sobre",
    label: "Sobre mim",
    title: "Como funciona a terapia online com a Mayara",
    description: "Video principal da secao Conheca meu trabalho.",
  },
  {
    category: "Empresas",
    label: "Empresas",
    title: "Psicologia corporativa - como atendo empresas",
    description: "Video da home para apresentar o atendimento corporativo.",
  },
] as const;

export type MarketingVideoCategory =
  (typeof MARKETING_VIDEO_SLOTS)[number]["category"];

export const MARKETING_VIDEO_CATEGORIES = MARKETING_VIDEO_SLOTS.map(
  (slot) => slot.category,
);

export const VIDEO_CATEGORIES = MARKETING_VIDEO_CATEGORIES;

export function isSupabaseConfigured(
  url: string | undefined,
  anonKey: string | undefined,
) {
  return Boolean(
    url &&
      anonKey &&
      url !== "https://placeholder.supabase.co" &&
      anonKey !== "placeholder",
  );
}
