const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("--- BÁO CÁO TRẠNG THÁI DATABASE ---");
  
  // 1. Kiểm tra Blogs
  const { data: blogs, error: blogErr } = await supabase.from('blogs').select('id, title');
  if (blogErr) console.error("- Blogs Error:", blogErr.message);
  else console.log(`- Blogs: ${blogs ? blogs.length : 0} bài`);

  // 2. Kiểm tra Projects
  const { data: projects, error: projErr } = await supabase.from('projects').select('id, title');
  if (projErr) console.error("- Projects Error:", projErr.message);
  else console.log(`- Projects: ${projects ? projects.length : 0} dự án`);

  // 3. Kiểm tra Site Content
  const { data: content, error: contErr } = await supabase.from('site_content').select('id');
  if (contErr) console.error("- Site Content Error:", contErr.message);
  else console.log(`- Site Content: ${content ? content.length : 0} mục (${content ? content.map(c => c.id).join(', ') : ''})`);

  console.log("---------------------------------");
}

check();
