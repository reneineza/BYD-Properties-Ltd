import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { updateAgentPassword, getAgents, updateAgent } from '@/lib/db';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : supabase;

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' }, { status: 400 });
    }

    // Try finding agent via Supabase first
    let agent = null;
    try {
      const { data } = await supabaseAdmin
        .from('agents')
        .select('id, reset_token_expires')
        .eq('reset_token', token)
        .single();
      if (data) agent = data;
    } catch (e) {
      // Fallback below
    }

    // Fallback: search via getAgents()
    if (!agent) {
      const allAgents = await getAgents();
      agent = allAgents.find(a => a.reset_token === token);
    }

    if (!agent) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    if (agent.reset_token_expires && new Date(agent.reset_token_expires) < new Date()) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash the new password and clear the token
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await updateAgentPassword(agent.id, passwordHash);
    await updateAgent(agent.id, { reset_token: null, reset_token_expires: null });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
}
