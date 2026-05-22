import { NextResponse } from 'next/server';
import { getContent, updateContent } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const content = await getContent();
    return NextResponse.json(content);
  } catch (err) {
    console.error('GET /api/content error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: No session' }, { status: 401 });
    }
    
    // Allow admins to modify site content
    const isAdmin = session.user?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: `Forbidden: Admins only (Your role: ${session.user?.role || 'none'})` }, { status: 403 });
    }

    const data = await request.json();
    const updated = await updateContent(data);
    
    // Purge the static page caches so the homepage, about page, and contact page reflect updates instantly
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/contact');

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Failed to save content:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
