#!/usr/bin/env tsx
/**
 * Apply VOL 18 + VOL 19 step/ingredient patches directly to Supabase.
 * Signs in as admin, then updates all recipes matched by title.
 *
 * Run:  npx tsx scripts/applyPatches.ts
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');

const SUPABASE_URL = 'https://kkfctwmrgvrinoythhqb.supabase.co';
const ANON_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmN0d21yZ3ZyaW5veXRoaHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDkyOTYsImV4cCI6MjA5MzcyNTI5Nn0.bNoT40RMfT0RJ16DiCE45RqdyHvxFlwLvepKPPe5mLI';

// Usage: npx tsx scripts/applyPatches.ts <password_or_service_role_key>
const arg = process.argv[2];
if (!arg) {
  console.error('\n❌  Usage: npx tsx scripts/applyPatches.ts <your-admin-password-or-service-role-key>\n');
  process.exit(1);
}

const isServiceRoleKey = arg.startsWith('eyJ') && arg.length > 100;
const ADMIN_EMAIL = 'ononeline30@gmail.com';

// Initialize Supabase Client (bypassing RLS if service role key is passed)
const supabase = createClient(SUPABASE_URL, isServiceRoleKey ? arg : ANON_KEY);

async function signIn(): Promise<boolean> {
  if (isServiceRoleKey) {
    console.log('✅  Using Supabase Admin Service Role Key (Bypassing Sign-in)');
    return true;
  }
  const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: arg });
  if (error) {
    console.error('\n❌  Sign-in failed:', error.message, '\n');
    return false;
  }
  console.log('✅  Signed in as', ADMIN_EMAIL);
  return true;
}

interface ManifestRecipe {
  title: string;
  steps: string[];
  ingredients: any[];
  notes: string[];
  volume: string;
  volumeNum: number;
}

async function patchVolume(volumeNum: number): Promise<void> {
  const manifestPath = path.join(ROOT, 'public', 'recipe-manifest', `vol-${volumeNum}.json`);
  if (!fs.existsSync(manifestPath)) {
    console.warn(`  ⚠  Manifest not found for VOL ${volumeNum} — run import script first`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const recipes: ManifestRecipe[] = manifest.recipes;

  console.log(`  ▸ VOL ${volumeNum}  (${recipes.length} recipes)`);

  let updated = 0, skipped = 0, failed = 0;

  for (const recipe of recipes) {
    const updates: Record<string, any> = {
      steps:       recipe.steps,
      ingredients: recipe.ingredients,
    };
    if (recipe.notes?.length) {
      updates.notes = JSON.stringify(recipe.notes);
    }

    const { error } = await supabase
      .from('recipes')
      .update(updates)
      .ilike('title', recipe.title.trim())
      .eq('volume', `VOL ${volumeNum}`);

    if (error) {
      console.error(`    ✗  ${recipe.title}: ${error.message}`);
      failed++;
    } else {
      updated++;
    }
  }

  console.log(`    ✓  ${updated} updated, ${skipped} skipped, ${failed} failed`);
}

async function run() {
  console.log('\n🍽  CWC+ Patch Applier — VOL 18 & 19\n');

  const signedIn = await signIn();
  if (!signedIn) process.exit(1);

  await patchVolume(18);
  await patchVolume(19);

  console.log('\n✅  Done! Refresh the app — steps and ingredients are now correct.\n');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
