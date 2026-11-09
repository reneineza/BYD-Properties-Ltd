import { NextResponse } from 'next/server';
import { getAgents } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { POST as registerHandler } from './register/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const agents = await getAgents();
  return NextResponse.json(agents);
}

// Forward POST requests directly to the full agent registration handler
export async function POST(request) {
  return registerHandler(request);
}
