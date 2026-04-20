import { NextResponse } from 'next/server';
import { getAgents, createAgent } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(getAgents());
}

export async function POST(request) {
  const data = await request.json();
  const { fullName, email, phone, password, agencyName, bio, photo } = data;

  if (!fullName || !email || !phone || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const agent = createAgent({ fullName, email, phone, password, agencyName, bio, photo });
    return NextResponse.json({ success: true, id: agent.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}
