/**
 * Recipe Importer
 * Upserts NormalizedRecipe objects into Supabase — no duplicates by slug+volume.
 */

import { supabase } from '../supabase';
import type { NormalizedRecipe, ParsedIngredient } from './recipeParser';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ImportResult {
  title: string;
  action: 'inserted' | 'updated' | 'skipped' | 'failed';
  error?: string;
}

export interface ImportSummary {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  results: ImportResult[];
}

// ─── Row Mapper ──────────────────────────────────────────────────────────────

function toRow(recipe: NormalizedRecipe) {
  return {
    title:         recipe.title,
    slug:          recipe.slug,
    category:      recipe.category,
    volume:        recipe.volume,
    author:        recipe.author || 'Abid Nasa',
    video:         recipe.videoUrl || null,
    image:         recipe.image    || null,
    ingredients:   recipe.ingredients as unknown as ParsedIngredient[],
    steps:         recipe.steps,
    notes:         recipe.notes.length > 0 ? JSON.stringify(recipe.notes) : null,
    tags:          recipe.tags,
    status:        recipe.status,
    difficulty:    recipe.difficulty,
    base_servings: recipe.base_servings,
    rating:        recipe.rating,
    is_featured:   false,
    cover_image_id: (recipe as any).cover_image_id || (recipe as any).coverImageId || null,
    hero_image:     recipe.image || null,
    hero_image_id:  (recipe as any).cover_image_id || (recipe as any).coverImageId || null,
  };
}

// ─── Upsert Logic ─────────────────────────────────────────────────────────────

/**
 * Import a batch of recipes to Supabase.
 * Checks slug+volume uniqueness before inserting or updating.
 */
export async function importRecipesToSupabase(
  recipes: NormalizedRecipe[],
  mode: 'insert-only' | 'upsert' = 'upsert'
): Promise<ImportSummary> {
  const results: ImportResult[] = [];

  for (const recipe of recipes) {
    try {
      // Skip empty recipes
      if (!recipe.title || !recipe.slug) {
        results.push({ title: recipe.title || '(no title)', action: 'skipped', error: 'Missing title or slug' });
        continue;
      }

      // Check for existing record
      const { data: existing, error: findError } = await supabase
        .from('recipes')
        .select('id')
        .eq('slug', recipe.slug)
        .eq('volume', recipe.volume)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        if (mode === 'insert-only') {
          results.push({ title: recipe.title, action: 'skipped' });
          continue;
        }
        // Update
        const { error: updateError } = await supabase
          .from('recipes')
          .update(toRow(recipe))
          .eq('id', (existing as any).id);

        if (updateError) throw updateError;
        results.push({ title: recipe.title, action: 'updated' });
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('recipes')
          .insert(toRow(recipe));

        if (insertError) throw insertError;
        results.push({ title: recipe.title, action: 'inserted' });
      }
    } catch (err: any) {
      results.push({
        title: recipe.title,
        action: 'failed',
        error: err?.message || String(err),
      });
    }
  }

  return {
    total:    results.length,
    inserted: results.filter(r => r.action === 'inserted').length,
    updated:  results.filter(r => r.action === 'updated').length,
    skipped:  results.filter(r => r.action === 'skipped').length,
    failed:   results.filter(r => r.action === 'failed').length,
    results,
  };
}

/** Import a single recipe (used by admin review flow). */
export async function importSingleRecipe(
  recipe: NormalizedRecipe
): Promise<ImportResult> {
  const summary = await importRecipesToSupabase([recipe], 'upsert');
  return summary.results[0] ?? { title: recipe.title, action: 'failed', error: 'Unknown' };
}
