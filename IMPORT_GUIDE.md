# CWC+ Recipe Import Guide
**For the author — complete workflow from raw file to live recipe**

---

## How the System Works

```
import-sources/
  CWC 14/  →  recipes.json   ──┐
  CWC 15/  →  CWC 15.json    ──┤
  cwc 16/  →  index.html     ──┤  import script  →  SQL files  →  Supabase
  CWC 17/  →  index.html     ──┤                 →  manifest   →  Admin UI Library
  CWC 18/  →  index.html     ──┤
  CWC 19/  →  index.html     ──┘
```

The engine supports **4 file formats** across all volumes:
- `JSON array` (Vol 14, 15) — ingredients as `string[]`
- `HTML + const recipes = [...]` (Vol 17) — ingredients as `string[]`
- `HTML + const RAW_DATA = [...]` (Vol 16) — ingredients as `string[]`
- `HTML + const RECIPES_DATA = [...]` (Vol 18, 19) — ingredients as `{section, items}[]`

---

## Adding a New Volume

### Step 1 — Prepare your source file

Drop the file into the right folder:

```
import-sources/
  pdf/        ← PDF ebook files (e.g. VOL_20.pdf)
  html/       ← Exported HTML pages
  CWC 20/     ← OR create a dedicated volume folder
    index.html  (or recipes.json, or VOL_20.txt)
    slug-named-image.jpeg
    another-recipe.jpeg
```

**Image naming rule:** Name each image exactly after the recipe slug.
- Recipe title: `AYAM GORENG BERLENGAS` → slug: `ayam-goreng-berlengas` → image: `ayam-goreng-berlengas.jpeg`
- The import script matches automatically.

---

### Step 2 — Run the import script

```bash
npm run import:volumes
```

Or directly:
```bash
npx tsx scripts/importAllVolumes.ts
```

**What it does:**
1. Scans every folder in `import-sources/`
2. Finds the data file (JSON or HTML), parses all recipes
3. Parses ingredient strings into `{name, amount, unit}` structure
4. Matches images → copies to `public/images/recipes/vol-XX/`
5. Generates `import-sources/generated/VOL_XX_RECIPES.sql`
6. Generates `public/recipe-manifest/vol-XX.json` for the Admin UI

---

### Step 3 — Import to Supabase

**Option A — Admin Panel (recommended, live upsert):**
1. Open the app → Admin Panel
2. Click **Recipe Importer** in the sidebar
3. Click the **Volume Library** tab
4. Click **Refresh** to load the manifest
5. Click **Import** next to your volume
6. Done — recipes are live in Supabase instantly

**Option B — SQL file (manual, one-time):**
1. Open `import-sources/generated/VOL_XX_RECIPES.sql`
2. Go to Supabase Dashboard → SQL Editor → New Query
3. Paste and run
4. Done

---

## Uploading a Single File (Admin UI)

For one-off imports (a single PDF, HTML, or JSON):

1. Open Admin Panel → **Recipe Importer** → **Upload File** tab
2. Set the **Volume No.** (e.g. 20)
3. Drop your file or click to browse
4. Review the extracted recipes — expand each one to check
5. Deselect any you want to skip
6. Click **Import X Recipes to Supabase**

**Supported formats for upload:**
| Format | Notes |
|--------|-------|
| `.json` | JSON array of recipe objects |
| `.html` | Any of the CWC HTML formats |
| `.txt`  | Raw text (copied from PDF or typed) |
| `.pdf`  | Install `pdfjs-dist` first: `npm install pdfjs-dist` |

---

## Ingredient Parsing Rules

The parser extracts `{name, amount, unit}` from ingredient strings automatically.

| Input string | → name | → amount | → unit |
|---|---|---|---|
| `"500g ayam (dipotong)"` | `ayam (dipotong)` | `500` | `g` |
| `"1 sudu kecil garam"` | `garam` | `1` | `sudu kecil` |
| `"Tepung gandum – 1½ cawan"` | `Tepung gandum` | `1½` | `cawan` |
| `"Tepung gandum - 150g"` | `Tepung gandum` | `150` | `g` |
| `"Minyak secukupnya"` | `Minyak` | `secukupnya` | _(blank)_ |
| `"Sedikit garam"` | `garam` | `Sedikit` | _(blank)_ |
| `"**Bahan Kisar:**"` | _(section header)_ | _(blank)_ | _(blank)_ |

Section headers (lines ending with `:` or wrapped in `**`) are displayed as separators in the recipe view, not as ingredient rows.

---

## Supported Volume HTML Variable Names

| Volume | Variable name |
|--------|--------------|
| Vol 17 | `const recipes = [...]` |
| Vol 16 | `const RAW_DATA = [...]` |
| Vol 18 | `const RECIPES_DATA = [...]` |
| Vol 19 | `const RECIPES_DATA = [...]` |

If a new volume uses a different name, add it to `VAR_NAMES` in `src/lib/engines/recipeParser.ts` → `parseFromHTML()`.

---

## Volume Import Results (Last Run)

| Volume | Recipes | Images |
|--------|---------|--------|
| VOL 14 | 34 | 17/34 |
| VOL 15 | 32 | 32/32 |
| VOL 16 | 32 | 32/32 |
| VOL 17 | 28 | 28/28 |
| VOL 18 | 21 | 0/21 _(add images to folder)_ |
| VOL 19 | 32 | 0/32 _(add images to folder)_ |
| **Total** | **179** | |

---

## File Reference

| File | What it does |
|------|-------------|
| `src/lib/engines/recipeParser.ts` | Universal parser — all format handling + ingredient splitting |
| `src/lib/engines/recipeImporter.ts` | Supabase upsert engine (used by Admin UI) |
| `scripts/importAllVolumes.ts` | CLI batch processor — generates SQL + manifest |
| `src/components/admin/tabs/RecipeImporter.tsx` | Admin UI — upload or library import |
| `import-sources/generated/` | Generated SQL files (one per volume) |
| `public/recipe-manifest/` | Generated JSON manifests (used by Admin UI Library) |
| `public/images/recipes/` | Copied recipe images (served by the app) |

---

## Adding PDF Support

```bash
npm install pdfjs-dist
```

After installing, the Upload File tab in Admin Panel will accept `.pdf` files automatically. No code changes needed.

---

## Troubleshooting

**"No recipes found"**
→ The HTML variable name is unknown. Check the HTML file and add the variable name to `VAR_NAMES` in `recipeParser.ts → parseFromHTML()`.

**"0 images matched"**
→ Image files are missing or not named by slug. Name them `recipe-slug.jpeg` and drop them in the volume folder. Re-run the import script.

**Import button greyed out in Admin UI Library**
→ Run `npm run import:volumes` first to generate the manifest.

**Recipe appears without cover image**
→ Add the image later via Admin Panel → Recipe Library → edit the recipe.
