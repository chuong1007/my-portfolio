require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = ['blogs', 'projects', 'visitors', 'page_views', 'site_content'];
const buckets = ['project-images'];

async function backup() {
  console.log("Starting backup...");
  
  // 1. Backup Database
  for (const table of tables) {
    console.log(`\nBacking up table: ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error backing up table ${table}:`, error);
      continue;
    }
    const filePath = path.join(__dirname, '../backup/database', `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`- Saved ${data.length} records to ${table}.json`);
  }
  
  // 2. Backup Storage
  for (const bucket of buckets) {
    console.log(`\nBacking up storage bucket: ${bucket}...`);
    const { data: folders, error: folderError } = await supabase.storage.from(bucket).list();
    if (folderError) {
      console.error(`Error listing files in bucket ${bucket}:`, folderError);
      continue;
    }
    
    // Recursive listing and downloading
    await backupFolder(bucket, "");
  }
}

async function backupFolder(bucket, pathInBucket) {
  const { data: files, error } = await supabase.storage.from(bucket).list(pathInBucket);
  if (error) {
      console.error(`Error listing folder ${pathInBucket} in bucket ${bucket}:`, error);
      return;
  }

  for (const file of files) {
    const fullPath = pathInBucket ? `${pathInBucket}/${file.name}` : file.name;
    
    if (file.id === null) { // This is a folder
      await backupFolder(bucket, fullPath);
    } else {
      console.log(`- Downloading ${fullPath}...`);
      const { data, downloadError } = await supabase.storage.from(bucket).download(fullPath);
      
      if (downloadError) {
        console.error(`Error downloading file ${fullPath}:`, downloadError);
        continue;
      }

      const filePath = path.join(__dirname, '../backup/storage', bucket, fullPath);
      const directoryPath = path.dirname(filePath);
      
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
    }
  }
}

backup();
