import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAgentByEmail, updateAgent } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/mailer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bydproperties.rw';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const agent = await getAgentByEmail(email);

    // Always return success to prevent user enumeration
    const isActive = agent && (agent.status === 'active' || agent.status === 'approved' || agent.account_status === 'approved');
    if (!agent || !isActive) {
      return NextResponse.json({ success: true });
    }

    // Generate a secure token (expires in 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store token in the agents table
    await updateAgent(agent.id, {
      reset_token: token,
      reset_token_expires: expiresAt,
    });

    // Send the reset email
    const resetUrl = `${SITE_URL}/agent/reset-password?token=${token}`;
    const agentName = agent.full_name || agent.name || 'Agent';

    await sendPasswordResetEmail({
      to: agent.email,
      name: agentName,
      resetUrl,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Unable to process request.' }, { status: 500 });
  }
}
