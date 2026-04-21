import { NextResponse } from 'next/server';
import { getWhatsAppLeads, createWhatsAppLead } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leads = await getWhatsAppLeads();
  return NextResponse.json(leads);
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const lead = await createWhatsAppLead(data);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
