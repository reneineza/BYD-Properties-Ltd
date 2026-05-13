import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAgents, createAgent } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { agentReceivedEmailHtml } from '@/lib/emailTemplates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' }, { status: 400 });
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
    });

    // Fire confirmation email — non-blocking
    if (resend) {
      resend.emails.send({
        from: 'BYD Properties <alerts@bydproperties.rw>',
        to: email,
        subject: 'Your Agent Application Has Been Received — BYD Properties',
        html: agentReceivedEmailHtml({
          firstName: fullName.split(' ')[0],
          name: fullName,
          email,
          specialization,
          city,
        }),
      }).catch(err => console.error('Agent received email failed:', err));
    }

    return NextResponse.json({ success: true, id: agent.id }, { status: 201 });
  } catch (err) {
    // Postgres unique constraint violation
    if (err.code === '23505' || err.message?.includes('agents_email_key')) {
      return NextResponse.json(
        { error: 'An application with this email address already exists. Please use a different email or contact us at info@bydproperties.rw.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}
