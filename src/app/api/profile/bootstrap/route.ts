import { NextResponse } from "next/server";
import type { user_role } from "../../../../types/database";
import { createServerSupabase, createServiceRoleSupabase } from "../../../../lib/supabase/server";

interface ProfileRecord {
  id: string;
  role: user_role;
  full_name: string;
}

function resolveFullName(rawName: unknown, fallbackEmail?: string | null) {
  if (typeof rawName === "string" && rawName.trim()) {
    return rawName.trim();
  }

  if (fallbackEmail) {
    return fallbackEmail.split("@")[0];
  }

  return "Paciente";
}

export async function POST(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  const accessToken = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Sessão inválida. Faça login novamente." }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const adminSupabase = createServiceRoleSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    return NextResponse.json({ error: "Não foi possível validar o usuário autenticado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { fullName?: string };
  const requestedFullName =
    typeof body.fullName === "string" && body.fullName.trim() ? body.fullName.trim() : null;
  const metadataFullName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : null;
  const preferredFullName = resolveFullName(requestedFullName ?? metadataFullName, user.email);

  const { data: existingProfile, error: profileLookupError } = await adminSupabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileLookupError) {
    return NextResponse.json({ error: "Falha ao localizar o perfil principal do usuário." }, { status: 500 });
  }

  let profile = existingProfile as ProfileRecord | null;
  let wasCreated = false;

  if (!profile) {
    const { data: createdProfile, error: createProfileError } = await adminSupabase
      .from("profiles")
      .insert({
        user_id: user.id,
        role: "patient",
        full_name: preferredFullName,
      })
      .select("id, role, full_name")
      .single();

    if (createProfileError || !createdProfile) {
      return NextResponse.json({ error: "Falha ao criar o perfil principal do usuário." }, { status: 500 });
    }

    profile = createdProfile as ProfileRecord;
    wasCreated = true;
  } else if ((requestedFullName || metadataFullName) && profile.full_name !== preferredFullName) {
    const { data: updatedProfile, error: updateProfileError } = await adminSupabase
      .from("profiles")
      .update({
        full_name: preferredFullName,
      })
      .eq("id", profile.id)
      .select("id, role, full_name")
      .single();

    if (updateProfileError || !updatedProfile) {
      return NextResponse.json({ error: "Falha ao atualizar o nome do perfil." }, { status: 500 });
    }

    profile = updatedProfile as ProfileRecord;
  }

  let patientId: string | null = null;

  if (profile.role === "patient") {
    const { data: existingPatient, error: patientLookupError } = await adminSupabase
      .from("patients")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (patientLookupError) {
      return NextResponse.json({ error: "Falha ao localizar o cadastro de paciente." }, { status: 500 });
    }

    if (existingPatient?.id) {
      patientId = existingPatient.id;
    } else {
      const { data: createdPatient, error: createPatientError } = await adminSupabase
        .from("patients")
        .insert({
          profile_id: profile.id,
        })
        .select("id")
        .single();

      if (createPatientError || !createdPatient) {
        return NextResponse.json({ error: "Falha ao criar o cadastro clínico de paciente." }, { status: 500 });
      }

      patientId = createdPatient.id;
    }
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      role: profile.role,
      fullName: profile.full_name,
    },
    patientId,
    wasCreated,
  });
}
