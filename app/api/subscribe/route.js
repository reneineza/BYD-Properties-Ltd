import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bydproperties.rw';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check for existing subscription
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'You are already subscribed!' }, { status: 400 });
      }
      // Reactivate if previously unsubscribed
      const token = randomUUID();
      await supabase
        .from('subscriptions')
        .update({ status: 'active', unsubscribe_token: token })
        .eq('email', email);
      await sendWelcomeEmail(email, token);
      return NextResponse.json({ success: true });
    }

    // Create new subscription with token
    const token = randomUUID();
    const { error } = await supabase
      .from('subscriptions')
      .insert([{ email, status: 'active', unsubscribe_token: token }]);

    if (error) {
      console.error('Subscription insert error:', error);
      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
    }

    await sendWelcomeEmail(email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function sendWelcomeEmail(email, token) {
  if (!resend) return;

  const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${token}`;

  try {
    await resend.emails.send({
      from: 'BYD Properties <alerts@bydproperties.rw>',
      to: email,
      subject: 'Welcome to BYD Properties Alerts! 🏠',
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: buildWelcomeEmail(email, unsubscribeUrl),
    });
  } catch (emailErr) {
    console.error('Failed to send welcome email:', emailErr);
  }
}

function buildWelcomeEmail(email, unsubscribeUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to BYD Properties</title>
</head>
<body style="margin:0;padding:0;background-color:#0B132B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0B132B;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://www.bydproperties.rw/logo-transparent.png"
                   alt="BYD Properties Logo"
                   width="120"
                   style="display:block;height:auto;" />
            </td>
          </tr>

          <!-- Hero Card -->
          <tr>
            <td style="background:linear-gradient(160deg,#111827 0%,#1a2235 100%);border-radius:16px;border:1px solid rgba(201,168,76,0.25);overflow:hidden;">

              <!-- Gold top bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#C9A84C,#e8c96a,#C9A84C);"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:48px 48px 0;">

                    <!-- Welcome heading -->
                    <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;">
                      Welcome to the family
                    </p>
                    <h1 style="margin:0 0 24px;font-size:32px;font-weight:700;color:#ffffff;line-height:1.2;">
                      You're in! 🏠
                    </h1>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                      <tr><td style="height:1px;background:rgba(201,168,76,0.2);"></td></tr>
                    </table>

                    <p style="margin:0 0 16px;font-size:16px;color:#d1d5db;line-height:1.7;">
                      Thank you for subscribing to <strong style="color:#ffffff;">BYD Properties</strong>. You'll now be the <strong style="color:#C9A84C;">first to know</strong> about our newest exclusive property listings across Rwanda.
                    </p>

                    <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;line-height:1.7;">
                      From luxury apartments in Kigali to prime commercial spaces, we curate only the finest properties for discerning buyers and investors.
                    </p>

                  </td>
                </tr>

                <!-- Feature Pills -->
                <tr>
                  <td style="padding:0 48px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="33%" style="padding-right:8px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:16px;text-align:center;">
                                <p style="margin:0 0 6px;font-size:22px;">🏙️</p>
                                <p style="margin:0;font-size:12px;font-weight:600;color:#C9A84C;">Exclusive Listings</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="33%" style="padding:0 4px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:16px;text-align:center;">
                                <p style="margin:0 0 6px;font-size:22px;">⚡</p>
                                <p style="margin:0;font-size:12px;font-weight:600;color:#C9A84C;">First to Know</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="33%" style="padding-left:8px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:16px;text-align:center;">
                                <p style="margin:0 0 6px;font-size:22px;">🌍</p>
                                <p style="margin:0;font-size:12px;font-weight:600;color:#C9A84C;">Prime Locations</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding:0 48px 48px;text-align:center;">
                    <a href="https://www.bydproperties.rw/properties"
                       style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#e8c96a);color:#0B132B;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:10px;letter-spacing:0.02em;">
                      Browse Properties →
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                BYD Properties Ltd · Kigali, Rwanda
              </p>
              <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">
                <a href="https://www.bydproperties.rw" style="color:#C9A84C;text-decoration:none;">www.bydproperties.rw</a>
              </p>
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">
                You're receiving this because you subscribed at bydproperties.rw.<br/>
                Don't want these emails? 
                <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
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
