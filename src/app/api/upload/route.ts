import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/x-msvideo'];
const VALID_STAGES = ['reception', 'ceremony', 'party', 'after_wedding'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const stage = formData.get('stage') as string | null;
    const guestName = formData.get('guest_name') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: 'Etapa inválida.' }, { status: 400 });
    }

    // Determine media type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Envie uma foto (JPEG, PNG, WebP) ou vídeo (MP4, MOV, WebM).' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `Arquivo muito grande. Tamanho máximo: ${maxMB} MB.` },
        { status: 400 }
      );
    }

    const mediaType = isImage ? 'image' : 'video';

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || (isImage ? 'jpg' : 'mp4');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filePath = `uploads/${stage}/${timestamp}-${random}.${ext}`;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('wedding-media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao enviar arquivo. Tente novamente.' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('wedding-media')
      .getPublicUrl(filePath);

    // Save metadata to database
    const { data: mediaRecord, error: dbError } = await supabaseAdmin
      .from('media')
      .insert({
        stage,
        guest_name: guestName?.trim() || null,
        media_type: mediaType,
        file_path: filePath,
        file_url: urlData.publicUrl,
        status: 'approved',
        size_bytes: file.size,
        original_filename: file.name,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to clean up the uploaded file
      await supabaseAdmin.storage.from('wedding-media').remove([filePath]);
      return NextResponse.json(
        { error: 'Erro ao salvar informações. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: mediaRecord,
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
