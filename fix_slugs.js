const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(title) {
  const from = "áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ·/_,:;";
  const to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------";
  
  let slug = title.toLowerCase().trim();
  
  for (let i = 0, l = from.length; i < l; i++) {
    slug = slug.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return slug
    .replace(/[^a-z0-9 -]/g, '') // xóa ký tự đặc biệt
    .replace(/\s+/g, '-')       // thay khoảng trắng bằng -
    .replace(/-+/g, '-')        // xóa - trùng lặp
    .replace(/^-+/, '')         // xóa - ở đầu
    .replace(/-+$/, '');        // xóa - ở cuối
}

async function fixSlugs() {
  console.log("Đang bắt đầu chuẩn hoá slug...");
  const { data: blogs, error } = await supabase.from('blogs').select('id, title');
  
  if (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    return;
  }

  console.log(`Tìm thấy ${blogs.length} bài viết.`);

  for (const blog of blogs) {
    const cleanTitle = generateSlug(blog.title);
    const newSlug = `${cleanTitle}-${blog.id.slice(0, 5)}`;
    
    const { error: updateError } = await supabase
      .from('blogs')
      .update({ slug: newSlug })
      .eq('id', blog.id);
    
    if (updateError) {
      console.error(`Lỗi update bài ${blog.title}:`, updateError);
    } else {
      console.log(`✅ OK: ${newSlug}`);
    }
  }
  
  console.log("--- HOÀN THÀNH CHUẨN HOÁ SLUG ---");
}

fixSlugs();
