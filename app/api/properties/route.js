import { NextResponse } from 'next/server';
import { getProperties, createProperty } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const featured = searchParams.get('featured');

  let properties = getProperties();

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
  const property = createProperty(data);
  return NextResponse.json(property, { status: 201 });
}
