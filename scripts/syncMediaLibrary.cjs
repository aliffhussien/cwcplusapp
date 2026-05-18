const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kkfctwmrgvrinoythhqb.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmN0d21yZ3ZyaW5veXRoaHFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTI5NiwiZXhwIjoyMDkzNzI1Mjk2fQ.9ukbTf0256NvamsSPFZKOPbKABpvDjvckW3ebPAwTIg';
const client = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
  console.log('--- SYNCING VIDEOS TO MEDIA GALLERY ---');
  
  const [mediaRes, recipesRes] = await Promise.all([
    client.from('media_library').select('hero_url').eq('type', 'video'),
    client.from('recipes').select('id, title, video').not('video', 'is', null)
  ]);
  
  if (mediaRes.error || recipesRes.error) {
    console.error('Error fetching data:', mediaRes.error || recipesRes.error);
    return;
  }
  
  const existingUrls = new Set(mediaRes.data.map(m => m.hero_url));
  const recipes = recipesRes.data.filter(r => r.video && r.video.trim() !== '');
  
  const toInsertMap = new Map();
  for (const r of recipes) {
    const url = r.video.trim();
    if (!existingUrls.has(url) && !toInsertMap.has(url)) {
      toInsertMap.set(url, {
        filename: `${r.title} Video`,
        hero_url: url,
        type: 'video',
        meta_data: { recipe_id: r.id }
      });
    }
  }
  
  const toInsert = Array.from(toInsertMap.values());
  console.log(`Total new videos to insert: ${toInsert.length}`);
  
  if (toInsert.length === 0) {
    console.log('All videos are already in the media library!');
    return;
  }
  
  const chunkSize = 50;
  let insertedCount = 0;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    const { data, error } = await client.from('media_library').insert(chunk).select('id');
    if (error) {
      console.error('Error inserting chunk:', error);
    } else {
      insertedCount += data.length;
    }
  }
  
  console.log(`Sync completed! Registered ${insertedCount} new video assets in the Admin Media Gallery.`);
}

run().catch(console.error);
