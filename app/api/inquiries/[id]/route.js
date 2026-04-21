import { NextResponse } from 'next/server';
import { updateInquiry } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function PUT(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const updated = await updateInquiry(params.id, data);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
