const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://kkfctwmrgvrinoythhqb.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmN0d21yZ3ZyaW5veXRoaHFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTI5NiwiZXhwIjoyMDkzNzI1Mjk2fQ.9ukbTf0256NvamsSPFZKOPbKABpvDjvckW3ebPAwTIg';
const client = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
  console.log('--- UPLOADING VOL 22 IMAGES TO SUPABASE STORAGE ---');
  
  const imagesDir = path.join(__dirname, '../public/images/recipes/cwc22');
  if (!fs.existsSync(imagesDir)) {
    console.error(`Directory not found: ${imagesDir}`);
    return;
  }

  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp'));
  console.log(`Found ${files.length} .webp files to upload.`);

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `Recipes/vol22/${file}`;

    console.log(`Uploading ${file} to ${storagePath}...`);
    
    const { data, error } = await client
      .storage
      .from('media')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) {
      console.error(`  Error uploading ${file}:`, error.message);
    } else {
      console.log(`  -> Success: ${file}`);
    }
  }
  
  console.log('Upload completed!');
}

run().catch(console.error);
