const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  const id = 'd2beba83-00da-4ce9-94ff-133c6115551b';
  console.log('Testing delete for id:', id);
  const { data, error } = await supabase.from('properties').delete().eq('id', id);
  if (error) {
    console.error('DELETE ERROR:', error);
  } else {
    console.log('DELETE SUCCESS:', data);
  }
}

testDelete();
