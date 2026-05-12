import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { updateAgent, deleteAgent } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { agentApprovedEmailHtml, agentRejectedEmailHtml } from '@/lib/emailTemplates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function PUT(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();

  // Detect status transition and send the right email
  if (data.status && supabaseAdmin && resend) {
    const { data: current } = await supabaseAdmin
      .from('agents')
      .select('status, name, email')
      .eq('id', params.id)
      .single();

    const previousStatus = current?.status;

    if (data.status !== previousStatus && current?.email) {
      const firstName = current.name?.split(' ')[0] || current.name;

      if (data.status === 'approved') {
        resend.emails.send({
          from: 'BYD Properties <alerts@bydproperties.rw>',
          to: current.email,
          subject: '🎉 Congratulations! Your Agent Application is Approved — BYD Properties',
          html: agentApprovedEmailHtml({
            firstName,
            name: current.name,
            email: current.email,
          }),
        }).catch(err => console.error('Approval email failed:', err));

      } else if (data.status === 'rejected') {
        resend.emails.send({
          from: 'BYD Properties <alerts@bydproperties.rw>',
          to: current.email,
          subject: 'Update on Your Agent Application — BYD Properties',
          html: agentRejectedEmailHtml({
            firstName,
            name: current.name,
          }),
        }).catch(err => console.error('Rejection email failed:', err));

        // Free up the email address so the user can reapply in the future without hitting the unique constraint
        if (!current.email.includes('+rejected_')) {
          const [localPart, domain] = current.email.split('@');
          data.email = `${localPart}+rejected_${Date.now()}@${domain || 'deleted.local'}`;
        }
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
