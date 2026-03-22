const fs = require('fs');
const path = require('path');

const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

async function reconstruct() {
  const folders = fs.readdirSync(BACKUPS_DIR)
    .filter(f => f.startsWith('inc_'))
    .sort(); // Sắp xếp theo timestamp (tự nhiên vì định dạng ISO)

  if (folders.length === 0) {
    console.log("ℹ️ Không tìm thấy bản incremental nào trong thư mục backups.");
    return;
  }

  const tables = ['blogs', 'projects', 'project_images', 'site_content', 'pages'];
  const snapshot = {};

  console.log(`🚀 Đang tái cấu trúc database từ ${folders.length} bản backup...`);

  for (const folder of folders) {
    console.log(`- Đang đọc: ${folder}...`);
    const folderPath = path.join(BACKUPS_DIR, folder);
    
    for (const table of tables) {
      const filePath = path.join(folderPath, `${table}.json`);
      if (!fs.existsSync(filePath)) continue;

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!snapshot[table]) snapshot[table] = new Map();

      // Ghi đè record mới nhất vào Map (dùng ID làm key)
      data.forEach(item => {
        snapshot[table].set(item.id || item.slug, item); // Dùng ID (hoặc slug làm backup key)
      });
    }
  }

  // Lưu snapshot cuối cùng
  const snapshotFolder = path.join(BACKUPS_DIR, 'latest_snapshot');
  if (!fs.existsSync(snapshotFolder)) fs.mkdirSync(snapshotFolder, { recursive: true });

  for (const table in snapshot) {
    const finalData = Array.from(snapshot[table].values());
    const filePath = path.join(snapshotFolder, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2));
    console.log(`  ✅ [${table}]: Đã hoàn tất snapshot với ${finalData.length} dòng.`);
  }

  console.log(`\n🎉 Tái cấu trúc hoàn tất! Xem kết quả tại: backups/latest_snapshot/`);
}

reconstruct().catch(err => {
    console.error("💥 Lỗi khi tái cấu trúc:", err);
});
