import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  return token === process.env.ADMIN_PASSWORD;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status || !['pending', 'approved', 'hidden'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('media')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar.' }, { status: 500 });
  }

  return NextResponse.json({ media: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;

  // Get the media record first to find the file path
  const { data: media, error: fetchError } = await supabaseAdmin
    .from('media')
    .select('file_path')
    .eq('id', id)
    .single();

  if (fetchError || !media) {
    return NextResponse.json({ error: 'Mídia não encontrada.' }, { status: 404 });
  }

  // Delete from storage
  const { error: storageError } = await supabaseAdmin.storage
    .from('wedding-media')
    .remove([media.file_path]);

  if (storageError) {
    console.error('Storage delete error:', storageError);
  }

  // Delete from database
  const { error: dbError } = await supabaseAdmin
    .from('media')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error('DB delete error:', dbError);
    return NextResponse.json({ error: 'Erro ao excluir.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
