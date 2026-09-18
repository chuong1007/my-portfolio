const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: sectionData } = await supabase.from('site_content').select('*').eq('id', 'gallery').single();
  if (sectionData && sectionData.data) {
    let d = sectionData.data;
    if (d.title && d.title.fontWeight) {
      d.title.fontWeight = { desktop: '700', tablet: '700', mobile: '700' };
    } else if (d.title) {
      d.title.fontWeight = { desktop: '700', tablet: '700', mobile: '700' };
    }
    
    await supabase.from('site_content').update({ data: d }).eq('id', 'gallery');
    console.log("Updated gallery title font weight");
  }
}
run();
