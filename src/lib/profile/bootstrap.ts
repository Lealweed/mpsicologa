import type { user_role } from "../../types/database";
import { supabase } from "../supabase/client";

export interface BootstrapProfileResult {
  profile: {
    id: string;
    role: user_role;
    fullName: string;
  };
  patientId: string | null;
  wasCreated: boolean;
}

export async function bootstrapProfile({
  fullName,
}: {
  fullName?: string;
} = {}): Promise<BootstrapProfileResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sua sessão expirou. Entre novamente para continuar.");
  }

  const response = await fetch("/api/profile/bootstrap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      fullName,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | BootstrapProfileResult
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(data && "error" in data && data.error ? data.error : "Não foi possível preparar seu perfil.");
  }

  return data as BootstrapProfileResult;
}
