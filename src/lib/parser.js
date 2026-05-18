export const advancedMultiParse = (rawText) => {
  if (!rawText.trim()) return [];

  // Line deduplication: Clean and unique lines to prevent accidental double-pastes
  const rawLines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
  const lines = [];
  const seenLines = new Set();
  rawLines.forEach(l => {
    // Filter out page markers like "Page 1", "Page 2"
    if (l.toLowerCase().match(/^page\s*\d+$/)) return;

    // Keep subtitles even if they look similar, but deduplicate actual steps/ingredients
    if (l.endsWith(':') || (l.startsWith('---') && l.endsWith('---')) || !seenLines.has(l.toLowerCase())) {
      lines.push(l);
      if (l.length > 10) seenLines.add(l.toLowerCase()); // Only dedupe significant content
    }
  });

  const recipes = [];
  const seenTitles = new Set();
  let currentRecipe = null;
  let mode = 'desc';

  const isSubtitle = (text) => {
    const t = text.trim();
    if (!t) return false;
    if (t.endsWith(':')) return true;
    if (t.startsWith('---') && t.endsWith('---')) return true;
    // All caps short line is likely a header
    return t.length < 40 && t.length > 2 && !/[\d]/.test(t) && t === t.toUpperCase();
  };

  // Metadata extraction triggers
  const metaTriggers = {
    instructor: ['INSTRUCTOR:', 'CHEF:', 'BY:', 'GURU:', 'MAESTRO:'],
    category: ['CATEGORY:', 'TYPE:', 'KATEGORI:'],
    price: ['PRICE:', 'HARGA:', 'RM', '$'],
    tier: ['TIER:', 'ACCESS:', 'LEVEL:', 'KEAHLIAN:']
  };

  lines.forEach(l => {
    const low = l.toLowerCase();
    const upper = l.toUpperCase();

    // 1. Metadata Extraction (High Priority)
    let metaFound = false;
    for (const trigger of metaTriggers.instructor) {
      if (upper.startsWith(trigger)) {
        if (!currentRecipe) currentRecipe = { title: 'Untitled Production', ingredients: [], steps: [], notes: [], tags: [], instructor: '', category: 'Cooking Class', price: '19.99', tier_required: 'Premium' };
        currentRecipe.instructor = l.substring(trigger.length).trim();
        metaFound = true; break;
      }
    }
    if (!metaFound) {
      for (const trigger of metaTriggers.category) {
        if (upper.startsWith(trigger)) {
          if (!currentRecipe) currentRecipe = { title: 'Untitled Production', ingredients: [], steps: [], notes: [], tags: [], instructor: '', category: 'Cooking Class', price: '19.99', tier_required: 'Premium' };
          currentRecipe.category = l.substring(trigger.length).trim();
          metaFound = true; break;
        }
      }
    }
    if (metaFound) return;

    // 2. Section Detection
    if (low.includes('ingredients') || low === 'bahan-bahan' || low === 'what you need') {
      mode = 'ing'; return;
    }
    if (low.includes('instructions') || low.includes('directions') || low.includes('steps') || low === 'cara-cara' || low === 'method') {
      mode = 'steps'; return;
    }
    if (low.includes('notes') || low.includes('tips') || low === 'nota') {
      mode = 'notes'; return;
    }

    // 3. New Recipe Trigger (Title)
    // If it's a short line, not a subtitle, and we are in desc mode OR we have ingredients, treat it as a new title
    if (l.length < 60 && l.length > 3 && !isSubtitle(l) && (mode === 'desc' || currentRecipe?.ingredients.length > 0)) {
      if (currentRecipe) recipes.push(currentRecipe);
      currentRecipe = {
        title: l,
        ingredients: [],
        steps: [],
        notes: [],
        tags: [],
        instructor: 'Abid Nasa',
        category: 'Mains',
        tier_required: 'Free'
      };
      mode = 'desc';
      return;
    }

    // 4. Content Collection
    if (!currentRecipe) return;

    if (mode === 'ing') {
      // Split by common separators if possible
      const parts = l.split(/[:\-]/);
      if (parts.length > 1) {
        currentRecipe.ingredients.push({ name: parts[1].trim(), amount: parts[0].trim() });
      } else {
        currentRecipe.ingredients.push({ name: l, amount: '' });
      }
    } else if (mode === 'steps') {
      // Clean up numbering (e.g. "1. Step")
      const step = l.replace(/^\d+[\.\)\s]+/, '').trim();
      if (step) currentRecipe.steps.push(step);
    } else if (mode === 'notes') {
      currentRecipe.notes.push(l);
    }
  });

  if (currentRecipe) recipes.push(currentRecipe);
  return recipes;
};
