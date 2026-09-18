const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('site_content').select('*').eq('id', 'about').single();
  if (error) {
    console.error("Fetch err:", error);
    return;
  }
  console.log(JSON.stringify(data.data.expandedBlocks, null, 2));
}
main();
