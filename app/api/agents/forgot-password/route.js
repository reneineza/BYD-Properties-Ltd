import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { agentPasswordResetEmailHtml } from '@/lib/emailTemplates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bydproperties.rw';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  // Look up agent by email
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('id, name, email, status')
    .eq('email', email)
    .single();

  // Always return success to prevent user enumeration
  if (!agent || agent.status !== 'active') {
    return NextResponse.json({ success: true });
  }

  // Generate a secure token (expires in 1 hour)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Store token in the agents table
  await supabaseAdmin
    .from('agents')
    .update({ reset_token: token, reset_token_expires: expiresAt })
    .eq('id', agent.id);

  // Send the reset email
  const resetUrl = `${SITE_URL}/agent/reset-password?token=${token}`;
  const firstName = agent.name?.split(' ')[0] || agent.name;

  if (resend) {
    resend.emails.send({
      from: 'BYD Properties <alerts@bydproperties.rw>',
      to: agent.email,
      subject: 'Reset Your Password — BYD Properties Agent Portal',
      html: agentPasswordResetEmailHtml({ firstName, name: agent.name, resetUrl }),
    }).catch(err => console.error('Password reset email failed:', err));
  }

  return NextResponse.json({ success: true });
}
