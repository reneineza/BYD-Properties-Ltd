import { NextResponse } from 'next/server';
import { getContent, updateContent } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  return NextResponse.json(await getContent());
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const updated = await updateContent(data);
  return NextResponse.json(updated);
}
