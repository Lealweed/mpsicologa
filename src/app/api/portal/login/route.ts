import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { cpf, pin } = await req.json();
  if (!cpf || !pin) {
    return NextResponse.json({ error: 'CPF e PIN obrigatórios.' }, { status: 400 });
  }
  const supabase = createClient();
  // Chama a função RPC do banco
  const { data, error } = await supabase.rpc('login_patient_portal', { p_cpf: cpf, p_pin: pin });
  if (error || !data || !data.session_token) {
    return NextResponse.json({ error: 'Login inválido.' }, { status: 401 });
  }
  // Opcional: buscar dados básicos do paciente
  const { data: patient } = await supabase
    .from('patients')
    .select('id, name')
    .eq('cpf', cpf)
    .single();
  return NextResponse.json({ session_token: data.session_token, patient });
}
