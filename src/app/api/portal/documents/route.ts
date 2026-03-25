import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json([], { status: 401 });
  const supabase = createClient(token);
  // Busca documentos do paciente
  const { data } = await supabase
    .from('patient_documents')
    .select('id, title, type, url')
    .order('created_at', { ascending: false });
  return NextResponse.json(data || []);
}
