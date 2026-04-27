import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('unsubscribe_token', token)
    .single();

  if (error || !data) {
    return new NextResponse(unsubscribeHTML('Link Expired', 'This unsubscribe link is invalid or has already been used.', false), {
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
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ status: 'inactive' })
    .eq('unsubscribe_token', token);

  if (updateError) {
    return new NextResponse(unsubscribeHTML('Error', 'Something went wrong. Please try again or contact us directly.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new NextResponse(unsubscribeHTML('Unsubscribed Successfully', `You've been removed from our mailing list. We're sorry to see you go!`, true), {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

function unsubscribeHTML(title, message, success) {
  const icon = success ? '✓' : '✕';
  const iconColor = success ? '#C9A84C' : '#e53e3e';
  const iconBg = success ? 'rgba(201,168,76,0.15)' : 'rgba(229,62,62,0.1)';

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
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .logo {
      width: 80px;
      height: auto;
      margin: 0 auto 32px;
      display: block;
    }
    .icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${iconBg};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 28px;
      color: ${iconColor};
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
    a {
      display: inline-block;
      background: linear-gradient(135deg, #C9A84C, #e8c96a);
      color: #0B132B;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 8px;
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
    <img class="logo" src="https://www.bydproperties.rw/logo-transparent.png" alt="BYD Properties Logo" />
    <div class="icon-wrap">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://www.bydproperties.rw">Back to BYD Properties</a>
    <hr class="divider" />
    <p class="footer-note">BYD Properties Ltd · Kigali, Rwanda</p>
  </div>
</body>
</html>`;
}
