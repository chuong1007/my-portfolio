const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: blogs } = await supabase.from('blogs').select('*');
  console.log("Found Blogs:", JSON.stringify(blogs, null, 2));
}

check();
