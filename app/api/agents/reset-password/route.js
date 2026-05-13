import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(request) {
  const { token, newPassword } = await request.json();

  if (!token || !newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  // Find agent with this token that hasn't expired
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('id, reset_token_expires')
    .eq('reset_token', token)
    .single();

  if (!agent) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
  }

  if (new Date(agent.reset_token_expires) < new Date()) {
    return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
  }

  // Hash the new password and clear the token
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const { error } = await supabaseAdmin
    .from('agents')
    .update({ password: passwordHash, reset_token: null, reset_token_expires: null })
    .eq('id', agent.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
