const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDependencies() {
  // Check for inquiries
  const { data: inquiries, error: inqError } = await supabase.from('inquiries').select('id, property_id');
  console.log('Inquiries:', inquiries);
  
  // Check for leads
  const { data: leads, error: leadError } = await supabase.from('whatsapp_leads').select('id, property_id');
  console.log('Leads:', leads);
}

checkDependencies();
