const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('properties').select('title, is_approved, location, type, status');
  if (error) {
    console.error(error);
    return;
  }
  console.log('Total properties:', data.length);
  console.log('Properties:', JSON.stringify(data, null, 2));
}

check();
