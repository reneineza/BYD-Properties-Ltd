import { Resend } from 'resend';
import {
  otpVerificationEmailHtml,
  emailVerifiedSuccessEmailHtml,
  agentApprovedEmailHtml,
  agentRejectedEmailHtml,
  agentSuspendedEmailHtml,
  agentPasswordResetEmailHtml,
} from './emailTemplates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SENDER = process.env.EMAIL_FROM || 'BYD Properties <alerts@bydproperties.rw>';

async function sendMail({ to, subject, html }) {
  if (!to) return { success: false, error: 'No recipient specified' };

  console.log(`[EMAIL SENDING] To: ${to} | Subject: "${subject}"`);

  if (!resend) {
    console.warn(`[EMAIL NOTICE] RESEND_API_KEY not configured. Email logged to console instead.`);
    return { success: true, simulated: true };
  }

  try {
    const response = await resend.emails.send({
      from: SENDER,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] ID: ${response?.data?.id || 'ok'}`);
    return { success: true, id: response?.data?.id };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err);
    return { success: false, error: err.message };
  }
}

export async function sendOtpEmail({ to, name, otp }) {
  return sendMail({
    to,
    subject: 'Verify Your BYD Properties Agent Account',
    html: otpVerificationEmailHtml({ name, otp }),
  });
}

export async function sendEmailVerifiedEmail({ to, name }) {
  return sendMail({
    to,
    subject: 'Email Verified — BYD Properties Agent Application',
    html: emailVerifiedSuccessEmailHtml({ name, email: to }),
  });
}

export async function sendAgentApprovedEmail({ to, name }) {
  const firstName = name ? name.split(' ')[0] : 'Agent';
  return sendMail({
    to,
    subject: '🎉 Congratulations! Your Agent Application is Approved — BYD Properties',
    html: agentApprovedEmailHtml({ firstName, name, email: to }),
  });
}

export async function sendAgentRejectedEmail({ to, name, rejectionReason }) {
  const firstName = name ? name.split(' ')[0] : 'Agent';
  return sendMail({
    to,
    subject: 'Update on Your Agent Application — BYD Properties',
    html: agentRejectedEmailHtml({ firstName, name, rejectionReason }),
  });
}

export async function sendAgentSuspendedEmail({ to, name }) {
  const firstName = name ? name.split(' ')[0] : 'Agent';
  return sendMail({
    to,
    subject: 'Important Notice: Your Agent Account Has Been Suspended — BYD Properties',
    html: agentSuspendedEmailHtml({ firstName, name }),
  });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const firstName = name ? name.split(' ')[0] : 'Agent';
  return sendMail({
    to,
    subject: 'Reset Your Password — BYD Properties',
    html: agentPasswordResetEmailHtml({ firstName, name, resetUrl }),
  });
}
