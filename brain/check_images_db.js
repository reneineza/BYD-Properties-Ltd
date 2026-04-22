const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProperty() {
  const id = 'faf2a960-1039-4aec-8c78-d62c1f6a3a33';
  console.log('Checking property:', id);
  const { data, error } = await supabase.from('properties').select('images').eq('id', id).single();
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('IMAGES IN DB:', data.images);
  }
}

checkProperty();
