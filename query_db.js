require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const res1 = await supabase.from('projects').select('*').limit(5);
  console.log('Projects:', JSON.stringify(res1, null, 2));
  
  const res2 = await supabase.from('site_content').select('*');
  console.log('Site Content:', JSON.stringify(res2, null, 2));
}
run();
