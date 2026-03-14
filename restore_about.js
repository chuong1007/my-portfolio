const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
const supabaseKey = keyMatch ? keyMatch[1].trim() : null;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULTS = {
  heading: 'About',
  subheading: 'Senior Graphic Designer | 7 Years of Experience',
  paragraphs: [
    'Chuyên gia thiết kế với hơn 7 năm đồng hành cùng nhiều thương hiệu trong và ngoài nước. Thế mạnh của tôi là xây dựng hình ảnh chuyên nghiệp, thẩm mỹ và có chiến lược.',
    'Luôn đặt hiệu quả truyền thông và sự hài lòng của khách hàng làm trọng tâm trong mọi dự án.'
  ]
};

async function restore() {
  const { error } = await supabase
    .from('site_content')
    .upsert({ 
      id: 'about',
      data: { ...DEFAULTS, isVisible: true }, 
      updated_at: new Date().toISOString() 
    });
  
  if (error) {
    console.error("Error restoring:", error);
  } else {
    console.log("Successfully restored About section using upsert");
  }
}

restore();
