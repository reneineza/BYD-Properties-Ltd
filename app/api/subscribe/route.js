import { NextResponse } from 'next/server';
import { createSubscription } from '@/lib/db';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const data = await createSubscription(email);

    if (data && data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Send welcome email
    if (resend) {
      try {
        await resend.emails.send({
          from: 'BYD Properties <alerts@bydproperties.rw>',
          to: email,
          subject: 'Welcome to BYD Properties Alerts!',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
              <h2 style="color: #0B132B;">Welcome to BYD Properties!</h2>
              <p>Thank you for subscribing. You'll now be the first to know about our newest exclusive property listings in Rwanda.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                You can unsubscribe at any time.
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
