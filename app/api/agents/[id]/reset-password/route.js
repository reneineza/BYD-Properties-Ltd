import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { newPassword } = await request.json();
  if (!newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service role not configured.' }, { status: 500 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const { data, error } = await supabaseAdmin
    .from('agents')
    .update({ password: passwordHash })
    .eq('id', params.id)
    .select('id, name, email')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Agent not found or update failed.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, agentId: data.id });
}
