import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Globe, Database,
  ChevronDown, ChevronUp, CheckCircle2,
  XCircle, Loader2, RefreshCw, BookOpen,
} from 'lucide-react';

import { parseAnySource, type NormalizedRecipe } from '../../../lib/engines/recipeParser';
import { importRecipesToSupabase, type ImportSummary } from '../../../lib/engines/recipeImporter';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VolumeManifestEntry {
  volumeNum: number;
  volumeName: string;
  recipeCount: number;
  imagesMatched: number;
  manifestFile: string;
}

interface VolumeManifest {
  volumeNum: number;
  volumeName: string;
  recipeCount: number;
  recipes: NormalizedRecipe[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FILE_ACCEPT = '.json,.html,.htm,.txt,.pdf';

function fileTypeIcon(name: string) {
  if (name.endsWith('.json')) return <Database size={14} className="text-accent" />;
  if (name.endsWith('.html') || name.endsWith('.htm')) return <Globe size={14} className="text-accent" />;
  return <FileText size={14} className="text-accent" />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecipeCard({ recipe, selected, onToggle }: {
  recipe: NormalizedRecipe;
  selected: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const realIngredients = recipe.ingredients.filter(i => !i.isSection);

  return (
    <div className={`rounded-2xl border transition-all ${selected ? 'border-accent/40 bg-accent/5' : 'border-glass-border bg-glass-bg/30'}`}>
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${selected ? 'bg-accent border-accent' : 'border-glass-border hover:border-accent/60'}`}
        >
          {selected && <CheckCircle2 size={12} className="text-text-1" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-tight text-text-1 truncate">{recipe.title}</p>
          <p className="text-[9px] text-text-3 mt-0.5">
            {recipe.category} · {realIngredients.length} bahan · {recipe.steps.length} langkah
            {recipe.notes.length > 0 && ' · ada nota'}
          </p>
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          className="text-text-3 hover:text-text-1 transition-colors shrink-0"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-glass-border">
              {/* Ingredients */}
              <div className="pt-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-text-3 mb-2">Bahan-bahan</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {recipe.ingredients.map((ing, i) =>
                    ing.isSection ? (
                      <p key={i} className="text-[9px] font-black uppercase tracking-widest text-text-3 pt-1">{ing.name}</p>
                    ) : (
                      <div key={i} className="flex justify-between text-xs text-text-2">
                        <span>{ing.name}</span>
                        {(ing.amount || ing.unit) && (
                          <span className="text-accent font-black ml-2 shrink-0">{ing.amount} {ing.unit}</span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Steps preview */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-text-3 mb-2">Langkah ({recipe.steps.length})</p>
                <ol className="space-y-1 max-h-32 overflow-y-auto">
                  {recipe.steps.slice(0, 5).map((s, i) => (
                    <li key={i} className="text-xs text-text-3 flex gap-2">
                      <span className="text-accent font-black shrink-0">{i + 1}.</span>
                      <span className="truncate">{s}</span>
                    </li>
                  ))}
                  {recipe.steps.length > 5 && (
                    <li className="text-[9px] text-text-3 italic">+{recipe.steps.length - 5} more steps…</li>
                  )}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImportResultBanner({ summary, onClose }: { summary: ImportSummary; onClose: () => void }) {
  const failed = summary.results.filter(r => r.action === 'failed');
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 space-y-2 ${failed.length ? 'border-danger/30 bg-danger/10' : 'border-accent/30 bg-accent/10'}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-text-1">
          {failed.length ? '⚠ Import Completed with Errors' : '✅ Import Successful'}
        </p>
        <button onClick={onClose} className="text-text-3 hover:text-text-1"><XCircle size={16} /></button>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[['Inserted', summary.inserted, 'text-accent'], ['Updated', summary.updated, 'text-text-2'], ['Skipped', summary.skipped, 'text-text-3'], ['Failed', summary.failed, 'text-danger']].map(([label, val, cls]) => (
          <div key={label as string} className="bg-glass-bg rounded-xl p-2">
            <p className={`text-xl font-black ${cls}`}>{val}</p>
            <p className="text-[9px] text-text-3 uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>
      {failed.length > 0 && (
        <div className="text-[10px] text-danger/80 space-y-1 mt-2">
          {failed.map(f => <p key={f.title}>✗ {f.title}: {f.error}</p>)}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecipeImporter({ showToast }: { showToast: (msg: string, type?: string) => void }) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');

  // Upload tab state
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing]       = useState(false);
  const [parsed, setParsed]         = useState<NormalizedRecipe[]>([]);
  const [selected, setSelected]     = useState<Set<number>>(new Set());
  const [fileName, setFileName]     = useState('');
  const [volNum, setVolNum]         = useState(17);
  const [importing, setImporting]   = useState(false);
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Library tab state
  const [libLoading, setLibLoading]     = useState(false);
  const [manifest, setManifest]         = useState<VolumeManifestEntry[]>([]);
  const [libImporting, setLibImporting] = useState<number | null>(null);
  const [libResult, setLibResult]       = useState<{ vol: number; summary: ImportSummary } | null>(null);

  // ── Upload handlers ──────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setParsed([]);
    setSelected(new Set());
    setImportResult(null);
    setParsing(true);
    try {
      let text: string;
      if (file.name.endsWith('.pdf')) {
        // PDF: dynamic import pdfjs-dist (if installed)
        try {
          // Dynamic import — pdfjs-dist is an optional dependency.
          // Install it with: npm install pdfjs-dist
          // @ts-ignore — module may not be installed yet
          const pdfLibName = 'pdfjs-dist';
          const pdfjsLib = await import(/* @vite-ignore */ pdfLibName) as any;
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
          const buffer = await file.arrayBuffer();
          const pdf    = await pdfjsLib.getDocument({ data: buffer }).promise;
          const pages: string[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page    = await pdf.getPage(i);
            const content = await page.getTextContent();
            pages.push((content.items as any[]).map((it: any) => it.str).join(' '));
          }
          text = pages.join('\n\n');
        } catch {
          showToast('PDF library not installed. Run: npm install pdfjs-dist', 'error');
          return;
        }
      } else {
        text = await file.text();
      }
      const recipes = parseAnySource(text, file.name, volNum);
      setParsed(recipes);
      setSelected(new Set(recipes.map((_, i) => i)));
      if (recipes.length === 0) showToast('No recipes found in this file.', 'error');
      else showToast(`Found ${recipes.length} recipes.`);
    } catch (e: any) {
      showToast(`Parse error: ${e.message}`, 'error');
    } finally {
      setParsing(false);
    }
  }, [volNum, showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleImportUpload = async () => {
    const toImport = parsed.filter((_, i) => selected.has(i));
    if (!toImport.length) return;
    setImporting(true);
    const summary = await importRecipesToSupabase(toImport, 'upsert');
    setImporting(false);
    setImportResult(summary);
    showToast(
      `Imported: ${summary.inserted} new, ${summary.updated} updated, ${summary.failed} failed.`,
      summary.failed ? 'error' : 'success'
    );
  };

  // ── Library handlers ──────────────────────────────────────────────────────

  const loadManifest = async () => {
    setLibLoading(true);
    try {
      const res = await fetch('/recipe-manifest/index.json');
      if (!res.ok) throw new Error('manifest not found');
      const data = await res.json();
      setManifest(data.volumes || []);
    } catch {
      showToast('Run the import script first: npx tsx scripts/importAllVolumes.ts', 'error');
    } finally {
      setLibLoading(false);
    }
  };

  const importVolume = async (entry: VolumeManifestEntry) => {
    setLibImporting(entry.volumeNum);
    setLibResult(null);
    try {
      const res = await fetch(entry.manifestFile);
      if (!res.ok) throw new Error('volume manifest not found');
      const data: VolumeManifest = await res.json();
      const summary = await importRecipesToSupabase(data.recipes, 'upsert');
      setLibResult({ vol: entry.volumeNum, summary });
      showToast(
        `VOL ${entry.volumeNum}: ${summary.inserted} inserted, ${summary.updated} updated`,
        summary.failed ? 'error' : 'success'
      );
    } catch (e: any) {
      showToast(`Failed: ${e.message}`, 'error');
    } finally {
      setLibImporting(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const TAB_CLS = (id: string) =>
    `flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${
      activeTab === id ? 'border-accent text-accent' : 'border-transparent text-text-3 hover:text-text-2'
    }`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-black text-text-1 italic tracking-tighter uppercase leading-none">Recipe Importer</h2>
        <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.4em] mt-2">
          Parse · Review · Import to Supabase
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-glass-border">
        <button className={TAB_CLS('upload')} onClick={() => setActiveTab('upload')}>
          Upload File
        </button>
        <button className={TAB_CLS('library')} onClick={() => { setActiveTab('library'); if (!manifest.length) loadManifest(); }}>
          Volume Library
        </button>
      </div>

      {/* ── Upload Tab ── */}
      {activeTab === 'upload' && (
        <div className="space-y-5">
          {/* Volume number + drop zone */}
          <div className="flex gap-3 items-end">
            <label className="flex flex-col gap-1.5 text-[9px] font-black uppercase tracking-widest text-text-3 w-28">
              Volume No.
              <input
                type="number"
                value={volNum}
                onChange={e => setVolNum(Number(e.target.value))}
                className="bg-glass-bg border border-glass-border rounded-xl px-3 py-2 text-sm text-text-1 outline-none focus:border-accent/60"
              />
            </label>
            <p className="text-[10px] text-text-3 mb-2 flex-1">
              Set the volume number before uploading so recipes are tagged correctly.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
              isDragging ? 'border-accent bg-accent/10' : 'border-glass-border hover:border-accent/40 hover:bg-glass-bg/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={FILE_ACCEPT}
              className="hidden"
              onChange={handleFileInput}
            />
            <Upload size={28} className="mx-auto mb-3 text-text-3" />
            <p className="text-sm font-black text-text-1">
              {isDragging ? 'Drop it!' : 'Drop recipe file here or click to browse'}
            </p>
            <p className="text-[10px] text-text-3 mt-1.5">Supports: JSON · HTML · TXT · PDF</p>
            {fileName && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                {fileTypeIcon(fileName)}
                <span className="text-[10px] font-black text-accent">{fileName}</span>
              </div>
            )}
          </div>

          {/* Parsing progress */}
          {parsing && (
            <div className="flex items-center gap-3 text-text-3">
              <Loader2 size={16} className="animate-spin text-accent" />
              <span className="text-xs font-black uppercase tracking-widest">Parsing recipes…</span>
            </div>
          )}

          {/* Import result */}
          {importResult && (
            <ImportResultBanner summary={importResult} onClose={() => setImportResult(null)} />
          )}

          {/* Recipe list */}
          {parsed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-text-3">
                  {parsed.length} recipes found · {selected.size} selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(new Set(parsed.map((_, i) => i)))}
                    className="text-[9px] font-black uppercase tracking-widest text-accent hover:text-accent-sec"
                  >
                    Select All
                  </button>
                  <span className="text-text-3">·</span>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-[9px] font-black uppercase tracking-widest text-text-3 hover:text-text-2"
                  >
                    None
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {parsed.map((recipe, i) => (
                  <RecipeCard
                    key={i}
                    recipe={recipe}
                    selected={selected.has(i)}
                    onToggle={() => toggleSelect(i)}
                  />
                ))}
              </div>

              <button
                onClick={handleImportUpload}
                disabled={importing || selected.size === 0}
                className="w-full py-3.5 bg-accent text-text-1 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-accent-sec transition-colors"
              >
                {importing
                  ? <><Loader2 size={14} className="animate-spin" /> Importing…</>
                  : <><BookOpen size={14} /> Import {selected.size} Recipe{selected.size !== 1 ? 's' : ''} to Supabase</>
                }
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Library Tab ── */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-text-3">
              Pre-processed volumes ready to import. Run the script to update.
            </p>
            <button
              onClick={loadManifest}
              disabled={libLoading}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-accent hover:text-accent-sec"
            >
              {libLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Refresh
            </button>
          </div>

          {libLoading && (
            <div className="flex items-center gap-3 text-text-3">
              <Loader2 size={16} className="animate-spin text-accent" />
              <span className="text-xs font-black uppercase tracking-widest">Loading manifest…</span>
            </div>
          )}

          {!libLoading && manifest.length === 0 && (
            <div className="rounded-2xl border border-glass-border bg-glass-bg/20 p-8 text-center space-y-3">
              <Database size={32} className="mx-auto text-text-3" />
              <p className="text-sm font-black text-text-1">No pre-processed volumes found</p>
              <p className="text-[10px] text-text-3 max-w-sm mx-auto">
                Run the import script to process all volume folders:
              </p>
              <code className="block text-[10px] bg-base border border-glass-border rounded-xl px-4 py-2 text-accent font-mono">
                npx tsx scripts/importAllVolumes.ts
              </code>
            </div>
          )}

          {manifest.length > 0 && (
            <div className="space-y-3">
              {libResult && (
                <ImportResultBanner
                  summary={libResult.summary}
                  onClose={() => setLibResult(null)}
                />
              )}
              {manifest.map(entry => (
                <div key={entry.volumeNum} className="rounded-2xl border border-glass-border bg-glass-bg/30 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 shrink-0">
                    <span className="text-xs font-black text-accent">{entry.volumeNum}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text-1">{entry.volumeName}</p>
                    <p className="text-[9px] text-text-3 mt-0.5">
                      {entry.recipeCount} recipes · {entry.imagesMatched} images matched
                    </p>
                  </div>
                  <button
                    onClick={() => importVolume(entry)}
                    disabled={libImporting === entry.volumeNum}
                    className="px-5 py-2.5 bg-accent text-text-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-50 hover:bg-accent-sec transition-colors shrink-0"
                  >
                    {libImporting === entry.volumeNum
                      ? <><Loader2 size={12} className="animate-spin" /> Importing…</>
                      : <><BookOpen size={12} /> Import</>
                    }
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-glass-border bg-base/40 p-4 text-[10px] text-text-3 space-y-1">
            <p className="font-black text-text-2 uppercase tracking-widest">Import script command</p>
            <code className="block font-mono text-accent bg-base/60 rounded-xl px-3 py-2">
              npx tsx scripts/importAllVolumes.ts
            </code>
            <p>Scans <code className="text-accent">import-sources/</code> → generates SQL + manifest → copies images to <code className="text-accent">public/images/recipes/</code></p>
          </div>
        </div>
      )}
    </div>
  );
}
