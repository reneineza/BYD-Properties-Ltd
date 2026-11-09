import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';
import { getAgentById, updateAgentPassword } from '@/lib/db';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { newPassword } = await request.json();
  if (!newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' }, { status: 400 });
  }

  const agent = await getAgentById(params.id);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found.' }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const success = await updateAgentPassword(params.id, passwordHash);

  if (!success) {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, agentId: params.id });
}
