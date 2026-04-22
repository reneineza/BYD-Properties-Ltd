import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getPropertyById, updateProperty, deleteProperty, getSubscriptions } from '@/lib/db';
import { getServerSession } from 'next-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request, { params }) {
  const property = await getPropertyById(params.id);
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(property);
}

export async function PUT(request, { params }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
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
          const formattedPrice = price ? `${currency || 'RWF'} ${price.toLocaleString()}` : 'Price on request';

          await resend.emails.send({
            from: 'BYD Properties <alerts@bydproperties.rw>',
            to: 'info@bydproperties.rw', 
            bcc: emails,
            subject: `New Listing: ${title} in ${location}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #0B132B;">New Property Listed!</h2>
                <p>A property just cleared review and is now live on BYD Properties.</p>
                <div style="margin: 20px 0; border-left: 4px solid #DF9F3D; padding-left: 15px;">
                  <h3 style="margin: 0; color: #0B132B;">${title}</h3>
                  <p style="color: #666; margin: 5px 0;">${location}</p>
                  <p style="font-weight: bold; color: #DF9F3D; margin: 5px 0;">${formattedPrice}</p>
                </div>
                ${images?.[0] ? `<img src="${images[0]}" alt="${title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />` : ''}
                <a href="${propertyUrl}" style="display: inline-block; background: #0B132B; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Property Details</a>
              </div>
            `,
          });
        }
      } catch (err) {
        console.error('Failed to send property alerts on approval:', err);
      }
    })();
  }

  return NextResponse.json(updated);
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
  return NextResponse.json({ success: true });
}
