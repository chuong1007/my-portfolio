const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restore() {
  const tables = ['blogs', 'projects', 'project_images', 'site_content', 'pages'];
  
  console.log(`🚀 Đang chuẩn bị khôi phục database từ thư mục backups...`);

  for (const table of tables) {
    const latestPath = path.join(__dirname, 'backups', `latest_${table}.json`);
    
    if (!fs.existsSync(latestPath)) {
      console.warn(`  - [!] Không tìm thấy tệp khôi phục ${latestPath}. Bỏ qua.`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    if (data.length === 0) {
      console.warn(`  - [!] Tệp ${latestPath} trống. Bỏ qua.`);
      continue;
    }

    console.log(`- Đang đẩy ${data.length} dòng vào bảng: ${table}...`);
    
    const { error } = await supabase.from(table).upsert(data, {
      onConflict: 'id', // conflict logic
      ignoreDuplicates: false // overwrite if conflict
    });

    if (error) {
      console.error(`  ❌ Lỗi Upsert vào ${table}:`, error.message);
      continue;
    }

    console.log(`  ✅ Khôi phục thành công bảng: ${table}`);
  }

  console.log(`\n🎉 Khôi phục hoàn tất!`);
}

restore();
