import { NextResponse } from 'next/server';
import { updateAgent, deleteAgent } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function PUT(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const updated = updateAgent(params.id, data);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  deleteAgent(params.id);
  return NextResponse.json({ success: true });
}
