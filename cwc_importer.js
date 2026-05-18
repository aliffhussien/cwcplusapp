import fs from 'fs';
import path from 'path';

// ==========================================
// Helper functions for HTML Array Extraction
// ==========================================

function parseHtmlArray(htmlContent, varName) {
  const startToken = `${varName} = [`;
  const startIdx = htmlContent.indexOf(startToken);
  if (startIdx === -1) {
    const regex = new RegExp(`${varName}\\s*=\\s*\\[`);
    const match = htmlContent.match(regex);
    if (!match) return [];
    const index = match.index;
    const sub = htmlContent.substring(index + match[0].length - 1);
    return parseBracketContent(sub);
  }
  const sub = htmlContent.substring(startIdx + startToken.length - 1);
  return parseBracketContent(sub);
}

function parseBracketContent(str) {
  let bracketCount = 0;
  let endIdx = -1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '[') bracketCount++;
    else if (str[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx !== -1) {
    const arrayStr = str.substring(0, endIdx + 1);
    try {
      // Evaluate JavaScript array safely in ES Module
      return eval(`(${arrayStr})`);
    } catch (e) {
      console.error('Eval error parsing array string:', e.message);
      return [];
    }
  }
  return [];
}

// ==========================================
// Ingredient Parser
// ==========================================

function parseIngredientString(str) {
  str = str.trim();
  if (!str) return null;

  // Clean common bullet chars
  str = str.replace(/^[-–—•*+\s]+/, '').trim();

  // Check if it's a section header (e.g. starts with A), B), or starts/ends with ** or contains "Bahan")
  const isHeader = str.startsWith('**') || str.endsWith(':') || /^[A-Z]\)\s*/.test(str) || str.toLowerCase().includes('bahan');
  if (isHeader) {
    const cleanedName = str.replace(/\*\*|:|^\s*[A-Z]\)\s*/g, '').trim();
    return {
      amount: 'secukupnya',
      unit: '',
      name: cleanedName
    };
  }

  // Regex to match quantity decimals/fractions/unicode/ranges at start
  const quantityRegex = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.\d+|\d+\s*-\s*\d+|\d+|[½¼¾⅓⅔⅛⅝⅞]|[0-9]+[½¼¾⅓⅔⅛⅝⅞]?)\s*/;
  const match = str.match(quantityRegex);

  let amount = '';
  let rest = str;

  if (match) {
    amount = match[1].trim();
    rest = str.substring(match[0].length).trim();
  }

  // Check for Malay starting quantities if no numeric quantity matched
  if (!amount) {
    const malayQuantities = ['secukupnya', 'secubit', 'sedikit', 'seulas', 'setengah', 'separuh'];
    for (const mq of malayQuantities) {
      if (rest.toLowerCase().startsWith(mq)) {
        amount = mq;
        rest = rest.substring(mq.length).trim();
        break;
      }
    }
  }

  // Unit detection
  const units = [
    'sudu kecil', 'sudu kecik', 'sudu besar', 'sudu teh', 'sudu makan',
    'cawan', 'biji', 'ulas', 'inci', 'keping', 'ikat', 'tin', 'kotak',
    'gm', 'g', 'ml', 'l', 'cup', 'cups', 'tsp', 'tbsp', 'grm', 'gram',
    'grams', 'helai', 'batang', 'kuntum', 'mangkuk', 'ketul', 'labu', 'sudu'
  ];

  let unit = '';
  // Sort by length desc to match longer words first
  units.sort((a, b) => b.length - a.length);

  for (const u of units) {
    const unitRegex = new RegExp(`^${u}\\b`, 'i');
    if (rest.match(unitRegex)) {
      unit = u;
      rest = rest.substring(u.length).trim();
      break;
    }
  }

  // Final cleanup of name
  rest = rest.replace(/^[-–—:\s]+/, '').trim();

  return {
    amount: amount || 'secukupnya',
    unit: unit,
    name: rest
  };
}

// Flatten and parse structured/nested ingredients
function formatIngredients(rawIngredients) {
  if (!rawIngredients) return [];
  if (typeof rawIngredients === 'string') {
    rawIngredients = rawIngredients.split('\n').filter(Boolean);
  }

  const formatted = [];
  
  if (Array.isArray(rawIngredients)) {
    rawIngredients.forEach(item => {
      if (typeof item === 'string') {
        const parsed = parseIngredientString(item);
        if (parsed) formatted.push(parsed);
      } else if (typeof item === 'object' && item !== null) {
        // Handle structured sections as in CWC 19
        if (item.section) {
          formatted.push({
            amount: 'secukupnya',
            unit: '',
            name: item.section.toUpperCase()
          });
        }
        if (Array.isArray(item.items)) {
          item.items.forEach(subItem => {
            const parsed = parseIngredientString(subItem);
            if (parsed) formatted.push(parsed);
          });
        } else if (Array.isArray(item.ingredients)) {
          item.ingredients.forEach(subItem => {
            const parsed = parseIngredientString(subItem);
            if (parsed) formatted.push(parsed);
          });
        } else if (item.name) {
          // If already structured
          formatted.push({
            amount: item.amount || 'secukupnya',
            unit: item.unit || '',
            name: item.name
          });
        }
      }
    });
  }

  return formatted;
}

// Flatten structured/nested steps
function formatSteps(rawSteps) {
  if (!rawSteps) return [];
  if (typeof rawSteps === 'string') {
    return rawSteps.split('\n').map(s => s.trim()).filter(Boolean);
  }

  const formatted = [];
  if (Array.isArray(rawSteps)) {
    rawSteps.forEach(step => {
      if (typeof step === 'string') {
        // Strip out leading numbers like "1. Step" or "1) Step"
        const cleanStep = step.replace(/^\d+[\.\)\s]+/, '').trim();
        if (cleanStep) formatted.push(cleanStep);
      } else if (typeof step === 'object' && step !== null) {
        if (step.section) {
          formatted.push(`**${step.section}**`);
        }
        if (Array.isArray(step.steps)) {
          step.steps.forEach(subStep => {
            const cleanSub = subStep.replace(/^\d+[\.\)\s]+/, '').trim();
            if (cleanSub) formatted.push(cleanSub);
          });
        }
      }
    });
  }
  return formatted;
}

// Extract notes into a clean array
function formatNotes(notesVal) {
  if (!notesVal) return [];
  if (Array.isArray(notesVal)) {
    return notesVal.map(n => n.trim()).filter(Boolean);
  }
  if (typeof notesVal === 'string') {
    return notesVal.split('\n').map(n => n.trim()).filter(Boolean);
  }
  return [];
}

// Extract tags into an array of lowercase strings
function formatTags(tagsVal, volumeName, category) {
  const tagsSet = new Set();
  
  // Add volume tag
  tagsSet.add(volumeName.toLowerCase().replace(/\s+/g, ''));
  tagsSet.add('premium');

  if (category) {
    tagsSet.add(category.toLowerCase().trim());
  }

  if (Array.isArray(tagsVal)) {
    tagsVal.forEach(t => tagsSet.add(t.toLowerCase().trim()));
  } else if (typeof tagsVal === 'string') {
    tagsVal.split(',').forEach(t => tagsSet.add(t.toLowerCase().trim()));
  }

  return Array.from(tagsSet).filter(Boolean);
}

// Helper to escape SQL strings
function escapeSql(str) {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// ==========================================
// MAIN INGESTION PIPELINE
// ==========================================

async function main() {
  console.log('=== STARTING CWC+ PLATFORM RECIPE INGESTION PIPELINE ===\n');

  const baseDir = 'c:\\Sheikh Hussien Empire\\APPS\\cwc-platform';
  const importSourcesDir = path.join(baseDir, 'import-sources');

  const volumes = [
    {
      volNum: 14,
      volName: 'VOL 14',
      startId: 1401,
      sourcePath: path.join(importSourcesDir, 'CWC 14', 'recipes.json'),
      imagesDir: path.join(importSourcesDir, 'CWC 14', 'image'),
      format: 'json'
    },
    {
      volNum: 15,
      volName: 'VOL 15',
      startId: 1501,
      sourcePath: path.join(importSourcesDir, 'CWC 15', 'CWC 15.json'),
      imagesDir: path.join(importSourcesDir, 'CWC 15', 'image'),
      format: 'json'
    },
    {
      volNum: 16,
      volName: 'VOL 16',
      startId: 1601,
      sourcePath: path.join(importSourcesDir, 'CWC 15', 'CWC16.json'),
      imagesDir: path.join(importSourcesDir, 'cwc 16'),
      format: 'json'
    },
    {
      volNum: 17,
      volName: 'VOL 17',
      startId: 1701,
      sourcePath: path.join(importSourcesDir, 'CWC 17', 'index.html'),
      imagesDir: path.join(importSourcesDir, 'CWC 17'),
      varName: 'recipes',
      format: 'html'
    },
    {
      volNum: 18,
      volName: 'VOL 18',
      startId: 1801,
      sourcePath: path.join(importSourcesDir, 'CWC 18', 'index.html'),
      imagesDir: path.join(importSourcesDir, 'CWC 18', 'image of CWC 18'),
      varName: 'RECIPES_DATA',
      format: 'html'
    },
    {
      volNum: 19,
      volName: 'VOL 19',
      startId: 1901,
      sourcePath: path.join(importSourcesDir, 'CWC 19', 'index.html'),
      imagesDir: path.join(importSourcesDir, 'CWC 19', 'image of CWC 19'),
      varName: 'RECIPES_DATA',
      format: 'html'
    }
  ];

  const report = [];

  for (const vol of volumes) {
    console.log(`Processing ${vol.volName}...`);
    let rawRecipes = [];

    // Step 1: Read raw files
    if (vol.format === 'json') {
      const rawData = fs.readFileSync(vol.sourcePath, 'utf8');
      rawRecipes = JSON.parse(rawData);
    } else {
      const htmlContent = fs.readFileSync(vol.sourcePath, 'utf8');
      rawRecipes = parseHtmlArray(htmlContent, vol.varName);
    }

    console.log(`- Loaded ${rawRecipes.length} recipes from source.`);

    // Prepare asset target folder
    const publicImagesSubdir = `images/recipes/cwc${vol.volNum}`;
    const targetImagesDir = path.join(baseDir, 'public', publicImagesSubdir);
    fs.mkdirSync(targetImagesDir, { recursive: true });

    let matchedImagesCount = 0;
    const sqlStatements = [];

    // Process each recipe
    rawRecipes.forEach((recipe, index) => {
      const recipeId = vol.startId + index;

      // Extract details
      const title = recipe.title || 'Untitled Recipe';
      
      // Category mapping
      let category = recipe.category || 'Mains';
      if (category.toLowerCase() === 'main') category = 'Mains';
      else if (category.toLowerCase() === 'dessert') category = 'Desserts';
      else if (category.toLowerCase() === 'snack') category = 'Snacks';
      else if (category.toLowerCase() === 'breakfast') category = 'Breakfast';
      else if (category.toLowerCase() === 'side') category = 'Sides';
      else if (category.toLowerCase() === 'condiment') category = 'Condiments';
      else if (category.toLowerCase() === 'staple') category = 'Staples';

      // Infer category from title if it was generic
      if (category === 'Mains') {
        const t = title.toLowerCase();
        if (t.includes('kek') || t.includes('puding') || t.includes('cookies') || t.includes('blondies') || t.includes('flan') || t.includes('cupcakes') || t.includes('brownies') || t.includes('donut') || t.includes('cream')) {
          category = 'Desserts';
        } else if (t.includes('air') || t.includes('lemonade') || t.includes('juice') || t.includes('teh') || t.includes('jus')) {
          category = 'Beverages';
        } else if (t.includes('cucur') || t.includes('ring') || t.includes('chips') || t.includes('popcorn') || t.includes('burger')) {
          category = 'Snacks';
        } else if (t.includes('sambal') || t.includes('sos') || t.includes('gravy') || t.includes('ranch') || t.includes('dip')) {
          category = 'Condiments';
        }
      }

      // Generate accurate slug
      const slug = recipe.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Image matching & copying
      let relativePublicImagePath = '';
      
      // Determine possible source image filenames
      const possibleFilenames = [
        `${slug}.jpeg`,
        `${slug}.jpg`,
        `${slug}.png`,
        `${slug}.webp`
      ];

      // If CWC 14 contains an explicit image path, we also extract its base name
      if (recipe.image) {
        possibleFilenames.unshift(path.basename(recipe.image));
      }

      // Special custom image mappings to guarantee 100% matches
      if (slug === 'easy-flan-crème-caramel') {
        possibleFilenames.unshift('easy-flan.jpeg');
      }

      let sourceImageFoundPath = '';
      for (const fname of possibleFilenames) {
        const fullSourcePath = path.join(vol.imagesDir, fname);
        if (fs.existsSync(fullSourcePath)) {
          sourceImageFoundPath = fullSourcePath;
          break;
        }
      }

      if (sourceImageFoundPath) {
        const ext = path.extname(sourceImageFoundPath);
        const targetFilename = `${slug}${ext}`;
        const fullTargetImagePath = path.join(targetImagesDir, targetFilename);
        
        // Copy the image file
        fs.copyFileSync(sourceImageFoundPath, fullTargetImagePath);
        relativePublicImagePath = `/${publicImagesSubdir}/${targetFilename}`;
        matchedImagesCount++;
      } else {
        // Fallback Unsplash image based on category
        let unsplashFallback = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
        if (category === 'Desserts') {
          unsplashFallback = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';
        } else if (category === 'Beverages') {
          unsplashFallback = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80';
        } else if (category === 'Snacks') {
          unsplashFallback = 'https://images.unsplash.com/photo-1534080391025-09795d197360?auto=format&fit=crop&w=800&q=80';
        }
        relativePublicImagePath = unsplashFallback;
      }

      // Ingredients structural formatting
      const formattedIngredients = formatIngredients(recipe.ingredients);
      
      // Steps formatting
      const formattedSteps = formatSteps(recipe.steps);

      // Notes formatting
      const formattedNotes = formatNotes(recipe.notes || recipe.tips);

      // Tags formatting
      const formattedTags = formatTags(recipe.tags, vol.volName, category);

      // Video URL
      const videoUrl = recipe.videoUrl || recipe.VideoURL || recipe.video_link || '';

      // Prepare database values
      const valId = recipeId;
      const valTitle = escapeSql(title);
      const valCategory = escapeSql(category);
      const valDifficulty = escapeSql(recipe.difficulty || 'Intermediate');
      const valTime = escapeSql(recipe.time || '30 min');
      const valAuthor = escapeSql('Aliff Hussien');
      const valVolume = escapeSql(vol.volName);
      const valBaseServings = recipe.base_servings || 4;
      const valRating = recipe.rating || 4.9;
      const valStatus = escapeSql('published');
      const valIsFeatured = false;
      const valIngredientsJson = JSON.stringify(formattedIngredients);
      const valStepsJson = JSON.stringify(formattedSteps);
      const valNotesJson = JSON.stringify(formattedNotes);
      const valTagsJson = JSON.stringify(formattedTags);
      const valImage = escapeSql(relativePublicImagePath);
      const valVideo = escapeSql(videoUrl);

      // Determine file name of the matched image
      const imageFilename = relativePublicImagePath.startsWith('https://') 
        ? `${slug}.jpeg` 
        : path.basename(relativePublicImagePath);

      // Construct SQL statement
      const sql = `-- Media Library Record: ${title} (ID: ${valId})
INSERT INTO public.media_library (
    id,
    filename,
    hero_url,
    thumb_url,
    card_url,
    dominant_color,
    seo_schema,
    type,
    is_primary,
    content_id,
    content_type,
    meta_data
) VALUES (
    ${valId},
    ${escapeSql(imageFilename)},
    ${valImage},
    ${valImage},
    ${valImage},
    '#0A1517',
    ${escapeSql(title)},
    'image',
    true,
    '${valId}',
    'recipe',
    '{"width": 800, "height": 800}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    filename = EXCLUDED.filename,
    hero_url = EXCLUDED.hero_url,
    thumb_url = EXCLUDED.thumb_url,
    card_url = EXCLUDED.card_url,
    dominant_color = EXCLUDED.dominant_color,
    seo_schema = EXCLUDED.seo_schema,
    type = EXCLUDED.type,
    is_primary = EXCLUDED.is_primary,
    content_id = EXCLUDED.content_id,
    content_type = EXCLUDED.content_type,
    meta_data = EXCLUDED.meta_data;

-- Recipe Record: ${title} (ID: ${valId})
INSERT INTO public.recipes (
    id,
    title, 
    category, 
    difficulty, 
    time, 
    author, 
    volume, 
    base_servings, 
    rating, 
    status, 
    is_featured, 
    ingredients, 
    steps, 
    notes, 
    tags,
    image,
    video,
    cover_image_id,
    hero_image,
    hero_image_id
) VALUES (
    ${valId},
    ${valTitle},
    ${valCategory},
    ${valDifficulty},
    ${valTime},
    ${valAuthor},
    ${valVolume},
    ${valBaseServings},
    ${valRating},
    ${valStatus},
    ${valIsFeatured},
    ${escapeSql(valIngredientsJson)}::jsonb,
    ${escapeSql(valStepsJson)}::jsonb,
    ${escapeSql(valNotesJson)}::jsonb,
    ${escapeSql(valTagsJson)}::jsonb,
    ${valImage},
    ${valVideo},
    ${valId},
    ${valImage},
    ${valId}
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    time = EXCLUDED.time,
    author = EXCLUDED.author,
    volume = EXCLUDED.volume,
    base_servings = EXCLUDED.base_servings,
    rating = EXCLUDED.rating,
    status = EXCLUDED.status,
    is_featured = EXCLUDED.is_featured,
    ingredients = EXCLUDED.ingredients,
    steps = EXCLUDED.steps,
    notes = EXCLUDED.notes,
    tags = EXCLUDED.tags,
    image = EXCLUDED.image,
    video = EXCLUDED.video,
    cover_image_id = EXCLUDED.cover_image_id,
    hero_image = EXCLUDED.hero_image,
    hero_image_id = EXCLUDED.hero_image_id;`;

      sqlStatements.push(sql);
    });

    // Write SQL script
    const sqlContent = `-- =========================================================
-- CWC+ ${vol.volName} - PRODUCTION UPSERT SQL INGESTION SCRIPT
-- Generated on May 2026
-- =========================================================

BEGIN;

${sqlStatements.join('\n\n')}

COMMIT;
`;

    const sqlFilename = `VOL_${vol.volNum}_RECIPES.sql`;
    const sqlFilePath = path.join(baseDir, sqlFilename);
    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');

    console.log(`- Matched and copied ${matchedImagesCount} / ${rawRecipes.length} images.`);
    console.log(`- Generated production SQL file: ${sqlFilename}\n`);

    report.push({
      volume: vol.volName,
      recipeCount: rawRecipes.length,
      imageCount: matchedImagesCount,
      sqlFile: sqlFilename
    });
  }

  console.log('=== PIPELINE EXECUTION COMPLETED SUCCESSFULLY ===\n');
  console.log('SUMMARY REPORT:');
  console.table(report);
}

main().catch(err => {
  console.error('Fatal error during execution:', err);
  process.exit(1);
});
