import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  getAgentByEmail, 
  createOtpRecord, 
  getRecentOtpRecord, 
  getOtpRequestsInWindow 
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
    const { email } = data;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify agent exists
    const agent = await getAgentByEmail(cleanEmail);
    if (!agent) {
      return NextResponse.json({ error: 'No application found with this email address.' }, { status: 404 });
    }

    if (agent.email_verified_at && agent.status !== 'email_pending') {
      return NextResponse.json(
        { error: 'Your email address is already verified. Please await admin review or log in.' },
        { status: 400 }
      );
    }

    // 2. Cooldown check (60 seconds)
    const recentRecord = await getRecentOtpRecord(cleanEmail);
    if (recentRecord) {
      const elapsedMs = Date.now() - new Date(recentRecord.created_at).getTime();
      const COOLDOWN_MS = 60 * 1000;
      if (elapsedMs < COOLDOWN_MS) {
        const remainingSec = Math.ceil((COOLDOWN_MS - elapsedMs) / 1000);
        return NextResponse.json(
          {
            error: `Please wait ${remainingSec} second${remainingSec !== 1 ? 's' : ''} before requesting another code.`,
            remainingSeconds: remainingSec,
          },
          { status: 429 }
        );
      }
    }

    // 3. Frequency limit check (max 5 requests per 10 mins)
    const recentCount = await getOtpRequestsInWindow(cleanEmail, 10);
    if (recentCount >= 5) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please wait 10 minutes before trying again.' },
        { status: 429 }
      );
    }

    // 4. Generate new 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    await createOtpRecord({
      userId: agent.id,
      email: cleanEmail,
      otpHash,
      expiresAt,
    });

    // 5. Send OTP Email
    await sendOtpEmail({
      to: cleanEmail,
      name: agent.name || agent.full_name,
      otp,
    });

    return NextResponse.json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email.',
      expiresInSeconds: 300,
      cooldownSeconds: 60,
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to resend verification code. Please try again.' },
      { status: 500 }
    );
  }
}
