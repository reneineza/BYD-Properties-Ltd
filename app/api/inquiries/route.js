import { NextResponse } from 'next/server';
import { getInquiries, createInquiry } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(getInquiries());
}

export async function POST(request) {
  const data = await request.json();
  const { name, email, phone, subject, message } = data;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const inquiry = createInquiry({ name, email, phone, subject, message, propertyId: data.propertyId || null });
  return NextResponse.json(inquiry, { status: 201 });
}
