import { createServerSupabase, createServiceRoleSupabase } from "@/lib/supabase/server";

export class DashboardAuthError extends Error {}

function getAccessToken(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  return authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length).trim()
    : "";
}

export async function ensureDashboardUser(request: Request) {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    throw new DashboardAuthError("Sessão inválida. Faça login novamente.");
  }

  const supabase = createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new DashboardAuthError("Não foi possível validar o usuário autenticado.");
  }

  return user;
}

export async function readSettingArray<T>(key: string): Promise<T[]> {
  const adminSupabase = createServiceRoleSupabase();
  const { data, error } = await adminSupabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    if (error.message.toLowerCase().includes("system_settings")) {
      throw new Error("O banco base ainda não foi inicializado no Supabase. Execute o SQL inicial antes de usar pacientes, agenda e financeiro.");
    }

    throw new Error(`Falha ao carregar ${key}: ${error.message}`);
  }

  return Array.isArray(data?.value) ? (data.value as T[]) : [];
}

export async function writeSettingArray<T>(key: string, items: T[]) {
  const adminSupabase = createServiceRoleSupabase();
  const { error } = await adminSupabase
    .from("system_settings")
    .upsert(
      {
        key,
        value: items,
      },
      { onConflict: "key" },
    );

  if (error) {
    if (error.message.toLowerCase().includes("system_settings")) {
      throw new Error("O banco base ainda não foi inicializado no Supabase. Execute o SQL inicial antes de salvar dados do painel.");
    }

    throw new Error(`Falha ao salvar ${key}: ${error.message}`);
  }
}
