#!/usr/bin/env tsx
/**
 * CWC+ Batch Volume Importer
 *
 * Run:  npx tsx scripts/importAllVolumes.ts
 *
 * What it does:
 *   1. Scans import-sources/ for volume folders (CWC 14 … CWC 19)
 *   2. Finds the data file (JSON or HTML) per volume
 *   3. Parses all recipes using the universal parser
 *   4. Matches recipes to their cover images
 *   5. Copies images → public/images/recipes/vol-XX/
 *   6. Generates one SQL file per volume → import-sources/generated/VOL_XX_RECIPES.sql
 *   7. Generates public/recipe-manifest/index.json for the Admin UI
 *
 * After running:
 *   - Go to Admin Panel → Recipe Importer → Library tab
 *   - Click "Import" on each volume to push to Supabase
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import parser (no Supabase in this script — it only generates SQL + manifest)
import {
  parseFromJSON,
  parseFromHTML,
  parseFromText,
  type NormalizedRecipe,
} from '../src/lib/engines/recipeParser.js';

// ─── Paths ───────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT         = path.resolve(__dirname, '..');
const IMPORT_DIR   = path.join(ROOT, 'import-sources');
const PUBLIC_IMG   = path.join(ROOT, 'public', 'images', 'recipes');
const MANIFEST_DIR = path.join(ROOT, 'public', 'recipe-manifest');
const GENERATED    = path.join(IMPORT_DIR, 'generated');

[PUBLIC_IMG, MANIFEST_DIR, GENERATED].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── Volume Map ───────────────────────────────────────────────────────────────

interface VolumeConfig {
  folderName: string;
  volumeNum: number;
}

const KNOWN_VOLUMES: VolumeConfig[] = [
  { folderName: 'CWC 14', volumeNum: 14 },
  { folderName: 'CWC 15', volumeNum: 15 },
  { folderName: 'cwc 16', volumeNum: 16 },
  { folderName: 'CWC 17', volumeNum: 17 },
  { folderName: 'CWC 18', volumeNum: 18 },
  { folderName: 'CWC 19', volumeNum: 19 },
];

// ─── Data File Finder ─────────────────────────────────────────────────────────

/** Priority-ordered list of data file candidates per volume folder. */
function findDataFile(volDir: string, volNum: number): { file: string; type: 'json' | 'html' | 'txt' } | null {
  const candidates = [
    // JSON candidates (highest fidelity)
    { file: path.join(volDir, 'recipes.json'),             type: 'json' as const },
    { file: path.join(volDir, `CWC ${volNum}.json`),       type: 'json' as const },
    { file: path.join(volDir, `CWC${volNum}.json`),        type: 'json' as const },
    // CWC 16 is nested inside CWC 15 folder
    { file: path.join(volDir, `CWC 16/CWC16.json`),        type: 'json' as const },
    { file: path.join(volDir, `CWC 16/src/data/recipes.json`), type: 'json' as const },
    // HTML fallback
    { file: path.join(volDir, 'index.html'),               type: 'html' as const },
    // Text fallback
    { file: path.join(volDir, 'recipes.txt'),              type: 'txt'  as const },
  ];
  return candidates.find(c => fs.existsSync(c.file)) ?? null;
}

// ─── Image Matcher ────────────────────────────────────────────────────────────

function getImageFiles(volDir: string): Map<string, string> {
  const map = new Map<string, string>();
  const scan = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      if (/\.(jpe?g|png|webp)$/i.test(f)) {
        const base = f.replace(/\.(jpe?g|png|webp)$/i, '').toLowerCase();
        map.set(base, path.join(dir, f));
      }
    }
  };
  scan(volDir);
  scan(path.join(volDir, 'image'));
  return map;
}

function findMatchingImage(slug: string, images: Map<string, string>): string | null {
  // Exact slug match
  if (images.has(slug)) return images.get(slug)!;
  // Partial match: slug is contained in key or vice versa
  for (const [key, filePath] of images) {
    if (key.includes(slug) || slug.includes(key)) return filePath;
  }
  return null;
}

function copyImage(src: string, destDir: string, filename: string): string {
  fs.mkdirSync(destDir, { recursive: true });
  const ext  = path.extname(src);
  const dest = path.join(destDir, filename + ext);
  fs.copyFileSync(src, dest);
  return `/images/recipes/${path.basename(destDir)}/${filename}${ext}`;
}

// ─── SQL Generator ────────────────────────────────────────────────────────────

function escSql(s: string): string {
  return s.replace(/'/g, "''");
}

function toSqlJson(obj: unknown): string {
  return `'${escSql(JSON.stringify(obj))}'::jsonb`;
}

function toSqlText(s: string): string {
  return `'${escSql(s)}'`;
}

function generateSQL(recipes: NormalizedRecipe[], volNum: number): string {
  const lines: string[] = [
    `-- ================================================================`,
    `-- CWC+ VOL ${volNum} RECIPES  (${recipes.length} recipes)`,
    `-- Generated: ${new Date().toISOString()}`,
    `-- Run once in: Supabase > SQL Editor > New Query`,
    `-- ================================================================`,
    '',
  ];

  for (const r of recipes) {
    const ingredientsJson = toSqlJson(r.ingredients);
    const stepsJson       = toSqlJson(r.steps);
    const tagsJson        = toSqlJson(r.tags);
    const notesStr        = r.notes.length > 0 ? toSqlText(JSON.stringify(r.notes)) : 'NULL';
    const imageStr        = r.image ? toSqlText(r.image) : 'NULL';
    const videoStr        = r.videoUrl ? toSqlText(r.videoUrl) : 'NULL';

    lines.push(`-- ${r.title}`);
    lines.push(`INSERT INTO public.recipes`);
    lines.push(`  (title, slug, category, volume, status, difficulty, base_servings, rating,`);
    lines.push(`   image, video_url, ingredients, steps, notes, tags, is_featured)`);
    lines.push(`VALUES (`);
    lines.push(`  ${toSqlText(r.title)},`);
    lines.push(`  ${toSqlText(r.slug)},`);
    lines.push(`  ${toSqlText(r.category)},`);
    lines.push(`  ${toSqlText(r.volume)},`);
    lines.push(`  'published',`);
    lines.push(`  ${toSqlText(r.difficulty)},`);
    lines.push(`  ${r.base_servings},`);
    lines.push(`  ${r.rating},`);
    lines.push(`  ${imageStr},`);
    lines.push(`  ${videoStr},`);
    lines.push(`  ${ingredientsJson},`);
    lines.push(`  ${stepsJson},`);
    lines.push(`  ${notesStr},`);
    lines.push(`  ${tagsJson},`);
    lines.push(`  false`);
    lines.push(`);`);
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface VolumeReport {
  volumeNum: number;
  volumeName: string;
  recipesFound: number;
  imagesMatched: number;
  sqlFile: string;
  manifestFile: string;
  recipes: NormalizedRecipe[];
}

async function run() {
  console.log('\n🍽  CWC+ Volume Importer\n');

  const report: VolumeReport[] = [];

  for (const vol of KNOWN_VOLUMES) {
    const volDir = path.join(IMPORT_DIR, vol.folderName);
    if (!fs.existsSync(volDir)) {
      console.warn(`  ⚠  ${vol.folderName} folder not found — skipping`);
      continue;
    }

    const dataFileInfo = findDataFile(volDir, vol.volumeNum);
    if (!dataFileInfo) {
      console.warn(`  ⚠  No data file found in ${vol.folderName} — skipping`);
      continue;
    }

    console.log(`  ▸ VOL ${vol.volumeNum}  →  ${path.basename(dataFileInfo.file)} (${dataFileInfo.type})`);

    const content = fs.readFileSync(dataFileInfo.file, 'utf8');
    let recipes: NormalizedRecipe[] = [];

    try {
      if (dataFileInfo.type === 'json') recipes = parseFromJSON(content, vol.volumeNum);
      else if (dataFileInfo.type === 'html') recipes = parseFromHTML(content, vol.volumeNum);
      else recipes = parseFromText(content, vol.volumeNum);
    } catch (e) {
      console.error(`    ✗ Parse error:`, e);
      continue;
    }

    // ── Image matching & copy ──
    const imageMap    = getImageFiles(volDir);
    const destImgDir  = path.join(PUBLIC_IMG, `vol-${vol.volumeNum}`);
    let   imgMatched  = 0;

    for (const recipe of recipes) {
      const match = findMatchingImage(recipe.slug, imageMap);
      if (match) {
        recipe.image = copyImage(match, destImgDir, recipe.slug);
        imgMatched++;
      }
    }

    // ── Generate SQL ──
    const sqlContent = generateSQL(recipes, vol.volumeNum);
    const sqlFile    = path.join(GENERATED, `VOL_${vol.volumeNum}_RECIPES.sql`);
    fs.writeFileSync(sqlFile, sqlContent, 'utf8');

    // ── Volume manifest file ──
    const volManifest = {
      volumeNum: vol.volumeNum,
      volumeName: `VOL ${vol.volumeNum}`,
      recipeCount: recipes.length,
      imagesMatched: imgMatched,
      generated: new Date().toISOString(),
      recipes: recipes.map(r => ({
        title: r.title,
        slug: r.slug,
        category: r.category,
        image: r.image,
        videoUrl: r.videoUrl,
        ingredientCount: r.ingredients.filter(i => !i.isSection).length,
        stepCount: r.steps.length,
        hasNotes: r.notes.length > 0,
        // Include full data for Admin UI live import
        ingredients: r.ingredients,
        steps: r.steps,
        notes: r.notes,
        tags: r.tags,
        difficulty: r.difficulty,
        base_servings: r.base_servings,
        rating: r.rating,
        volume: r.volume,
        volumeNum: r.volumeNum,
        status: r.status,
      })),
    };

    const manifestFile = path.join(MANIFEST_DIR, `vol-${vol.volumeNum}.json`);
    fs.writeFileSync(manifestFile, JSON.stringify(volManifest, null, 2), 'utf8');

    report.push({
      volumeNum:     vol.volumeNum,
      volumeName:    `VOL ${vol.volumeNum}`,
      recipesFound:  recipes.length,
      imagesMatched: imgMatched,
      sqlFile:       path.relative(ROOT, sqlFile),
      manifestFile:  path.relative(ROOT, manifestFile),
      recipes,
    });

    console.log(`    ✓  ${recipes.length} recipes parsed, ${imgMatched}/${recipes.length} images matched`);
  }

  // ── Main manifest index ──
  const indexManifest = {
    generated: new Date().toISOString(),
    volumes: report.map(v => ({
      volumeNum:     v.volumeNum,
      volumeName:    v.volumeName,
      recipeCount:   v.recipesFound,
      imagesMatched: v.imagesMatched,
      manifestFile:  `/recipe-manifest/vol-${v.volumeNum}.json`,
      sqlFile:       v.sqlFile,
    })),
  };
  fs.writeFileSync(path.join(MANIFEST_DIR, 'index.json'), JSON.stringify(indexManifest, null, 2), 'utf8');

  // ── Final report ──
  console.log('\n─────────────────────────────────────────');
  console.log('  REPORT\n');
  for (const v of report) {
    console.log(`  VOL ${v.volumeNum}  │  ${v.recipesFound} recipes  │  ${v.imagesMatched} images matched`);
    console.log(`         SQL  → ${v.sqlFile}`);
    console.log(`         JSON → ${v.manifestFile}`);
  }
  console.log('\n  ✅  Done!');
  console.log('  SQL files ready in: import-sources/generated/');
  console.log('  Open Admin Panel → Recipe Importer → Library to import live.\n');
}

run().catch(e => { console.error(e); process.exit(1); });
