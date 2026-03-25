import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({}, { status: 401 });
  const supabase = createClient(token);
  // Busca próxima sessão futura
  const { data } = await supabase
    .from('appointments')
    .select('date, time, type, professional, location')
    .gt('date', new Date().toISOString().slice(0, 10))
    .order('date', { ascending: true })
    .limit(1)
    .single();
  return NextResponse.json(data || {});
}
