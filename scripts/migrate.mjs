import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
  const dataDir = path.join(process.cwd(), 'data');

  // --- Migrate Properties ---
  const propertiesPath = path.join(dataDir, 'properties.json');
  if (fs.existsSync(propertiesPath)) {
    const properties = JSON.parse(fs.readFileSync(propertiesPath, 'utf8'));
    console.log(`Migrating ${properties.length} properties...`);
    for (const prop of properties) {
      const mappedProp = {
        title: prop.title,
        type: prop.type,
        status: prop.status,
        price: prop.price,
        currency: prop.currency || 'RWF',
        location: prop.location,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area: prop.area,
        description: prop.description,
        images: Array.isArray(prop.images) ? prop.images : [],
        youtube_url: prop.youtubeUrl || null,
        featured: prop.featured || false,
        created_at: prop.createdAt || new Date().toISOString()
      };
      const { error } = await supabase.from('properties').insert([mappedProp]);
      if (error) console.error(`Error migrating property ${prop.title}:`, error.message);
    }
  }

  // --- Migrate Agents ---
  const agentsPath = path.join(dataDir, 'agents.json');
  if (fs.existsSync(agentsPath)) {
    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    console.log(`Migrating ${agents.length} agents...`);
    for (const agent of agents) {
      const mappedAgent = {
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        specialization: agent.specialization,
        experience: agent.experience,
        bio: agent.bio,
        photo_url: agent.photoUrl,
        status: agent.status || 'active',
        created_at: agent.createdAt || new Date().toISOString()
      };
      const { error } = await supabase.from('agents').insert([mappedAgent]);
      if (error) console.error(`Error migrating agent ${agent.name}:`, error.message);
    }
  }

  // --- Migrate Inquiries ---
  const inquiriesPath = path.join(dataDir, 'inquiries.json');
  if (fs.existsSync(inquiriesPath)) {
    const inquiries = JSON.parse(fs.readFileSync(inquiriesPath, 'utf8'));
    console.log(`Migrating ${inquiries.length} inquiries...`);
    for (const inq of inquiries) {
      const mappedInq = {
        name: inq.name,
        email: inq.email,
        phone: inq.phone,
        subject: inq.subject,
        message: inq.message,
        property_id: inq.propertyId,
        read: inq.read || false,
        responded: inq.responded || false,
        created_at: inq.createdAt || new Date().toISOString()
      };
      const { error } = await supabase.from('inquiries').insert([mappedInq]);
      if (error) console.error(`Error migrating inquiry from ${inq.name}:`, error.message);
    }
  }

  console.log('Migration finished!');
}

migrate();
