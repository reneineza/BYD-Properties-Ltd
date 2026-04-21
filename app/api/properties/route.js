import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getProperties, createProperty, getSubscriptions } from '@/lib/db';
import { getServerSession } from 'next-auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const featured = searchParams.get('featured');

  let properties = await getProperties();

  if (type && type !== 'all') {
    properties = properties.filter((p) => p.type === type);
  }
  if (status && status !== 'all') {
    properties = properties.filter((p) => p.status === status);
  }
  if (featured === 'true') {
    properties = properties.filter((p) => p.featured);
  }

  return NextResponse.json(properties);
}

export async function POST(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const property = await createProperty(data);

  // Trigger Email Alerts in background
  if (process.env.RESEND_API_KEY) {
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
            to: 'info@bydproperties.rw', // Send to self
            bcc: emails, // Hide subscriber emails from each other
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
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                <p style="color: #999; font-size: 12px;">You received this because you subscribed to property alerts on bydproperties.rw</p>
              </div>
            `,
          });
        }
      } catch (err) {
        console.error('Failed to send property alerts:', err);
      }
    })();
  }

  return NextResponse.json(property, { status: 201 });
}
