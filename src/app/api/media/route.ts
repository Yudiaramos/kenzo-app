import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

function isAdmin(request: NextRequest): boolean {
  const cookieStore = request.cookies;
  const token = cookieStore.get('admin_token')?.value;
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get('stage');
  const status = searchParams.get('status');
  const isAdminRequest = isAdmin(request);

  let query = supabaseAdmin
    .from('media')
    .select('*')
    .order('created_at', { ascending: true });

  if (!isAdminRequest) {
    // Public: only approved media
    query = query.eq('status', 'approved');
  } else if (status) {
    // Admin: filter by status
    query = query.eq('status', status);
  }

  if (stage) {
    query = query.eq('stage', stage);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Media list error:', error);
    return NextResponse.json({ error: 'Erro ao carregar mídias.' }, { status: 500 });
  }

  return NextResponse.json({ media: data });
}
