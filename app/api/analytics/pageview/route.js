import { NextResponse } from 'next/server';
import { logPageView } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { path, sessionId, referrer } = body;

    // Don't track admin pages
    if (path && path.startsWith('/admin')) {
      return NextResponse.json({ ok: true });
    }

    logPageView({ path, sessionId, referrer });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
