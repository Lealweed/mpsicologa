import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json([], { status: 401 });
  const supabase = createClient(token);
  // Busca histórico financeiro
  const { data } = await supabase
    .from('finances')
    .select('id, description, due_date, status')
    .order('due_date', { ascending: false });
  return NextResponse.json(data || []);
}
