const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumnTypes() {
  // Query information_schema
  const { data, error } = await supabase.rpc('get_column_details', { table_name: 'properties' });
  
  if (error) {
    console.log('RPC failed, trying raw query...');
    // If RPC is not defined, try to get it via select
    const { data: cols, error: err2 } = await supabase.from('properties').select('images').limit(1);
    if (cols) {
        console.log('Images type check:', typeof cols[0].images, Array.isArray(cols[0].images) ? 'Array' : 'Not Array');
        console.log('Sample images:', cols[0].images);
    }
  } else {
    console.log('Column details:', data);
  }
}

checkColumnTypes();
