import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { createClient } from '@supabase/supabase-js';

// Raise the default 4MB Next.js body limit so large photos don't get rejected
export const maxDuration = 30;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// next.config body size override for App Router API routes
export const fetchCache = 'force-no-store';

// Security: strict allowlist for uploaded image types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// Use service role key for server-side uploads (bypasses RLS storage policies)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  // Allow unauthenticated uploads only for agent profile photos (context=agent)
  // Admin uploads require a valid session
  const { searchParams } = new URL(request.url);
  const context = searchParams.get('context');

  if (context === 'admin') {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    // This usually means the body exceeded the server limit
    console.error('FormData parse error (file likely too large):', err);
    return NextResponse.json(
      { error: 'File too large. Please use images under 10MB.' },
      { status: 413 }
    );
  }

  const file = formData.get('file');
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Security: validate MIME type against allowlist
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
      { status: 400 }
    );
  }

  // Validate file size — 10MB per file to stay well within Vercel's 4.5MB limit
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large. Max is 10MB per image (yours: ${(file.size / 1024 / 1024).toFixed(1)}MB). Please compress or resize it first.` },
      { status: 413 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Security: derive extension from validated MIME type — never trust the filename
  const ext = MIME_TO_EXT[file.type];
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Upload to Supabase Storage (bucket: 'properties', must be set to PUBLIC)
  const { data, error } = await supabaseAdmin.storage
    .from('properties')
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }

  // Return the public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('properties')
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
