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

const BACKUPS_DIR = path.join(__dirname, '..', 'backups');
const METADATA_FILE = path.join(BACKUPS_DIR, 'metadata.json');

async function incrementalBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(BACKUPS_DIR, `inc_${timestamp}`);
  
  // 1. Đọc metadata để biết mốc thời gian cuối cùng
  let metadata = {};
  if (fs.existsSync(METADATA_FILE)) {
    metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
  } else {
    console.log("ℹ️ Không tìm thấy metadata.json, sẽ thực hiện FULL BACKUP lần đầu tiên.");
    if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const tables = ['blogs', 'projects', 'project_images', 'site_content', 'pages'];
  let totalNewRows = 0;
  let summary = {};

  console.log(`🚀 Bắt đầu Incremental Backup lúc: ${new Date().toLocaleString()}...`);

  for (const table of tables) {
    const lastBackupTime = metadata[table] || '1970-01-01T00:00:00.000Z';
    console.log(`- Đang xử lý bảng: ${table} (Mốc cũ: ${lastBackupTime})...`);

    // Fetch dữ liệu mới hơn mốc cũ
    // Ưu tiên `updated_at`, fallback `created_at` nếu có, fallback không filter nếu bảng không thể filter
    let query = supabase.from(table).select('*').order('updated_at', { ascending: true });
    
    // Áp dụng filter nếu có mốc cũ
    query = query.gt('updated_at', lastBackupTime);

    const { data, error } = await query;

    if (error) {
      console.error(`  ❌ Lỗi lấy dữ liệu từ ${table}:`, error.message);
      // Fallback cho project_images nếu chưa chạy SQL script (có thể chưa có updated_at)
      if (table === 'project_images' && error.message.includes('updated_at')) {
          console.log(`  📊 Bảng ${table} chưa có updated_at, đang dùng created_at làm fallback...`);
          const { data: fallbackData, error: fallbackError } = await supabase.from(table).select('*').gt('created_at', lastBackupTime).order('created_at', { ascending: true });
          if (fallbackError) {
              console.error(`  ❌ Lỗi fallback cho ${table}:`, fallbackError.message);
              continue;
          }
          processTableData(table, fallbackData, 'created_at');
      }
      continue;
    }

    processTableData(table, data, 'updated_at');
  }

  function processTableData(table, data, timeColumn) {
    if (!data || data.length === 0) {
      console.log(`  ✅ Không có dữ liệu mới cho bảng ${table}.`);
      summary[table] = 0;
      return;
    }

    // Tạo thư mục backup nếu có dữ liệu mới
    if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder, { recursive: true });

    const filePath = path.join(backupFolder, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Tìm record mới nhất để cập nhật metadata
    const latestRecord = data[data.length - 1];
    metadata[table] = latestRecord[timeColumn];

    console.log(`  ✨ Đã lưu ${data.length} dòng mới vào ${path.basename(backupFolder)}/${table}.json`);
    totalNewRows += data.length;
    summary[table] = data.length;
  }

  // 4. Lưu lại metadata mới
  if (totalNewRows > 0) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log(`\n🎉 Backup thành công! Tổng cộng ${totalNewRows} dòng mới.`);
    console.table(summary);
  } else {
    console.log("\n😴 Không có gì thay đổi kể từ lần backup trước. Không lưu file mới.");
  }
}

incrementalBackup().catch(err => {
  console.error("💥 Lỗi nghiêm trọng khi thực hiện backup:", err);
});
