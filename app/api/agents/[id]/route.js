import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { updateAgent, deleteAgent } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bydproperties.rw';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function PUT(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();

  // Fetch current agent to detect status transition
  let previousStatus = null;
  if (supabaseAdmin) {
    const { data: current } = await supabaseAdmin
      .from('agents')
      .select('status, name, email')
      .eq('id', params.id)
      .single();
    previousStatus = current?.status;

    // Fire email only when status actually changes
    if (data.status && data.status !== previousStatus && current?.email) {
      const firstName = current.name?.split(' ')[0] || current.name;
      if (data.status === 'approved') {
        sendApprovalEmail({ name: current.name, firstName, email: current.email }).catch(err =>
          console.error('Approval email failed:', err)
        );
      } else if (data.status === 'rejected') {
        sendRejectionEmail({ name: current.name, firstName, email: current.email }).catch(err =>
          console.error('Rejection email failed:', err)
        );
      }
    }
  }

  const updated = await updateAgent(params.id, data);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await deleteAgent(params.id);
  return NextResponse.json({ success: true });
}

// ── Email senders ──────────────────────────────────────────────────────────

async function sendApprovalEmail({ name, firstName, email }) {
  if (!resend) return;
  await resend.emails.send({
    from: 'BYD Properties <alerts@bydproperties.rw>',
    to: email,
    subject: '🎉 Congratulations! Your Agent Application is Approved — BYD Properties',
    html: buildApprovalEmail({ name, firstName, email }),
  });
}

async function sendRejectionEmail({ name, firstName, email }) {
  if (!resend) return;
  await resend.emails.send({
    from: 'BYD Properties <alerts@bydproperties.rw>',
    to: email,
    subject: 'Update on Your Agent Application — BYD Properties',
    html: buildRejectionEmail({ name, firstName }),
  });
}

// ── Email templates ────────────────────────────────────────────────────────

function buildApprovalEmail({ name, firstName, email }) {
  const agentPortalUrl = `${SITE_URL}/agent`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Approved — BYD Properties</title>
</head>
<body style="margin:0;padding:0;background-color:#0B132B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0B132B;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <img src="${SITE_URL}/logo-transparent.png" alt="BYD Properties" width="130" style="display:block;height:auto;" />
        </td></tr>

        <!-- Card -->
        <tr><td style="background:linear-gradient(160deg,#111827 0%,#1a2235 100%);border-radius:16px;border:1px solid rgba(201,168,76,0.25);overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="height:4px;background:linear-gradient(90deg,#C9A84C,#e8c96a,#C9A84C);"></td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:48px 48px 40px;">

              <!-- Checkmark icon -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr><td style="width:56px;height:56px;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.3);border-radius:50%;text-align:center;line-height:56px;">
                  <span style="font-size:26px;">&#10003;</span>
                </td></tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;">Application Approved</p>
              <h1 style="margin:0 0 20px;font-size:28px;font-weight:700;color:#ffffff;line-height:1.25;">
                Welcome to the team, ${firstName}! &#127881;
              </h1>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr><td style="height:1px;background:rgba(201,168,76,0.2);"></td></tr>
              </table>

              <p style="margin:0 0 16px;font-size:16px;color:#d1d5db;line-height:1.75;">
                We are delighted to inform you that your application to join the <strong style="color:#ffffff;">BYD Properties</strong> agent network has been <strong style="color:#C9A84C;">approved</strong>.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.75;">
                You can now access your agent portal to manage listings, track inquiries, and grow your real estate business with Rwanda&rsquo;s leading property platform.
              </p>

              <!-- Login Details -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:10px;">
                <tr><td style="padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;">Your Login Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                    <tr>
                      <td width="40%" style="font-size:12px;color:#6b7280;padding:4px 0;">Name</td>
                      <td style="font-size:13px;font-weight:600;color:#ffffff;padding:4px 0;">${name}</td>
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                    <tr>
                      <td width="40%" style="font-size:12px;color:#6b7280;padding:4px 0;">Email</td>
                      <td style="font-size:13px;font-weight:600;color:#ffffff;padding:4px 0;">${email}</td>
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="40%" style="font-size:12px;color:#6b7280;padding:4px 0;">Password</td>
                      <td style="font-size:13px;font-weight:600;color:#ffffff;padding:4px 0;">Use the password you created during registration</td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              <!-- What's next steps -->
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;">Get started in 3 steps</p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                <tr>
                  <td width="28" valign="top" style="padding-top:2px;">
                    <div style="width:22px;height:22px;border-radius:50%;background:#C9A84C;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#0B132B;">1</div>
                  </td>
                  <td style="padding-left:10px;font-size:14px;color:#d1d5db;line-height:1.6;">Log in to your agent portal using your email and password.</td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                <tr>
                  <td width="28" valign="top" style="padding-top:2px;">
                    <div style="width:22px;height:22px;border-radius:50%;background:#C9A84C;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#0B132B;">2</div>
                  </td>
                  <td style="padding-left:10px;font-size:14px;color:#d1d5db;line-height:1.6;">Complete your agent profile and upload a professional photo.</td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:40px;">
                <tr>
                  <td width="28" valign="top" style="padding-top:2px;">
                    <div style="width:22px;height:22px;border-radius:50%;background:#C9A84C;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#0B132B;">3</div>
                  </td>
                  <td style="padding-left:10px;font-size:14px;color:#d1d5db;line-height:1.6;">Start listing properties and connecting with buyers and renters.</td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr><td>
                  <a href="${agentPortalUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:#0B132B;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:8px;letter-spacing:0.04em;">
                    Access Agent Portal &rarr;
                  </a>
                </td></tr>
              </table>

            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 0 0;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">BYD Properties Ltd &middot; Kigali, Rwanda</p>
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">
            <a href="${SITE_URL}" style="color:#C9A84C;text-decoration:none;">www.bydproperties.rw</a>
          </p>
          <p style="margin:0;font-size:12px;color:#4b5563;">
            Questions? <a href="mailto:info@bydproperties.rw" style="color:#9ca3af;text-decoration:underline;">info@bydproperties.rw</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildRejectionEmail({ name, firstName }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Update — BYD Properties</title>
</head>
<body style="margin:0;padding:0;background-color:#0B132B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0B132B;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <img src="${SITE_URL}/logo-transparent.png" alt="BYD Properties" width="130" style="display:block;height:auto;" />
        </td></tr>

        <!-- Card -->
        <tr><td style="background:linear-gradient(160deg,#111827 0%,#1a2235 100%);border-radius:16px;border:1px solid rgba(201,168,76,0.15);overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="height:4px;background:linear-gradient(90deg,#C9A84C,#e8c96a,#C9A84C);"></td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:48px 48px 40px;">

              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;">Application Update</p>
              <h1 style="margin:0 0 20px;font-size:28px;font-weight:700;color:#ffffff;line-height:1.25;">
                Thank you for applying, ${firstName}.
              </h1>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr><td style="height:1px;background:rgba(201,168,76,0.2);"></td></tr>
              </table>

              <p style="margin:0 0 16px;font-size:16px;color:#d1d5db;line-height:1.75;">
                Dear ${name}, after careful review of your application, we are unfortunately unable to approve your request to join the <strong style="color:#ffffff;">BYD Properties</strong> agent network at this time.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#9ca3af;line-height:1.75;">
                This decision may be due to current capacity, regional coverage requirements, or specific experience criteria. We encourage you to reapply in the future as our network continues to grow.
              </p>

              <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.75;">
                We appreciate the time you took to apply and wish you the best in your real estate career.
              </p>

              <!-- Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:40px;background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.12);border-radius:10px;">
                <tr><td style="padding:20px 24px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#ffffff;">Still interested in our properties?</p>
                  <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.65;">
                    You can still browse and inquire about our exclusive listings across Rwanda as a buyer or investor.
                  </p>
                </td></tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr><td>
                  <a href="${SITE_URL}/properties" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:#0B132B;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:8px;letter-spacing:0.04em;">
                    Browse Properties &rarr;
                  </a>
                </td></tr>
              </table>

            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:32px 0 0;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">BYD Properties Ltd &middot; Kigali, Rwanda</p>
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">
            <a href="${SITE_URL}" style="color:#C9A84C;text-decoration:none;">www.bydproperties.rw</a>
          </p>
          <p style="margin:0;font-size:12px;color:#4b5563;">
            Questions? <a href="mailto:info@bydproperties.rw" style="color:#9ca3af;text-decoration:underline;">info@bydproperties.rw</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
