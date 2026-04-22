const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // USE SERVICE ROLE KEY
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  const id = 'd2beba83-00da-4ce9-94ff-133c6115551b'; // The land plot
  console.log('Testing delete with SERVICE ROLE for id:', id);
  const { data, error } = await supabase.from('properties').delete().eq('id', id);
  if (error) {
    console.error('DELETE ERROR:', error);
  } else {
    console.log('DELETE SUCCESS');
  }
  
  // Verify it's gone
  const { data: check } = await supabase.from('properties').select('id').eq('id', id);
  console.log('Check result (should be empty):', check);
}

testDelete();
