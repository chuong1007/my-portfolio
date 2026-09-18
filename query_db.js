import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function main() {
  const { data, error } = await supabase.from('site_content').select('data').eq('id', 'about').single();
  if (error) console.error(error);
  else console.log(JSON.stringify({ heading: data.data.heading, subheading: data.data.subheading }, null, 2));
}
main();
