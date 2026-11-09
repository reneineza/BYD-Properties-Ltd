import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  getAgentByEmail, 
  updateAgent, 
  createOtpRecord 
} from '@/lib/db';
import { sendOtpEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

function hashOtp(otp) {
  const secret = process.env.NEXTAUTH_SECRET || 'byd-properties-otp-secret-salt';
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { currentEmail, newEmail } = data;

    if (!currentEmail || !newEmail) {
      return NextResponse.json({ error: 'Current email and new email are required.' }, { status: 400 });
    }

    const cleanCurrent = currentEmail.trim().toLowerCase();
    const cleanNew = newEmail.trim().toLowerCase();

    if (cleanCurrent === cleanNew) {
      return NextResponse.json({ error: 'The new email address must be different from the current one.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanNew)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // 1. Locate current unverified agent
    const agent = await getAgentByEmail(cleanCurrent);
    if (!agent) {
      return NextResponse.json({ error: 'Current registration not found.' }, { status: 404 });
    }

    if (agent.email_verified_at && agent.status !== 'email_pending') {
      return NextResponse.json({ error: 'Cannot change email for an already verified account.' }, { status: 400 });
    }

    // 2. Check if new email is taken
    const existingNew = await getAgentByEmail(cleanNew);
    if (existingNew && existingNew.id !== agent.id) {
      return NextResponse.json(
        { error: 'An account with the new email address already exists.' },
        { status: 409 }
      );
    }

    // 3. Update agent email
    await updateAgent(agent.id, {
      email: cleanNew,
      email_verified_at: null,
      status: 'email_pending',
      account_status: 'email_pending',
    });

    // 4. Generate new OTP for the new email
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await createOtpRecord({
      userId: agent.id,
      email: cleanNew,
      otpHash,
      expiresAt,
    });

    // 5. Send OTP to the new email
    await sendOtpEmail({
      to: cleanNew,
      name: agent.name || agent.full_name,
      otp,
    });

    return NextResponse.json({
      success: true,
      newEmail: cleanNew,
      message: `Email updated to ${cleanNew}. A verification code has been sent.`,
      expiresInSeconds: 300,
      cooldownSeconds: 60,
    });
  } catch (err) {
    console.error('Change email error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to change email address.' },
      { status: 500 }
    );
  }
}
