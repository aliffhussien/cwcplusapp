/**
 * Universal Recipe Parser
 * Handles JSON arrays, embedded HTML scripts, raw text, and PDF text.
 * Parses Malay recipe ingredient strings into structured {name, amount, unit}.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ParsedIngredient {
  name: string;
  amount: string;
  unit: string;
  isSection?: boolean;
}

export interface NormalizedRecipe {
  title: string;
  slug: string;
  category: string;
  volume: string;        // "VOL 17"
  volumeNum: number;     // 17
  videoUrl: string;
  image: string;         // relative path set after image matching
  ingredients: ParsedIngredient[];
  steps: string[];
  notes: string[];
  tags: string[];
  status: 'published' | 'draft';
  difficulty: string;
  base_servings: number;
  rating: number;
}

export interface SourceVolume {
  folderName: string;
  volumeNum: number;
  volumeName: string;
  dataFile: string;   // full path
  fileType: 'json' | 'html' | 'txt';
  imageDir: string;   // folder containing images
}

// ─── Ingredient Parser ───────────────────────────────────────────────────────

const FRACS = '[½¼¾⅓⅔⅛]';
const NUM   = '\\d+(?:[.,]\\d+)?';
// Amounts: digit or fraction, optional mixed fraction, optional range
const AMOUNT_CORE = `(?:${NUM}|${FRACS})(?:${FRACS})?(?:\\s*[-–]\\s*(?:${NUM}|${FRACS}))?`;
// Units that attach directly (no space): 500g, 1kg, 250ml
const ATTACHED_UNITS = '(?:gm|kg|ml|g|L|l)';
// Units that follow a space: ordered longest-first to prevent partial matches
const WORD_UNITS = [
  'sudu besar', 'sudu kecil', 'sudu makan', 'sudu teh',
  'Tbsp', 'tsp', 'gm', 'kg', 'ml', 'cawan', 'cup',
  'biji', 'keping', 'helai', 'batang', 'tangkai', 'ulas',
  'bungkus', 'tin', 'segenggam', 'genggam', 'inci',
  'ekor', 'ikat', 'ketul', 'paket', 'g', 'L', 'l',
];
const WORD_UNIT_PATTERN = WORD_UNITS.map(u => u.replace(/\s/g, '\\s+')).join('|');
const WORD_UNIT_RE = new RegExp(`^(${WORD_UNIT_PATTERN})(?:\\s+|,|$)`, 'i');

/** Extract amount + unit from the start of a string (e.g. "1½ cawan"). */
function extractAmountUnit(text: string): { amount: string; unit: string; rest: string } | null {
  const amRe = new RegExp(`^(${AMOUNT_CORE})(${ATTACHED_UNITS})?`, 'i');
  const amM  = text.match(amRe);
  if (!amM || !amM[1].trim()) return null;

  const amount       = amM[1].trim();
  let   unit         = (amM[2] || '').trim();
  let   rest         = text.slice(amM[0].length).trim();
  if (rest.startsWith(',')) rest = rest.slice(1).trim();

  if (!unit) {
    const unitM = rest.match(WORD_UNIT_RE);
    if (unitM) {
      unit = unitM[1].trim();
      rest = rest.slice(unitM[0].length).trim();
    }
  }
  return { amount, unit, rest };
}

/** Check whether a line is a section separator (e.g. "**Bahan Kisar:**"). */
function isSection(text: string): boolean {
  if (!text) return true;
  if (text.endsWith(':') && !/\d/.test(text)) return true;
  if (/^[A-Z]\.\s/.test(text) && !text.match(/\d+\s*(g|ml|kg|cawan)/i)) return true;
  return false;
}

/** Parse a single raw ingredient string into a structured object. */
export function parseIngredient(raw: string): ParsedIngredient {
  const text = raw.trim().replace(/\*\*/g, '').trim();
  if (!text) return { name: '', amount: '', unit: '', isSection: true };

  if (isSection(text)) {
    return {
      name: text.replace(/:$/, '').trim(),
      amount: '',
      unit: '',
      isSection: true,
    };
  }

  // ── Pattern A: Leading number/fraction → "Amount Unit Name" ──
  if (/^[½¼¾⅓⅔⅛\d]/.test(text)) {
    const extracted = extractAmountUnit(text);
    if (extracted && extracted.rest) {
      return {
        name: extracted.rest,
        amount: extracted.amount,
        unit: extracted.unit,
        isSection: false,
      };
    }
  }

  // ── Pattern B: "Name [– / — / - / :] Amount" separator ──
  const separators: RegExp[] = [
    /^(.+?)\s*–\s*((?:[½¼¾⅓⅔⅛]|\d).+)$/,   // em-dash
    /^(.+?)\s*—\s*((?:[½¼¾⅓⅔⅛]|\d).+)$/,   // long dash
    /^(.+?)\s*-\s*((?:[½¼¾⅓⅔⅛]|\d).+)$/,   // hyphen (any spacing)
    /^(.+?):\s+((?:[½¼¾⅓⅔⅛]|\d).+)$/,      // colon
  ];
  for (const sep of separators) {
    const m = text.match(sep);
    if (!m) continue;
    const left  = m[1].trim();
    const right = m[2].trim();
    if (/^[½¼¾⅓⅔⅛\d]/.test(left)) continue; // left must be a name, not number
    const extracted = extractAmountUnit(right);
    if (extracted && extracted.amount) {
      return { name: left, amount: extracted.amount, unit: extracted.unit, isSection: false };
    }
  }

  // ── Pattern C: Suffix modifier ("secukupnya", "secukup rasa") ──
  const suffixM = text.match(
    /^(.+?)\s+(secukupnya|secukup\s+rasa|ikut\s+(?:citarasa|selera))(\s+.+)?$/i
  );
  if (suffixM) {
    return {
      name: suffixM[1].trim(),
      amount: (suffixM[2] + (suffixM[3] || '')).trim(),
      unit: '',
      isSection: false,
    };
  }

  // ── Pattern D: Prefix modifier ("sedikit", "segenggam", "secubit") ──
  const prefixM = text.match(/^(sedikit|segenggam|secubit|beberapa)\s+(.+)/i);
  if (prefixM) {
    return { name: prefixM[2].trim(), amount: prefixM[1].trim(), unit: '', isSection: false };
  }

  // Fallback: whole line is name, no amount extracted
  return { name: text, amount: '', unit: '', isSection: false };
}

// ─── Step Cleaner ─────────────────────────────────────────────────────────────

/** Strip leading numbering and markdown bold from a step string. */
export function cleanStep(raw: string): string {
  return raw
    .trim()
    .replace(/\*\*/g, '')
    .replace(/^\d+[\.\)\s]+/, '')
    .replace(/^Step\s+\d+\s*[–—:]\s*/i, '')
    .trim();
}

/** Returns true if the step string is a section header (e.g. "Cara Masak:"). */
function isStepSection(text: string): boolean {
  const t = text.replace(/\*\*/g, '').trim();
  if (t.endsWith(':')) return true;
  if (/^(?:Step|Langkah|Cara)\s+\d+/i.test(t)) return true;
  return false;
}

/** Parse a steps array: remove numbered prefixes, keep section labels as text. */
export function parseSteps(raw: (string | any)[]): string[] {
  return (raw || [])
    .map(s => (typeof s === 'string' ? s : s?.instruction || String(s)))
    .map(s => s.trim().replace(/\*\*/g, '').trim())
    .filter(Boolean)
    .map(s => {
      if (isStepSection(s)) return `── ${s.replace(/:$/, '').trim()} ──`;
      return cleanStep(s);
    })
    .filter(s => s.length > 2);
}

// ─── Notes / Tips ─────────────────────────────────────────────────────────────

export function parseTips(raw: (string | null | undefined)[]): string[] {
  return (raw || [])
    .map(n => (n || '').trim().replace(/\*\*/g, '').replace(/^[•\-]\s*/, '').trim())
    .filter(Boolean);
}

// ─── Slug Generator ──────────────────────────────────────────────────────────

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Category Inference ──────────────────────────────────────────────────────

const CAT_KEYWORDS: [string, string[]][] = [
  ['Desserts',  ['kek', 'cake', 'cookies', 'churros', 'brownies', 'cupcake', 'swiss roll', 'bubur', 'loaf', 'roti paung']],
  ['Breakfast', ['pancake', 'roti', 'pizza', 'tortilla', 'donut']],
  ['Sides',     ['sambal', 'cincalok', 'air asam', 'sos', 'sauce', 'dipping', 'petola', 'sayur']],
  ['Mains',     ['ayam', 'daging', 'ikan', 'sotong', 'udang', 'nasi', 'mee', 'pad thai', 'pasta', 'ramen', 'kuah', 'asam pedas']],
  ['Snacks',    ['kuih', 'snack', 'siput', 'vadai']],
];

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  for (const [cat, keywords] of CAT_KEYWORDS) {
    if (keywords.some(k => t.includes(k))) return cat;
  }
  return 'Mains';
}

// ─── Recipe Normalizer ───────────────────────────────────────────────────────

/**
 * Flatten a mixed ingredient array:
 * - string[] → as-is
 * - {section, items}[] → flatten with section headers interleaved
 * - {name, amount, unit}[] → already structured, reconstruct text
 */
function flattenIngredients(raw: any[]): string[] {
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      out.push(item);
    } else if (item && typeof item === 'object') {
      // Format: {section: "Name", items: [string]}
      if (item.section && Array.isArray(item.items)) {
        out.push(`${item.section}:`);
        out.push(...item.items.filter((s: any) => typeof s === 'string'));
      }
      // Format: {name, amount?, unit?} — already structured
      else if (item.name) {
        const parts = [item.amount, item.unit, item.name].filter(Boolean);
        out.push(parts.join(' '));
      }
    }
  }
  return out;
}

/**
 * Flatten a mixed steps array:
 * - string[] → as-is
 * - {section, steps}[] → flatten with section headers interleaved
 * - {instruction}[] → extract instruction field
 */
function flattenSteps(raw: any[]): any[] {
  const out: any[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      out.push(item);
    } else if (item && typeof item === 'object') {
      // Format: {section: "Name", steps: [string]}
      if (item.section && Array.isArray(item.steps)) {
        out.push(`${item.section}:`);
        out.push(...item.steps.filter((s: any) => typeof s === 'string'));
      }
      // Format: {instruction: string}
      else if (item.instruction) {
        out.push(item.instruction);
      }
    }
  }
  return out;
}

/** Map a raw recipe object (from any source) to NormalizedRecipe. */
export function normalizeRecipe(raw: any, volumeNum: number): NormalizedRecipe {
  const volumeName = `VOL ${volumeNum}`;
  const title      = (raw.title || raw.name || 'Untitled').trim().toUpperCase();
  const slug       = raw.slug || toSlug(title);
  const videoUrl   = raw.videoUrl || raw.VideoURL || raw.video_url || raw.video || raw.video_link || '';
  const category   = raw.category || inferCategory(title);

  // Ingredients — handle string[], {section,items}[], or {name,amount,unit}[]
  const rawIngredientsAny: any[] = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  const rawIngredients: string[] = flattenIngredients(rawIngredientsAny);
  const ingredients = rawIngredients.map(parseIngredient);

  // Steps — handle string[], {section,steps}[], or raw.instructions
  const rawStepsAny: any[] =
    Array.isArray(raw.steps)        ? raw.steps        :
    Array.isArray(raw.instructions) ? raw.instructions :
    [];
  const steps = parseSteps(flattenSteps(rawStepsAny));

  // tips / notes — `tips`, `notes`, `note`, or `tip` field
  const rawNotes: any[] = Array.isArray(raw.tips)
    ? raw.tips
    : Array.isArray(raw.notes)
      ? raw.notes
      : raw.notes
        ? [raw.notes]
        : [];
  const notes = parseTips(rawNotes);

  const tags: string[] = Array.isArray(raw.tags)
    ? raw.tags
    : [category];

  return {
    title,
    slug,
    category,
    volume: volumeName,
    volumeNum,
    videoUrl,
    image: raw.image || '',   // filled in later by image matcher
    ingredients,
    steps,
    notes,
    tags,
    status: 'published',
    difficulty: raw.difficulty || 'Easy',
    base_servings: raw.base_servings || raw.baseServings || 4,
    rating: raw.rating || 4.8,
  };
}

// ─── File Parsers ─────────────────────────────────────────────────────────────

/** Parse a JSON file containing a recipe array. */
export function parseFromJSON(jsonText: string, volumeNum: number): NormalizedRecipe[] {
  const data = JSON.parse(jsonText);
  const arr: any[] = Array.isArray(data) ? data : [data];
  return arr.map(r => normalizeRecipe(r, volumeNum));
}

/** Extract a recipes array from an HTML file.
 *  Handles multiple known variable names across CWC volumes:
 *  `recipes`, `RAW_DATA`, `RECIPES_DATA`
 */
export function parseFromHTML(html: string, volumeNum: number): NormalizedRecipe[] {
  // Try each known variable name used across different volume HTML files
  const VAR_NAMES = ['recipes', 'RAW_DATA', 'RECIPES_DATA', 'recipeData', 'data'];
  let match: RegExpMatchArray | null = null;

  for (const name of VAR_NAMES) {
    const re = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*;`);
    match = html.match(re);
    if (match) break;
  }

  if (!match) {
    console.warn(`[Parser] Could not find recipes array in HTML for VOL ${volumeNum}`);
    return [];
  }
  let jsonLike = match[1];

  // Clean up JS quirks that break JSON.parse
  jsonLike = jsonLike
    .replace(/,\s*\]/g, ']')   // trailing commas in arrays
    .replace(/,\s*\}/g, '}');  // trailing commas in objects

  const arr: any[] = JSON.parse(jsonLike);
  return arr.map(r => normalizeRecipe(r, volumeNum));
}

/** Parse raw text (e.g. from a PDF or .txt file) using heuristic section detection. */
export function parseFromText(text: string, volumeNum: number): NormalizedRecipe[] {
  const lines = text
    .split(/\n/)
    .map(l => l.trim())
    .filter(l => l && !l.match(/^---\s*PAGE\s*\d+\s*---$/i) && !l.match(/^Page\s+\d+$/i));

  const recipes: NormalizedRecipe[] = [];
  let current: any | null = null;
  let mode: 'idle' | 'ingredients' | 'steps' | 'notes' = 'idle';
  const buf: { ingredients: string[]; steps: string[]; notes: string[] } =
    { ingredients: [], steps: [], notes: [] };

  const flush = () => {
    if (!current || (!buf.ingredients.length && !buf.steps.length)) return;
    current.ingredients = buf.ingredients;
    current.steps       = buf.steps;
    current.notes       = buf.notes;
    recipes.push(normalizeRecipe(current, volumeNum));
    buf.ingredients = [];
    buf.steps       = [];
    buf.notes       = [];
    current         = null;
    mode            = 'idle';
  };

  const isTitle = (l: string) =>
    l === l.toUpperCase() && l.length >= 5 && l.length <= 80 && /[A-Z]/.test(l);

  const INGREDIENT_HDR = /^(bahan|ingredient)/i;
  const STEP_HDR       = /^(cara|langkah|step|method|arahan)/i;
  const NOTES_HDR      = /^(nota|tips?|panduan|catatan|tip extra)/i;

  for (const line of lines) {
    if (isTitle(line)) {
      flush();
      current = { title: line };
      mode    = 'idle';
      continue;
    }
    if (!current) continue;

    const low = line.toLowerCase();
    if (INGREDIENT_HDR.test(low) && line.endsWith(':')) { mode = 'ingredients'; continue; }
    if (STEP_HDR.test(low)       && line.endsWith(':')) { mode = 'steps';       continue; }
    if (NOTES_HDR.test(low))                             { mode = 'notes';       continue; }

    if (mode === 'ingredients') buf.ingredients.push(line);
    else if (mode === 'steps')  buf.steps.push(line);
    else if (mode === 'notes')  buf.notes.push(line);
  }
  flush();
  return recipes;
}

// ─── Detect & Parse Any File ─────────────────────────────────────────────────

export type FileType = 'json' | 'html' | 'txt';

export function detectFileType(filename: string, content: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'json') return 'json';
  if (ext === 'html' || ext === 'htm') return 'html';
  if (content.trimStart().startsWith('<')) return 'html';
  if (content.trimStart().startsWith('[') || content.trimStart().startsWith('{')) return 'json';
  return 'txt';
}

export function parseAnySource(
  content: string,
  filename: string,
  volumeNum: number
): NormalizedRecipe[] {
  const type = detectFileType(filename, content);
  try {
    if (type === 'json') return parseFromJSON(content, volumeNum);
    if (type === 'html') return parseFromHTML(content, volumeNum);
    return parseFromText(content, volumeNum);
  } catch (err) {
    console.error(`[Parser] Failed to parse ${filename}:`, err);
    return [];
  }
}
