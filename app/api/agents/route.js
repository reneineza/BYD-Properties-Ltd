import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAgents, createAgent } from '@/lib/db';
import { getServerSession } from 'next-auth';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bydproperties.rw';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getAgents());
}

export async function POST(request) {
  const data = await request.json();
  const {
    fullName, email, phone, password,
    nationalId, city, agencyName,
    experience, specialization, employment,
    languages, linkedIn, bio, howHeard, photoUrl,
  } = data;

  if (!fullName || !email || !phone || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const agent = await createAgent({
      name: fullName,
      email,
      phone,
      specialization,
      bio,
      photo_url: photoUrl,
      status: 'pending',
      // Extra fields (nationalId, city, agencyName, etc.) are included in
      // the confirmation email only — no schema change needed.
    });

    // Fire confirmation email — non-blocking
    sendConfirmationEmail({ name: fullName, email, specialization, city }).catch(err =>
      console.error('Agent confirmation email failed:', err)
    );

    return NextResponse.json({ success: true, id: agent.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}

async function sendConfirmationEmail({ name, email, specialization, city }) {
  if (!resend) return;

  const firstName = name.split(' ')[0];

  await resend.emails.send({
    from: 'BYD Properties <alerts@bydproperties.rw>',
    to: email,
    subject: 'Your Agent Application Has Been Received — BYD Properties',
    html: buildConfirmationEmail({ firstName, name, email, specialization, city }),
  });
}

function buildConfirmationEmail({ firstName, name, email, specialization, city }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agent Application Received — BYD Properties</title>
</head>
<body style="margin:0;padding:0;background-color:#0B132B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0B132B;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="${SITE_URL}/logo-transparent.png"
                   alt="BYD Properties"
                   width="130"
                   style="display:block;height:auto;" />
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:linear-gradient(160deg,#111827 0%,#1a2235 100%);border-radius:16px;border:1px solid rgba(201,168,76,0.25);overflow:hidden;">

              <!-- Gold accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#C9A84C,#e8c96a,#C9A84C);"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:48px 48px 32px;">

                    <!-- Eyebrow -->
                    <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#C9A84C;">
                      Application Received
                    </p>

                    <!-- Heading -->
                    <h1 style="margin:0 0 20px;font-size:28px;font-weight:700;color:#ffffff;line-height:1.25;">
                      Thank you, ${firstName}!
                    </h1>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                      <tr><td style="height:1px;background:rgba(201,168,76,0.2);"></td></tr>
                    </table>

                    <p style="margin:0 0 16px;font-size:16px;color:#d1d5db;line-height:1.75;">
                      We have received your application to join the <strong style="color:#ffffff;">BYD Properties</strong> agent network and it is now <strong style="color:#C9A84C;">under review</strong> by our team.
                    </p>

                    <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.75;">
                      Our team carefully evaluates every application to ensure our network maintains the highest standards of professionalism. We will reach out to you within <strong style="color:#ffffff;">2–3 business days</strong> with a decision.
                    </p>

                    <!-- Application Summary -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-radius:10px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;">Your Application Summary</p>

                          <!-- Row: Name -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                            <tr>
                              <td width="40%" style="font-size:12px;color:#6b7280;padding:4px 0;">Full Name</td>
                              <td style="font-size:13px;font-weight:600;color:#ffffff;padding:4px 0;">${name}</td>
                            </tr>
                          </table>

                          <!-- Row: Email -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                            <tr>
                              <td width="40%" style="font-size:12px;color:#6b7280;padding:4px 0;">Email</td>
                              <td style="font-size:13px;font-weight:600;color:#ffffff;padding:4px 0;">${email}</td>
                            </tr>
                          </table>

                          ${specialization ? `
                          <!-- Row: Specialization -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                            <tr>
                              <td width="40%" style="font-size:12px;color:#6b7280;padding:4px 0;">Specialization</td>
                              <td style="font-size:13px;font-weight:600;color:#ffffff;padding:4px 0;">${specialization}</td>
                            </tr>
                          </table>` : ''}

                          ${city ? `
                          <!-- Row: City -->
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="40%" style="font-size:12px;color:#6b7280;padding:4px 0;">Location</td>
                              <td style="font-size:13px;font-weight:600;color:#ffffff;padding:4px 0;">${city}</td>
                            </tr>
                          </table>` : ''}

                          <!-- Status badge -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
                            <tr>
                              <td style="background:rgba(234,179,8,0.12);border:1px solid rgba(234,179,8,0.3);border-radius:20px;padding:5px 14px;">
                                <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C9A84C;">&#x25CF; Under Review</p>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- What happens next -->
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;">What happens next</p>

                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td width="28" valign="top" style="padding-top:2px;">
                          <div style="width:22px;height:22px;border-radius:50%;background:#C9A84C;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#0B132B;">1</div>
                        </td>
                        <td style="padding-left:10px;font-size:14px;color:#d1d5db;line-height:1.6;">
                          Our team reviews your application and verifies your details.
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td width="28" valign="top" style="padding-top:2px;">
                          <div style="width:22px;height:22px;border-radius:50%;background:#C9A84C;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#0B132B;">2</div>
                        </td>
                        <td style="padding-left:10px;font-size:14px;color:#d1d5db;line-height:1.6;">
                          You receive an approval email with your login credentials within 2–3 business days.
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:40px;">
                      <tr>
                        <td width="28" valign="top" style="padding-top:2px;">
                          <div style="width:22px;height:22px;border-radius:50%;background:#C9A84C;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#0B132B;">3</div>
                        </td>
                        <td style="padding-left:10px;font-size:14px;color:#d1d5db;line-height:1.6;">
                          You gain access to your agent portal to list and manage properties.
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="text-align:center;">
                          <a href="${SITE_URL}/properties"
                             style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:#0B132B;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:8px;letter-spacing:0.04em;">
                            Browse Our Properties &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">BYD Properties Ltd &middot; Kigali, Rwanda</p>
              <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">
                <a href="${SITE_URL}" style="color:#C9A84C;text-decoration:none;">www.bydproperties.rw</a>
              </p>
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
                Questions? Contact us at
                <a href="mailto:info@bydproperties.rw" style="color:#9ca3af;text-decoration:underline;">info@bydproperties.rw</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
