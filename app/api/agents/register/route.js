import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { 
  getAgentByEmail, 
  getAgentByPhone, 
  createAgent, 
  updateAgent, 
  createOtpRecord, 
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
    const {
      fullName,
      email,
      phone,
      whatsappNumber,
      agencyName,
      location,
      password,
      confirmPassword,
      profileImage,
      agreeTerms,
      agreePrivacy,
    } = data;

    // 1. Mandatory Field Validation
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }
    if (!location || !location.trim()) {
      return NextResponse.json({ error: 'Location is required.' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }
    if (!agreeTerms || !agreePrivacy) {
      return NextResponse.json(
        { error: 'You must agree to the Terms and Conditions and Privacy Policy.' },
        { status: 400 }
      );
    }

    // 2. Email Format Validation
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // 3. Password Match & Complexity
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password and password confirmation do not match.' }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        },
        { status: 400 }
      );
    }

    // 4. Rate limit check on OTP requests
    const recentRequests = await getOtpRequestsInWindow(cleanEmail, 10);
    if (recentRequests >= 5) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait 10 minutes before trying again.' },
        { status: 429 }
      );
    }

    // 5. Uniqueness Checks
    const existingByEmail = await getAgentByEmail(cleanEmail);
    if (existingByEmail) {
      // If already verified/approved, cannot re-register
      if (existingByEmail.email_verified_at || ['approved', 'active', 'pending', 'suspended'].includes(existingByEmail.status)) {
        return NextResponse.json(
          { error: 'An account with this email address already exists. Please log in or contact support.' },
          { status: 409 }
        );
      }
    }

    const cleanPhone = phone.trim();
    const existingByPhone = await getAgentByPhone(cleanPhone);
    if (existingByPhone && existingByPhone.id !== existingByEmail?.id) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists. Please use a different phone number.' },
        { status: 409 }
      );
    }

    // 6. Hash Password securely
    const passwordHash = await bcrypt.hash(password, 12);

    // 7. Create or Update unverified Agent record
    let agent;
    const agentPayload = {
      name: fullName.trim(),
      full_name: fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      phone_number: cleanPhone,
      whatsapp_number: (whatsappNumber || '').trim(),
      agency_name: (agencyName || '').trim(),
      location: location.trim(),
      password: passwordHash,
      photo_url: profileImage || null,
      profile_image: profileImage || null,
      status: 'email_pending',
      account_status: 'email_pending',
      email_verified_at: null,
    };

    if (existingByEmail && existingByEmail.status === 'email_pending') {
      agent = await updateAgent(existingByEmail.id, agentPayload);
    } else {
      agent = await createAgent(agentPayload);
    }

    // 8. Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    await createOtpRecord({
      userId: agent.id,
      email: cleanEmail,
      otpHash,
      expiresAt,
    });

    // 9. Send OTP Email
    await sendOtpEmail({
      to: cleanEmail,
      name: fullName.trim(),
      otp,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration initiated. A 6-digit verification code has been sent to your email.',
        email: cleanEmail,
        agentId: agent.id,
        expiresInSeconds: 300,
        cooldownSeconds: 60,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
