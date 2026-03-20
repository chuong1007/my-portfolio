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

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups', timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  const tables = ['blogs', 'projects', 'project_images', 'site_content', 'pages'];
  
  console.log(`🚀 Đang bắt đầu backup database vào thư mục: ${backupDir}...`);

  for (const table of tables) {
    console.log(`- Đang lấy dữ liệu từ bảng: ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    
    if (error) {
      console.error(`  ❌ Lỗi lấy dữ liệu từ ${table}:`, error.message);
      continue;
    }

    const filePath = path.join(backupDir, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    // Tạo bản copy "latest" để dễ khôi phục nhanh
    const latestPath = path.join(__dirname, 'backups', `latest_${table}.json`);
    fs.writeFileSync(latestPath, JSON.stringify(data, null, 2));
    
    console.log(`  ✅ Đã lưu ${data.length} dòng vào ${filePath}`);
  }

  console.log(`\n🎉 Backup hoàn tất! Bạn có thể tìm thấy dữ liệu tại: backups/${timestamp}`);
}

backup();
