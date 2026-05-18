const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = 'https://kkfctwmrgvrinoythhqb.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmN0d21yZ3ZyaW5veXRoaHFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTI5NiwiZXhwIjoyMDkzNzI1Mjk2fQ.9ukbTf0256NvamsSPFZKOPbKABpvDjvckW3ebPAwTIg';
const client = createClient(supabaseUrl, supabaseServiceRoleKey);

const srcDir = 'c:\\Sheikh Hussien Empire\\APPS\\cwc-platform\\import-sources';
const volumes = ['CWC 14', 'CWC 15', 'cwc 16', 'CWC 17', 'CWC 18', 'CWC 19'];

async function run() {
  const videoMap = new Map(); // Title -> Video URL
  
  console.log('--- SCANNING SOURCE FILES FOR VIDEOS ---');
  
  for (const vol of volumes) {
    const volPath = path.join(srcDir, vol);
    if (!fs.existsSync(volPath)) {
      console.log(`Directory not found: ${vol}`);
      continue;
    }
    
    const files = fs.readdirSync(volPath);
    for (const file of files) {
      const filePath = path.join(volPath, file);
      if (fs.statSync(filePath).isDirectory()) continue;
      if (!['.js', '.json', '.html'].includes(path.extname(file))) continue;
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Fixed: only check for "title" to avoid skipping across recipes
      const regex = /"title"\s*:\s*"([^"]+)"(?:(?!"title")[\s\S])*?"(?:videoUrl|VideoURL|video)"\s*:\s*"([^"]*)"/gi;
      
      let match;
      let count = 0;
      while ((match = regex.exec(content)) !== null) {
        const title = match[1].trim().toUpperCase();
        const video = match[2].trim();
        if (title && video) {
          videoMap.set(title, video);
          count++;
        }
      }
      if (count > 0) {
        console.log(`${vol}/${file}: extracted ${count} video links`);
      }
    }
  }
  
  console.log(`Total unique videos extracted from sources: ${videoMap.size}`);
  
  console.log('\n--- FETCHING ALL RECIPES FROM DATABASE ---');
  const { data: recipes, error: fetchError } = await client
    .from('recipes')
    .select('id, title, video');
    
  if (fetchError) {
    console.error('Error fetching recipes:', fetchError);
    return;
  }
  
  console.log(`Total recipes in database: ${recipes.length}`);
  
  let updatedCount = 0;
  let missingCount = 0;
  
  console.log('\n--- UPDATING MISSING VIDEOS IN DATABASE ---');
  
  for (const recipe of recipes) {
    const dbTitle = recipe.title.trim().toUpperCase();
    const sourceVideo = videoMap.get(dbTitle);
    
    if (sourceVideo) {
      const currentVideo = recipe.video ? recipe.video.trim() : '';
      if (currentVideo !== sourceVideo) {
        console.log(`Updating "${recipe.title}" (ID: ${recipe.id}): "${currentVideo}" -> "${sourceVideo}"`);
        const { error: updateError } = await client
          .from('recipes')
          .update({ video: sourceVideo })
          .eq('id', recipe.id);
          
        if (updateError) {
          console.error(`Failed to update ${recipe.title}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    } else {
      if (!recipe.video || recipe.video.trim() === '') {
        missingCount++;
        console.log(`Missing video link for: "${recipe.title}" (ID: ${recipe.id})`);
      }
    }
  }
  
  console.log(`\nSync completed!`);
  console.log(`- Recipes updated with video links: ${updatedCount}`);
  console.log(`- Recipes still missing video links: ${missingCount}`);
}

run().catch(console.error);
