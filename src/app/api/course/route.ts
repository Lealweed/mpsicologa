import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type RegistrationPayload = {
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

const REQUIRED_FIELDS: (keyof RegistrationPayload)[] = [
  "full_name",
  "birth_date",
  "phone",
  "email",
  "fear_level",
  "symptoms",
  "expectations",
  "communication_area",
  "wants_lunch",
  "referral_source",
];

function sanitize(value: unknown): string {
  return String(value ?? "").trim();
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("course_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Falha ao carregar inscricoes: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao carregar inscricoes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RegistrationPayload>;

    const payload: RegistrationPayload = {
      full_name: sanitize(body.full_name),
      birth_date: sanitize(body.birth_date),
      phone: sanitize(body.phone),
      email: sanitize(body.email),
      profession: sanitize(body.profession),
      city: sanitize(body.city),
      fear_level: sanitize(body.fear_level),
      symptoms: Array.isArray(body.symptoms)
        ? body.symptoms.map((s) => sanitize(s)).filter(Boolean)
        : [],
      avoids_exposure: sanitize(body.avoids_exposure),
      previous_course: sanitize(body.previous_course),
      expectations: sanitize(body.expectations),
      communication_area: sanitize(body.communication_area),
      wants_lunch: sanitize(body.wants_lunch),
      referral_source: sanitize(body.referral_source),
    };

    for (const field of REQUIRED_FIELDS) {
      const value = payload[field];
      if (Array.isArray(value) ? value.length === 0 : !value) {
        return NextResponse.json(
          { error: `O campo "${field}" e obrigatorio.` },
          { status: 400 },
        );
      }
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("course_registrations")
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Falha ao salvar inscricao: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao processar inscricao.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
