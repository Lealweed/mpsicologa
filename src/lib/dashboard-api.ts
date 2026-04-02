import { supabase } from "@/lib/supabase/client";

export type DashboardPatient = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  telefone: string;
  endereco: string;
  sexo: string;
  idade: string;
  dataNascimento: string;
  numeroSus: string;
  cpf: string;
  convenio: string;
  plano: string;
  observacoes: string;
  createdAt: string;
  portalEnabled: boolean;
};

export type DashboardAppointment = {
  id: string;
  paciente: string;
  data: string;
  hora: string;
  tipo: string;
  canal: string;
  status: string;
  observacoes: string;
  createdAt: string;
  patientId?: string;
  patientCpf?: string;
};

export type DashboardFinanceEntry = {
  id: string;
  paciente: string;
  plano: string;
  valor: number;
  data: string;
  status: "Pago" | "Pendente" | "Parcial";
  formaPagamento: string;
  referencia: string;
  observacoes: string;
  createdAt: string;
  patientId?: string;
  patientCpf?: string;
};

export type DashboardTestimonial = {
  id: string;
  author: string;
  role: string;
  location: string;
  text: string;
  imageUrl: string;
  rating: number;
  initials: string;
  active: boolean;
  order: number;
  createdAt: string;
};

type SignedUploadResponse = {
  path: string;
  token: string;
  publicUrl: string;
};

export async function fetchDashboardApi<T>(path: string, init: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers ?? {});

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
  });

  const raw = (await response.text()).trim();
  const data = raw ? (() => {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  })() : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: string }).error ?? "")
        : typeof data === "string"
          ? data
          : `Falha ao processar a solicitacao (${response.status}).`;

    throw new Error(message || `Falha ao processar a solicitacao (${response.status}).`);
  }

  return data as T;
}

export async function uploadDashboardFileToStorage(
  file: File,
  kind: "image" | "video" = "image",
) {
  const signedUploadResponse = await fetchDashboardApi<SignedUploadResponse>(
    "/api/media/upload-url",
    {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        kind,
      }),
    },
  );

  const { error } = await supabase.storage
    .from("public_media")
    .uploadToSignedUrl(signedUploadResponse.path, signedUploadResponse.token, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Nao foi possivel enviar o arquivo: ${error.message}`);
  }

  return signedUploadResponse.publicUrl;
}
