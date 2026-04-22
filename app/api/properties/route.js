import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getProperties, createProperty, getSubscriptions } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

export const revalidate = 0; // Disable cache for properties list

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const featured = searchParams.get('featured');

    console.log('GET /api/properties', { type, status, location, featured });

    // If public user, only show approved
    const onlyApproved = false;
    let properties = await getProperties(null, onlyApproved);

    if (type && type !== 'all') {
      properties = properties.filter((p) => p.type === type);
    }
    if (status && status !== 'all') {
      properties = properties.filter((p) => p.status === status);
    }
    if (location && location !== 'all') {
      properties = properties.filter((p) => 
        p.location?.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (featured === 'true') {
      properties = properties.filter((p) => p.featured);
    }

    console.log('Returning properties count:', properties.length);

    return NextResponse.json(properties);
  } catch (error) {
    console.error('API Error in /api/properties:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  
  // Set approval based on role
  // Admins are auto-approved, Agents need review
  const isApproved = session.user.role === 'admin';
  const property = await createProperty({ 
    ...data, 
    is_approved: isApproved,
    agent_id: session.user.role === 'agent' ? session.user.id : (data.agent_id || null)
  });

  // ONLY Trigger Email Alerts if approved
  if (isApproved && process.env.RESEND_API_KEY) {
    (async () => {
      try {
        const subscribers = await getSubscriptions();
        if (subscribers && subscribers.length > 0) {
          const emails = subscribers.map((s) => s.email);
          const { title, price, currency, location, id, images } = property;
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
                <p>A new property matching your interest has just been added to BYD Properties.</p>
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
        console.error('Failed to send property alerts:', err);
      }
    })();
  }

  revalidatePath('/');
  revalidatePath('/properties');
  return NextResponse.json(property, { status: 201 });
}
