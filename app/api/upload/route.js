import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  // Allow unauthenticated uploads only for agent profile photos (context=agent)
  // Admin uploads require a session
  const { searchParams } = new URL(request.url);
  const context = searchParams.get('context'); 

  if (context === 'admin') {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Upload to Supabase Storage
  // Make sure you have a bucket named 'properties' set to PUBLIC
  const { data, error } = await supabase.storage
    .from('properties')
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Supabase upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  // Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('properties')
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
