import { NextResponse } from 'next/server';
import { getAgentById, updateAgent, deleteAgent, createOtpRecord } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import crypto from 'crypto';
import { 
  sendAgentApprovedEmail, 
  sendAgentRejectedEmail, 
  sendAgentSuspendedEmail,
  sendOtpEmail
} from '@/lib/mailer';

export const dynamic = 'force-dynamic';

function hashOtp(otp) {
  const secret = process.env.NEXTAUTH_SECRET || 'byd-properties-otp-secret-salt';
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const agent = await getAgentById(params.id);
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only admin can perform admin approvals/suspensions
  if (session.user?.role !== 'admin' && session.user?.id !== params.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await request.json();
  const current = await getAgentById(params.id);
  if (!current) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  // Handle manual resend of verification OTP from admin dashboard
  if (data.resendVerification && session.user?.role === 'admin') {
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await createOtpRecord({
      userId: current.id,
      email: current.email,
      otpHash,
      expiresAt,
    });

    await sendOtpEmail({
      to: current.email,
      name: current.name || current.full_name,
      otp,
    });

    return NextResponse.json({ success: true, message: 'Verification email resent to agent.' });
  }

  // Handle status transitions
  if (data.status && data.status !== current.status && session.user?.role === 'admin') {
    const agentEmail = current.email;
    const agentName = current.name || current.full_name;

    if (data.status === 'approved' || data.status === 'active') {
      data.status = 'approved';
      data.account_status = 'approved';
      data.approved_at = new Date().toISOString();
      data.approved_by = session.user?.email || 'admin@bydproperties.rw';
      data.rejection_reason = null;

      // Automatically mark email verified if admin approves directly
      if (!current.email_verified_at) {
        data.email_verified_at = new Date().toISOString();
      }

      await sendAgentApprovedEmail({
        to: agentEmail,
        name: agentName,
      });
    } else if (data.status === 'rejected') {
      data.status = 'rejected';
      data.account_status = 'rejected';
      data.rejection_reason = data.rejection_reason || 'Application did not meet current eligibility requirements.';

      await sendAgentRejectedEmail({
        to: agentEmail,
        name: agentName,
        rejectionReason: data.rejection_reason,
      });
    } else if (data.status === 'suspended') {
      data.status = 'suspended';
      data.account_status = 'suspended';

      await sendAgentSuspendedEmail({
        to: agentEmail,
        name: agentName,
      });
    }
  }

  const updated = await updateAgent(params.id, data);
  if (!updated) return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await deleteAgent(params.id);
  return NextResponse.json({ success: true });
}
