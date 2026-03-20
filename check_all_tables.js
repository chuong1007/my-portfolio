const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
const supabaseKey = keyMatch ? keyMatch[1].trim() : null;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("--- BÁO CÁO TRẠNG THÁI DATABASE ---");
  
  // 1. Kiểm tra Blogs
  const { data: blogs, error: blogErr } = await supabase.from('blogs').select('id, title');
  if (blogErr) console.error("Lỗi lấy Blogs:", blogErr.message);
  else console.log(`- Blogs: ${blogs.length} bài`);

  // 2. Kiểm tra Projects
  const { data: projects, error: projErr } = await supabase.from('projects').select('id, title');
  if (projErr) console.error("Lỗi lấy Projects:", projErr.message);
  else console.log(`- Projects: ${projects.length} dự án`);

  // 3. Kiểm tra Site Content
  const { data: content, error: contErr } = await supabase.from('site_content').select('id');
  if (contErr) console.error("Lỗi lấy Site Content:", contErr.message);
  else console.log(`- Site Content: ${content.length} mục (${content.map(c => c.id).join(', ')})`);

  console.log("---------------------------------");
}

check();
