import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getPropertyById, updateProperty, deleteProperty, getSubscriptions } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { propertyAlertEmailHtml, agentPropertyApprovedEmailHtml, agentPropertyRejectedEmailHtml } from '@/lib/emailTemplates';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function GET(request, { params }) {
  const property = await getPropertyById(params.id);
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(property);
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Admin key missing. Please add SUPABASE_SERVICE_ROLE_KEY to your Vercel settings.' 
      }, { status: 500 });
    }

    const data = await request.json();
    const oldProperty = await getPropertyById(params.id);
    if (!oldProperty) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Agent Ownership Check
    if (session.user.role === 'agent' && oldProperty.agent_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this property' }, { status: 403 });
    }

    // Force agent edits to require approval
    if (session.user.role === 'agent') {
      data.is_approved = false;
      data.agent_id = session.user.id; // Lock it to them
    }

    const updated = await updateProperty(params.id, data);
    if (!updated) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

    // Handle Emails on Approval/Rejection status change
    if (resend && supabaseAdmin && oldProperty.is_approved !== updated.is_approved) {
      (async () => {
        try {
          const propertyUrl = `https://www.bydproperties.rw/properties/${updated.id}`;
          const agentPortalUrl = `https://www.bydproperties.rw/agent/properties`;
          
          // 1. Notify Agent (if the property belongs to an agent)
          if (updated.agent_id) {
            const { data: agentData } = await supabaseAdmin
              .from('agents')
              .select('email, name')
              .eq('id', updated.agent_id)
              .single();

            if (agentData?.email) {
              const firstName = agentData.name?.split(' ')[0] || 'Agent';
              
              if (updated.is_approved === true) {
                // Agent Approved Email
                await resend.emails.send({
                  from: 'BYD Properties <alerts@bydproperties.rw>',
                  to: agentData.email,
                  subject: 'Your Property Listing is Approved! — BYD Properties',
                  html: agentPropertyApprovedEmailHtml({ firstName, title: updated.title, propertyUrl }),
                });
              } else if (updated.is_approved === false && session.user.role === 'admin') {
                // Agent Rejected Email (only if admin un-approved it, not if agent auto-unapproved it by editing)
                await resend.emails.send({
                  from: 'BYD Properties <alerts@bydproperties.rw>',
                  to: agentData.email,
                  subject: 'Action Required: Property Listing — BYD Properties',
                  html: agentPropertyRejectedEmailHtml({ firstName, title: updated.title, agentPortalUrl }),
                });
              }
            }
          }

          // 2. Alert Subscribers (only when it becomes approved)
          if (updated.is_approved === true && oldProperty.is_approved === false) {
            const subscribers = await getSubscriptions();
            if (subscribers && subscribers.length > 0) {
              const emails = subscribers.map((s) => s.email);
              const { title, price, currency, location, images } = updated;
              
              await resend.emails.send({
                from: 'BYD Properties <alerts@bydproperties.rw>',
                to: 'info@bydproperties.rw',
                bcc: emails,
                subject: `New Listing: ${title} in ${location}`,
                html: propertyAlertEmailHtml({
                  title,
                  location,
                  price,
                  currency,
                  propertyUrl,
                  imageUrl: images?.[0] || null,
                }),
              });
            }
          }
        } catch (err) {
          console.error('Failed to send property emails:', err);
        }
      })();
    }

    revalidatePath('/');
    revalidatePath('/properties');
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ 
      error: 'Admin key missing. Please add SUPABASE_SERVICE_ROLE_KEY to your Vercel/Environment settings.' 
    }, { status: 500 });
  }

  // Agent Ownership Check
  if (session.user.role === 'agent') {
    const oldProperty = await getPropertyById(params.id);
    if (!oldProperty || oldProperty.agent_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this property' }, { status: 403 });
    }
  }

  const result = await deleteProperty(params.id);
  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Not found' }, { status: result.error ? 500 : 404 });
  }
  revalidatePath('/');
  revalidatePath('/properties');
  return NextResponse.json({ success: true });
}
