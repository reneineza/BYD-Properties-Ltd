import { NextResponse } from 'next/server';
import { getContent, updateContent } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET() {
  return NextResponse.json(getContent());
}

export async function PUT(request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const updated = updateContent(data);
  return NextResponse.json(updated);
}
