import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getPropertyById, updateProperty, deleteProperty, getSubscriptions } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { propertyAlertEmailHtml } from '@/lib/emailTemplates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
    console.log('--- PUT /api/properties/[id] ---');
    console.log('ID:', params.id);
    console.log('IMAGES RECEIVED:', data.images);
    
    const oldProperty = await getPropertyById(params.id);
    
    const updated = await updateProperty(params.id, data);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If newly approved, send emails
    if (data.is_approved === true && oldProperty?.is_approved === false && process.env.RESEND_API_KEY) {
      (async () => {
        try {
          const subscribers = await getSubscriptions();
          if (subscribers && subscribers.length > 0) {
            const emails = subscribers.map((s) => s.email);
            const { title, price, currency, location, id, images } = updated;
            const propertyUrl = `https://www.bydproperties.rw/properties/${id}`;

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
        } catch (err) {
          console.error('Failed to send property alerts on approval:', err);
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

  const result = await deleteProperty(params.id);
  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Not found' }, { status: result.error ? 500 : 404 });
  }
  revalidatePath('/');
  revalidatePath('/properties');
  return NextResponse.json({ success: true });
}
