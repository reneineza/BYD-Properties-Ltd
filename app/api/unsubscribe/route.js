import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Must use service role key to bypass RLS and read/update subscriptions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(unsubscribeHTML('Invalid Link', 'This unsubscribe link is invalid or missing a token.', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Find subscription by token
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('unsubscribe_token', token)
    .maybeSingle();

  if (error) {
    console.error('Unsubscribe lookup error:', error);
    return new NextResponse(unsubscribeHTML('Error', 'Something went wrong. Please try again or contact us at alerts@bydproperties.rw.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (!data) {
    return new NextResponse(unsubscribeHTML('Link Not Found', 'This unsubscribe link is invalid or has already been used.', false), {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (data.status === 'inactive') {
    return new NextResponse(unsubscribeHTML('Already Unsubscribed', 'You have already been removed from our mailing list.', true), {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Mark as inactive
  const { error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'inactive' })
    .eq('unsubscribe_token', token);

  if (updateError) {
    console.error('Unsubscribe update error:', updateError);
    return new NextResponse(unsubscribeHTML('Error', 'Something went wrong. Please try again or contact us at alerts@bydproperties.rw.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new NextResponse(unsubscribeHTML('Unsubscribed Successfully', "You've been removed from our mailing list. We're sorry to see you go!", true), {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

function unsubscribeHTML(title, message, success) {
  // Inline SVG: CheckCircle2 (success) or XCircle (error) — matching Lucide icons used on site
  const iconSVG = success
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <path d="m9 11 3 3L22 4"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="m15 9-6 6"/>
        <path d="m9 9 6 6"/>
       </svg>`;

  const iconBg = success ? 'rgba(201,168,76,0.12)' : 'rgba(229,62,62,0.1)';
  const borderColor = success ? 'rgba(201,168,76,0.25)' : 'rgba(229,62,62,0.2)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — BYD Properties</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0B132B;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #111827;
      border: 1px solid ${borderColor};
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .gold-bar {
      height: 3px;
      background: linear-gradient(90deg, #C9A84C, #e8c96a, #C9A84C);
      border-radius: 16px 16px 0 0;
      margin: -48px -40px 40px;
    }
    .logo {
      width: 90px;
      height: auto;
      margin: 0 auto 28px;
      display: block;
    }
    .icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: ${iconBg};
      border: 1px solid ${borderColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 12px;
    }
    p {
      font-size: 15px;
      color: #9ca3af;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #C9A84C, #e8c96a);
      color: #0B132B;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 8px;
      letter-spacing: 0.02em;
    }
    .divider {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.07);
      margin: 32px 0;
    }
    .footer-note {
      font-size: 13px;
      color: #4b5563;
      margin-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="gold-bar"></div>
    <img class="logo" src="https://www.bydproperties.rw/logo-transparent.png" alt="BYD Properties Logo" />
    <div class="icon-wrap">${iconSVG}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a class="btn" href="https://www.bydproperties.rw">Back to BYD Properties</a>
    <hr class="divider" />
    <p class="footer-note">BYD Properties Ltd · Kigali, Rwanda</p>
  </div>
</body>
</html>`;
}
