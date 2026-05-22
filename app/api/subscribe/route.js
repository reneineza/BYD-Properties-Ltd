import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { welcomeEmailHtml } from '@/lib/emailTemplates';
import { z } from 'zod';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bydproperties.rw';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email format with zod (catches malformed addresses & header injection vectors)
    const emailResult = z.string().email().safeParse(email);
    if (!emailResult.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check for existing subscription
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'You are already subscribed!' }, { status: 400 });
      }
      // Reactivate if previously unsubscribed
      const token = randomUUID();
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'active', unsubscribe_token: token })
        .eq('email', email);
      await sendWelcomeEmail(email, token);
      return NextResponse.json({ success: true });
    }

    // New subscription
    const token = randomUUID();
    const { error } = await supabaseAdmin
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
      html: welcomeEmailHtml({ email, unsubscribeUrl }),
    });
  } catch (emailErr) {
    console.error('Failed to send welcome email:', emailErr);
  }
}
