import { NextResponse } from 'next/server';
import { getAgents, createAgent } from '@/lib/db';
import { getServerSession } from 'next-auth';

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

  try {
    const agent = await createAgent({
      name: fullName,
      email,
      phone,
      specialization,
      bio,
      photo_url: photoUrl,
      status: 'pending',
      // Extended fields stored in notes column as JSON for now
      // (no schema change required — stored alongside existing fields)
      notes: JSON.stringify({ nationalId, city, agencyName, experience, employment, languages, linkedIn, howHeard }),
    });
    return NextResponse.json({ success: true, id: agent.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}
