import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  getAgentByEmail, 
  updateAgent, 
  getRecentOtpRecord, 
  incrementOtpAttempts, 
  markOtpVerified 
} from '@/lib/db';
import { sendEmailVerifiedEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

function hashOtp(otp) {
  const secret = process.env.NEXTAUTH_SECRET || 'byd-properties-otp-secret-salt';
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { email, otp } = data;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    if (!otp || !/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit verification code.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // 1. Fetch the most recent active OTP record
    const otpRecord = await getRecentOtpRecord(cleanEmail);
    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No active verification code found for this email. Please request a new code.' },
        { status: 400 }
      );
    }

    // 2. Check if expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'This verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // 3. Check attempt limit
    const MAX_ATTEMPTS = 5;
    if ((otpRecord.attempts || 0) >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          error: 'Maximum verification attempts exceeded. For security, please request a new code.',
        },
        { status: 429 }
      );
    }

    // 4. Verify hashed OTP value
    const incomingHash = hashOtp(cleanOtp);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(incomingHash, 'utf8'),
      Buffer.from(otpRecord.otp_hash, 'utf8')
    );

    if (!isValid) {
      const updatedAttempts = await incrementOtpAttempts(otpRecord.id);
      const remaining = Math.max(0, MAX_ATTEMPTS - updatedAttempts);
      return NextResponse.json(
        {
          error: remaining > 0
            ? `Incorrect verification code. You have ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
            : 'Maximum verification attempts exceeded. Please request a new code.',
          remainingAttempts: remaining,
        },
        { status: 400 }
      );
    }

    // 5. Mark OTP as verified (one-time use)
    await markOtpVerified(otpRecord.id);

    // 6. Update Agent record
    const agent = await getAgentByEmail(cleanEmail);
    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found.' }, { status: 404 });
    }

    const verifiedAt = new Date().toISOString();
    const updatedAgent = await updateAgent(agent.id, {
      email_verified_at: verifiedAt,
      status: 'pending', // Progress to Admin Approval queue
      account_status: 'pending',
    });

    // 7. Send confirmation email
    await sendEmailVerifiedEmail({
      to: cleanEmail,
      name: agent.name || agent.full_name,
    });

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully. Your account is now pending administrator approval.',
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        email: updatedAgent.email,
        status: updatedAgent.status,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return NextResponse.json(
      { error: err.message || 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
